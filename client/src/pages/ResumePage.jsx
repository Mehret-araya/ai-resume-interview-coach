import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext.jsx";
import {
  getMyResumes,
  uploadResume,
} from "../api/resumeApi.js";

const ResumePage = () => {
  const { token } = useAuth();

  const [file, setFile] = useState(null);
  const [resumes, setResumes] = useState([]);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [loadingResumes, setLoadingResumes] = useState(true);

  const loadResumes = async () => {
    try {
      const data = await getMyResumes(token);

      if (data.success) {
        setResumes(data.resumes || []);
      }
    } catch (error) {
      console.error("Failed to load resumes:", error);

      setError(
        error.response?.data?.message ||
          "Unable to load your resumes"
      );
    } finally {
      setLoadingResumes(false);
    }
  };

  useEffect(() => {
    if (token) {
      loadResumes();
    }
  }, [token]);

  const handleFileChange = (event) => {
    setFile(event.target.files[0] || null);
    setMessage("");
    setError("");
  };

  const handleUpload = async (event) => {
    event.preventDefault();

    if (!file) {
      setError("Please select a PDF or DOCX file.");
      return;
    }

    setMessage("");
    setError("");
    setLoading(true);

    try {
      const data = await uploadResume(file, token);

      if (!data.success) {
        setError(data.message || "Resume upload failed");
        return;
      }

      setMessage("Resume uploaded successfully.");
      setFile(null);

      await loadResumes();
    } catch (error) {
      console.error("Resume upload error:", error);

      setError(
        error.response?.data?.message ||
          "Unable to upload resume"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h1>Resume</h1>

      <p>Upload your resume to begin the analysis process.</p>

      <form onSubmit={handleUpload}>
        <input
          type="file"
          accept=".pdf,.docx"
          onChange={handleFileChange}
        />

        {file && <p>Selected file: {file.name}</p>}

        {message && <p>{message}</p>}

        {error && <p>{error}</p>}

        <button type="submit" disabled={loading}>
          {loading ? "Uploading..." : "Upload Resume"}
        </button>
      </form>

      <hr />

      <h2>My Resumes</h2>

      {loadingResumes ? (
        <p>Loading resumes...</p>
      ) : resumes.length === 0 ? (
        <p>No resumes uploaded yet.</p>
      ) : (
        <div>
          {resumes.map((resume) => (
            <div key={resume._id}>
              <h3>{resume.originalFileName}</h3>

              <p>
                Type: {resume.mimeType}
              </p>

              <p>
                Size: {(resume.fileSize / 1024).toFixed(2)} KB
              </p>

              <p>
                Resume ID: {resume._id}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ResumePage;
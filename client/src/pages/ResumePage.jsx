import { useState } from "react";
import { useAuth } from "../context/AuthContext.jsx";
import { uploadResume } from "../api/resumeApi.js";

const ResumePage = () => {
  const { token } = useAuth();

  const [file, setFile] = useState(null);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

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
    </div>
  );
};

export default ResumePage;
import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext.jsx";
import {
  getMyResumes,
  uploadResume,
  analyzeResume,
  getMyResumeAnalyses,
} from "../api/resumeApi.js";

const ResumePage = () => {
  const { token } = useAuth();

  const [file, setFile] = useState(null);
  const [resumes, setResumes] = useState([]);
  const [analyses, setAnalyses] = useState([]);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [loadingResumes, setLoadingResumes] = useState(true);
  const [loadingAnalyses, setLoadingAnalyses] = useState(true);
  const [analyzingResumeId, setAnalyzingResumeId] = useState(null);

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

  const loadAnalyses = async () => {
    try {
      const data = await getMyResumeAnalyses(token);

      if (data.success) {
        setAnalyses(data.analyses || []);
      }
    } catch (error) {
      console.error("Failed to load resume analyses:", error);

      setError(
        error.response?.data?.message ||
          "Unable to load resume analyses"
      );
    } finally {
      setLoadingAnalyses(false);
    }
  };

  useEffect(() => {
    if (token) {
      loadResumes();
      loadAnalyses();
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

  const handleAnalyze = async (resumeId) => {
    setMessage("");
    setError("");
    setAnalyzingResumeId(resumeId);

    try {
      const data = await analyzeResume(resumeId, token);

      console.log("Resume analysis response:", data);

      if (!data.success) {
        setError(data.message || "Resume analysis failed");
        return;
      }

      setMessage("Resume analyzed successfully.");

      await loadAnalyses();
    } catch (error) {
      console.error("Resume analysis error:", error);

      setError(
        error.response?.data?.message ||
          "Unable to analyze resume"
      );
    } finally {
      setAnalyzingResumeId(null);
    }
  };

  return (
    <div>
      <h1>Resume</h1>

      <p>
        Upload your resume to begin the analysis process.
      </p>

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

              <button
                type="button"
                onClick={() => handleAnalyze(resume._id)}
                disabled={analyzingResumeId === resume._id}
              >
                {analyzingResumeId === resume._id
                  ? "Analyzing..."
                  : "Analyze Resume"}
              </button>
            </div>
          ))}
        </div>
      )}

      <hr />

      <h2>Resume Analysis</h2>

      {loadingAnalyses ? (
        <p>Loading analyses...</p>
      ) : analyses.length === 0 ? (
        <p>No resume analysis available yet.</p>
      ) : (
        <div>
          {analyses.map((analysis) => (
            <div key={analysis._id}>
              <h3>
                {analysis.resume?.originalFileName ||
                  "Resume Analysis"}
              </h3>

              <h4>Summary</h4>
              <p>{analysis.summary}</p>

              <h4>Skills</h4>
              {analysis.skills?.length > 0 ? (
                <ul>
                  {analysis.skills.map((skill, index) => (
                    <li key={index}>{skill}</li>
                  ))}
                </ul>
              ) : (
                <p>No skills recorded.</p>
              )}

              <h4>Strengths</h4>
              {analysis.strengths?.length > 0 ? (
                <ul>
                  {analysis.strengths.map((strength, index) => (
                    <li key={index}>{strength}</li>
                  ))}
                </ul>
              ) : (
                <p>No strengths recorded.</p>
              )}

              <h4>Improvement Areas</h4>
              {analysis.improvementAreas?.length > 0 ? (
                <ul>
                  {analysis.improvementAreas.map(
                    (area, index) => (
                      <li key={index}>{area}</li>
                    )
                  )}
                </ul>
              ) : (
                <p>No improvement areas recorded.</p>
              )}

              <h4>Experience Observations</h4>
              {analysis.experienceObservations?.length > 0 ? (
                <ul>
                  {analysis.experienceObservations.map(
                    (observation, index) => (
                      <li key={index}>{observation}</li>
                    )
                  )}
                </ul>
              ) : (
                <p>No experience observations recorded.</p>
              )}

              <h4>Education Observations</h4>
              {analysis.educationObservations?.length > 0 ? (
                <ul>
                  {analysis.educationObservations.map(
                    (observation, index) => (
                      <li key={index}>{observation}</li>
                    )
                  )}
                </ul>
              ) : (
                <p>No education observations recorded.</p>
              )}

              <h4>Missing Sections</h4>
              {analysis.missingSections?.length > 0 ? (
                <ul>
                  {analysis.missingSections.map(
                    (section, index) => (
                      <li key={index}>{section}</li>
                    )
                  )}
                </ul>
              ) : (
                <p>No missing sections recorded.</p>
              )}

              <h4>ATS Suggestions</h4>
              {analysis.atsSuggestions?.length > 0 ? (
                <ul>
                  {analysis.atsSuggestions.map(
                    (suggestion, index) => (
                      <li key={index}>{suggestion}</li>
                    )
                  )}
                </ul>
              ) : (
                <p>No ATS suggestions recorded.</p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ResumePage;


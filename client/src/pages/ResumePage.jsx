import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext.jsx";

import {
  getMyResumes,
  uploadResume,
  analyzeResume,
  getMyResumeAnalyses,
  rewriteResumeSection,
} from "../api/resumeApi.js";

import {
  saveResumeEditor,
  getResumeEditor,
} from "../api/resumeEditorApi.js";

import { downloadResumePdf } from "../api/resumePdfApi.js";

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

  const [rewriteSection, setRewriteSection] = useState("");
  const [originalText, setOriginalText] = useState("");
  const [rewriteInstructions, setRewriteInstructions] = useState("");
  const [rewrittenText, setRewrittenText] = useState("");
  const [rewriting, setRewriting] = useState(false);
  const [editorContent, setEditorContent] = useState("");
  const [editorLoading, setEditorLoading] = useState(false);
  const [editorSaving, setEditorSaving] = useState(false);
  const [editorMessage, setEditorMessage] = useState("");
  const [editorError, setEditorError] = useState("");
  const [pdfDownloading, setPdfDownloading] = useState(false);

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

    const loadEditor = async (resumeId) => {
    setEditorLoading(true);

    try {
      const data = await getResumeEditor(
        resumeId,
        token
      );

      if (data.success) {
        setEditorContent(data.editor?.content || "");
      }
    } catch (error) {
      if (error.response?.status === 404) {
        setEditorContent("");
        return;
      }

      console.error(
        "Failed to load resume editor:",
        error
      );

      setError(
        error.response?.data?.message ||
          "Unable to load resume editor"
      );
    } finally {
      setEditorLoading(false);
    }
  };

  
  useEffect(() => {
  if (token) {
    loadResumes();
    loadAnalyses();
  }
}, [token]);

useEffect(() => {
  if (token && resumes.length > 0) {
    loadEditor(resumes[0]._id);
  }
}, [token, resumes]);

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

  const handleRewrite = async (event) => {
    event.preventDefault();

    if (!resumes[0]?._id) {
      setError("No resume is available for rewriting.");
      return;
    }

    if (!rewriteSection.trim()) {
      setError("Please enter a resume section.");
      return;
    }

    if (!originalText.trim()) {
      setError("Please enter the original resume text.");
      return;
    }

    setMessage("");
    setError("");
    setRewrittenText("");
    setRewriting(true);

    try {
      const data = await rewriteResumeSection(
        resumes[0]._id,
        {
          section: rewriteSection,
          originalText,
          instructions: rewriteInstructions,
        },
        token
      );

      if (!data.success) {
        setError(
          data.message || "Resume rewrite failed"
        );
        return;
      }

      setRewrittenText(
        data.rewrite?.rewrittenText || ""
      );

      setMessage("Resume section rewritten successfully.");
    } catch (error) {
      console.error("Resume rewrite error:", error);

      setError(
        error.response?.data?.message ||
          "Unable to rewrite resume section"
      );
    } finally {
      setRewriting(false);
    }
  };

const handleSaveEditor = async () => {
  if (!resumes[0]?._id) {
    setEditorError("No resume is available to save.");
    return;
  }

  setEditorMessage("");
  setEditorError("");
  setEditorSaving(true);

  try {
    const data = await saveResumeEditor(
      resumes[0]._id,
      editorContent,
      token
    );

    if (!data.success) {
      setEditorError(
        data.message || "Unable to save resume editor"
      );
      return;
    }

    setEditorMessage(
      "Resume editor saved successfully."
    );

    setEditorContent(
      data.editor?.content || editorContent
    );
  } catch (error) {
    console.error(
      "Save resume editor error:",
      error
    );

    setEditorError(
      error.response?.data?.message ||
        "Unable to save resume editor"
    );
  } finally {
    setEditorSaving(false);
  }
};

const handleDownloadPdf = async () => {
  if (!resumes[0]?._id) {
    setEditorError(
      "No resume is available to download."
    );
    return;
  }

  setEditorMessage("");
  setEditorError("");
  setPdfDownloading(true);

  try {
    const pdfBlob = await downloadResumePdf(
      resumes[0]._id,
      token
    );

    const url = window.URL.createObjectURL(
      pdfBlob
    );

    const link = document.createElement("a");

    link.href = url;
    link.download = "resume.pdf";

    document.body.appendChild(link);

    link.click();

    link.remove();

    window.URL.revokeObjectURL(url);

    setEditorMessage(
      "Resume PDF downloaded successfully."
    );
  } catch (error) {
    console.error(
      "Resume PDF download error:",
      error
    );

    setEditorError(
      error.response?.data?.message ||
        "Unable to download resume PDF"
    );
  } finally {
    setPdfDownloading(false);
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

        <button type="submit" disabled={loading}>
          {loading ? "Uploading..." : "Upload Resume"}
        </button>
      </form>

      {message && <p>{message}</p>}
      {error && <p>{error}</p>}

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

              <p>Type: {resume.mimeType}</p>

              <p>
                Size: {(resume.fileSize / 1024).toFixed(2)} KB
              </p>

              <p>Resume ID: {resume._id}</p>

              <button
                type="button"
                onClick={() => handleAnalyze(resume._id)}
                disabled={
                  analyzingResumeId === resume._id
                }
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
                  {analysis.strengths.map(
                    (strength, index) => (
                      <li key={index}>{strength}</li>
                    )
                  )}
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

      <hr />

      <h2>Improve Resume Section</h2>

      <form onSubmit={handleRewrite}>
        <div>
          <label>
            Resume Section
            <br />
            <input
              type="text"
              value={rewriteSection}
              onChange={(event) =>
                setRewriteSection(event.target.value)
              }
              placeholder="e.g. Professional Profile"
            />
          </label>
        </div>

        <br />

        <div>
          <label>
            Original Text
            <br />
            <textarea
              value={originalText}
              onChange={(event) =>
                setOriginalText(event.target.value)
              }
              rows="8"
              cols="70"
              placeholder="Paste the original resume section here"
            />
          </label>
        </div>

        <br />

        <div>
          <label>
            Instructions
            <br />
            <textarea
              value={rewriteInstructions}
              onChange={(event) =>
                setRewriteInstructions(event.target.value)
              }
              rows="5"
              cols="70"
              placeholder="Example: Make it clearer and more professional"
            />
          </label>
        </div>

        <br />

        <button type="submit" disabled={rewriting}>
          {rewriting
            ? "Rewriting..."
            : "Rewrite Section"}
        </button>
      </form>

      {rewrittenText && (
        <div>
          <h3>Rewritten Text</h3>
          <p>{rewrittenText}</p>
        </div>
      )}

     <hr />

<h2>Resume Editor</h2>

{editorLoading ? (
  <p>Loading resume editor...</p>
) : (
  <div>
    <textarea
      value={editorContent}
      onChange={(event) =>
        setEditorContent(event.target.value)
      }
      rows="20"
      cols="90"
      placeholder="Edit your resume content here..."
    />

    <br />
    <br />

    <button
      type="button"
      onClick={handleSaveEditor}
      disabled={editorSaving}
    >
      {editorSaving
        ? "Saving..."
        : "Save Resume"}
    </button>

    <br />
<br />

<button
  type="button"
  onClick={handleDownloadPdf}
  disabled={pdfDownloading || editorLoading}
>
  {pdfDownloading
    ? "Downloading..."
    : "Download Resume PDF"}
</button>

    {editorMessage && (
      <p>{editorMessage}</p>
    )}

    {editorError && (
      <p>{editorError}</p>
    )}
  </div>
)}



    </div>
  );
};

export default ResumePage;
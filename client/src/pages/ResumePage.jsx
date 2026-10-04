
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

  const [analyzingResumeId, setAnalyzingResumeId] =
    useState(null);

  const [selectedResumeId, setSelectedResumeId] =
    useState("");

  const [rewriteSection, setRewriteSection] =
    useState("Professional Summary");

  const [originalText, setOriginalText] = useState("");
  const [rewriteInstructions, setRewriteInstructions] =
    useState("");

  const [rewrittenText, setRewrittenText] =
    useState("");

  const [rewriting, setRewriting] =
    useState(false);

  const [editorContent, setEditorContent] =
    useState("");

  const [loadingEditor, setLoadingEditor] =
    useState(false);

  const [savingEditor, setSavingEditor] =
    useState(false);

  const [downloadingPdf, setDownloadingPdf] =
    useState(false);

  const loadResumes = async () => {
    try {
      const data = await getMyResumes(token);

      if (data.success) {
        const userResumes = data.resumes || [];

        setResumes(userResumes);

        if (
          userResumes.length > 0 &&
          !selectedResumeId
        ) {
          setSelectedResumeId(
            userResumes[0]._id
          );
        }
      }
    } catch (error) {
      console.error(
        "Failed to load resumes:",
        error
      );

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
      const data =
        await getMyResumeAnalyses(token);

      if (data.success) {
        setAnalyses(data.analyses || []);
      }
    } catch (error) {
      console.error(
        "Failed to load resume analyses:",
        error
      );

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
    setFile(
      event.target.files[0] || null
    );

    setMessage("");
    setError("");
  };

  const handleUpload = async (event) => {
    event.preventDefault();

    if (!file) {
      setError(
        "Please select a PDF or DOCX file."
      );
      return;
    }

    setMessage("");
    setError("");
    setLoading(true);

    try {
      const data = await uploadResume(
        file,
        token
      );

      if (!data.success) {
        setError(
          data.message ||
            "Resume upload failed"
        );
        return;
      }

      setMessage(
        "Resume uploaded successfully."
      );

      setFile(null);

      await loadResumes();
    } catch (error) {
      console.error(
        "Resume upload error:",
        error
      );

      setError(
        error.response?.data?.message ||
          "Unable to upload resume"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleAnalyze = async (
    resumeId
  ) => {
    setMessage("");
    setError("");

    setAnalyzingResumeId(resumeId);

    try {
      const data = await analyzeResume(
        resumeId,
        token
      );

      console.log(
        "Resume analysis response:",
        data
      );

      if (!data.success) {
        setError(
          data.message ||
            "Resume analysis failed"
        );
        return;
      }

      setMessage(
        "Resume analyzed successfully."
      );

      await loadAnalyses();
    } catch (error) {
      console.error(
        "Resume analysis error:",
        error
      );

      setError(
        error.response?.data?.message ||
          "Unable to analyze resume"
      );
    } finally {
      setAnalyzingResumeId(null);
    }
  };

  const handleRewrite = async () => {
    if (!selectedResumeId) {
      setError(
        "Please select a resume first."
      );
      return;
    }

    if (!originalText.trim()) {
      setError(
        "Please enter the original resume text."
      );
      return;
    }

    setMessage("");
    setError("");
    setRewriting(true);

    try {
      const data =
        await rewriteResumeSection(
          selectedResumeId,
          rewriteSection,
          originalText,
          rewriteInstructions,
          token
        );

      if (!data.success) {
        setError(
          data.message ||
            "Resume rewrite failed"
        );
        return;
      }

      setRewrittenText(
        data.rewrittenText || ""
      );

      setMessage(
        "Resume section rewritten successfully."
      );
    } catch (error) {
      console.error(
        "Resume rewrite error:",
        error
      );

      setError(
        error.response?.data?.message ||
          "Unable to rewrite resume section"
      );
    } finally {
      setRewriting(false);
    }
  };

  const loadEditor = async (
    resumeId
  ) => {
    if (!resumeId) {
      return;
    }

    setLoadingEditor(true);

    try {
      const data =
        await getResumeEditor(
          resumeId,
          token
        );

      if (data.success) {
        setEditorContent(
          data.editor?.content || ""
        );
      }
    } catch (error) {
      console.error(
        "Failed to load resume editor:",
        error
      );
    } finally {
      setLoadingEditor(false);
    }
  };

  useEffect(() => {
    if (token && selectedResumeId) {
      loadEditor(selectedResumeId);
    }
  }, [token, selectedResumeId]);

  const handleSaveEditor = async () => {
    if (!selectedResumeId) {
      setError(
        "Please select a resume first."
      );
      return;
    }

    setSavingEditor(true);
    setMessage("");
    setError("");

    try {
      const data =
        await saveResumeEditor(
          selectedResumeId,
          editorContent,
          token
        );

      if (!data.success) {
        setError(
          data.message ||
            "Unable to save resume editor"
        );
        return;
      }

      setMessage(
        "Resume editor saved successfully."
      );
    } catch (error) {
      console.error(
        "Save resume editor error:",
        error
      );

      setError(
        error.response?.data?.message ||
          "Unable to save resume editor"
      );
    } finally {
      setSavingEditor(false);
    }
  };

  const handleDownloadPdf = async () => {
    if (!selectedResumeId) {
      setError(
        "Please select a resume first."
      );
      return;
    }

    setDownloadingPdf(true);
    setMessage("");
    setError("");

    try {
      const blob =
        await downloadResumePdf(
          selectedResumeId,
          token
        );

      const url =
        window.URL.createObjectURL(blob);

      const link =
        document.createElement("a");

      link.href = url;
      link.download = "improved-resume.pdf";

      document.body.appendChild(link);

      link.click();

      link.remove();

      window.URL.revokeObjectURL(url);

      setMessage(
        "Resume PDF downloaded successfully."
      );
    } catch (error) {
      console.error(
        "Download resume PDF error:",
        error
      );

      setError(
        error.response?.data?.message ||
          "Unable to download resume PDF"
      );
    } finally {
      setDownloadingPdf(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white">
      {/* Background glow */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div
          className="absolute left-1/2 top-1/4 h-[650px] w-[650px] -translate-x-1/2 rounded-full blur-3xl"
          style={{
            background:
              "radial-gradient(circle, rgba(168,85,247,0.15), transparent 70%)",
          }}
        />

        <div className="absolute -left-40 top-40 h-80 w-80 rounded-full bg-purple-600/10 blur-3xl" />

        <div className="absolute -right-40 top-[45%] h-96 w-96 rounded-full bg-pink-500/10 blur-3xl" />
      </div>

      <div className="relative z-10 mx-auto max-w-6xl px-6 py-8 md:py-12">
        {/* Navigation */}
        <header className="mb-12 flex flex-col gap-6 border-b border-white/10 pb-6 md:flex-row md:items-center md:justify-between">
          <div>
            <a
              href="/dashboard"
              className="text-xl font-semibold tracking-tight text-white"
            >
              AI Resume
              <span className="text-purple-400">+</span>
              Interview Coach
            </a>

            <p className="mt-1 text-sm text-zinc-500">
              Resume improvement workspace
            </p>
          </div>

          <nav className="flex flex-wrap items-center gap-2">
            <a
              href="/dashboard"
              className="rounded-xl px-4 py-2 text-sm font-medium text-zinc-400 transition hover:bg-white/10 hover:text-white"
            >
              Dashboard
            </a>

            <a
              href="/resume"
              className="rounded-xl bg-white/10 px-4 py-2 text-sm font-medium text-white"
            >
              My Resume
            </a>

            <a
              href="/interview"
              className="rounded-xl px-4 py-2 text-sm font-medium text-zinc-400 transition hover:bg-white/10 hover:text-white"
            >
              Interview Coach
            </a>
          </nav>
        </header>

        {/* Hero */}
        <section className="py-8 text-center md:py-12">
          <p className="mb-4 text-sm uppercase tracking-[0.25em] text-zinc-500">
            AI Resume Workspace
          </p>

          <h1 className="text-5xl font-bold tracking-tight text-white md:text-6xl">
            Build a stronger resume.
          </h1>

          <p className="mx-auto mt-5 max-w-2xl text-base leading-7 text-zinc-400 md:text-lg">
            Upload your resume, analyze it with AI, improve
            your content, edit it, and generate a professional
            PDF.
          </p>
        </section>

        {/* Messages */}
        {message && (
          <div className="mb-6 rounded-2xl border border-purple-400/20 bg-purple-500/10 p-4 text-sm text-purple-300 backdrop-blur-md">
            {message}
          </div>
        )}

        {error && (
          <div className="mb-6 rounded-2xl border border-red-400/20 bg-red-500/10 p-4 text-sm text-red-300 backdrop-blur-md">
            {error}
          </div>
        )}

        {/* Upload */}
        <section className="mb-8 rounded-2xl border border-white/10 bg-white/5 p-6 shadow-[0_0_40px_rgba(168,85,247,0.15)] backdrop-blur-md md:p-8">
          <div className="mb-6">
            <p className="text-sm uppercase tracking-wider text-zinc-500">
              Step 01
            </p>

            <h2 className="mt-2 text-3xl font-semibold text-white">
              Upload your resume
            </h2>

            <p className="mt-2 text-zinc-400">
              PDF and DOCX files up to 5 MB are supported.
            </p>
          </div>

          <form
            onSubmit={handleUpload}
            className="space-y-5"
          >
            <label className="block cursor-pointer rounded-2xl border border-dashed border-white/20 bg-white/[0.03] p-8 text-center transition hover:border-purple-400/50 hover:bg-white/[0.05]">
              <input
                type="file"
                accept=".pdf,.docx"
                onChange={handleFileChange}
                className="sr-only"
              />

              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-purple-500/10 text-2xl text-purple-400">
                ↑
              </div>

              <p className="mt-4 font-medium text-white">
                Choose your resume
              </p>

              <p className="mt-1 text-sm text-zinc-500">
                Click to select a PDF or DOCX file
              </p>

              {file && (
                <p className="mt-4 text-sm text-purple-400">
                  Selected: {file.name}
                </p>
              )}
            </label>

            <button
              type="submit"
              disabled={loading}
              className="rounded-xl bg-purple-600 px-6 py-3 font-medium text-white shadow-[0_0_25px_rgba(168,85,247,0.5)] transition hover:bg-purple-500 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading
                ? "Uploading..."
                : "Upload Resume"}
            </button>
          </form>
        </section>

        {/* Resumes */}
        <section className="mb-8">
          <div className="mb-5">
            <p className="text-sm uppercase tracking-wider text-zinc-500">
              Your files
            </p>

            <h2 className="mt-2 text-3xl font-semibold text-white">
              My Resumes
            </h2>
          </div>

          {loadingResumes ? (
            <div className="rounded-2xl border border-white/10 bg-white/5 p-6 text-zinc-400 backdrop-blur-md">
              Loading resumes...
            </div>
          ) : resumes.length === 0 ? (
            <div className="rounded-2xl border border-white/10 bg-white/5 p-6 text-zinc-400 backdrop-blur-md">
              No resumes uploaded yet.
            </div>
          ) : (
            <div className="grid gap-6 md:grid-cols-2">
              {resumes.map((resume) => (
                <div
                  key={resume._id}
                  className={`rounded-2xl border p-6 backdrop-blur-md transition ${
                    selectedResumeId === resume._id
                      ? "border-purple-400/40 bg-purple-500/5 shadow-[0_0_40px_rgba(168,85,247,0.15)]"
                      : "border-white/10 bg-white/5"
                  }`}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-purple-500/10 text-purple-400">
                      CV
                    </div>

                    <button
                      type="button"
                      onClick={() =>
                        setSelectedResumeId(
                          resume._id
                        )
                      }
                      className={`rounded-xl px-4 py-2 text-sm font-medium transition ${
                        selectedResumeId === resume._id
                          ? "bg-purple-600 text-white shadow-[0_0_20px_rgba(168,85,247,0.35)]"
                          : "border border-white/20 text-white hover:bg-white/10"
                      }`}
                    >
                      {selectedResumeId === resume._id
                        ? "Selected"
                        : "Select"}
                    </button>
                  </div>

                  <h3 className="mt-6 break-words text-xl font-semibold text-white">
                    {resume.originalFileName}
                  </h3>

                  <div className="mt-4 space-y-2 text-sm text-zinc-400">
                    <p>
                      Type:{" "}
                      <span className="text-zinc-300">
                        {resume.mimeType}
                      </span>
                    </p>

                    <p>
                      Size:{" "}
                      <span className="text-zinc-300">
                        {(resume.fileSize / 1024).toFixed(
                          2
                        )}{" "}
                        KB
                      </span>
                    </p>

                    <p className="break-all">
                      Resume ID:{" "}
                      <span className="text-zinc-500">
                        {resume._id}
                      </span>
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() =>
                      handleAnalyze(resume._id)
                    }
                    disabled={
                      analyzingResumeId ===
                      resume._id
                    }
                    className="mt-6 w-full rounded-xl bg-white px-6 py-3 font-medium text-black transition hover:bg-zinc-200 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {analyzingResumeId ===
                    resume._id
                      ? "Analyzing..."
                      : "Analyze Resume"}
                  </button>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Analysis */}
        <section className="mb-8">
          <div className="mb-5">
            <p className="text-sm uppercase tracking-wider text-zinc-500">
              AI analysis
            </p>

            <h2 className="mt-2 text-3xl font-semibold text-white">
              Resume Analysis
            </h2>
          </div>

          {loadingAnalyses ? (
            <div className="rounded-2xl border border-white/10 bg-white/5 p-6 text-zinc-400 backdrop-blur-md">
              Loading analyses...
            </div>
          ) : analyses.length === 0 ? (
            <div className="rounded-2xl border border-white/10 bg-white/5 p-6 text-zinc-400 backdrop-blur-md">
              No resume analysis available yet.
            </div>
          ) : (
            <div className="space-y-6">
              {analyses.map((analysis) => (
                <div
                  key={analysis._id}
                  className="space-y-6"
                >
                  <div className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-md">
                    <h3 className="mb-4 text-lg font-semibold text-white">
                      Summary
                    </h3>

                    <p className="text-sm leading-relaxed text-zinc-300">
                      {analysis.summary}
                    </p>
                  </div>

                  <div className="grid items-stretch gap-6 md:grid-cols-2">
                    <div className="flex flex-col rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-md">
                      <h3 className="mb-4 text-lg font-semibold text-white">
                        Skills
                      </h3>

                      {analysis.skills?.length > 0 ? (
                        <div className="flex flex-wrap gap-2">
                          {analysis.skills.map(
                            (skill, index) => (
                              <span
                                key={index}
                                className="rounded-full border border-purple-500/20 bg-purple-500/10 px-3 py-1.5 text-sm text-purple-100"
                              >
                                {skill}
                              </span>
                            )
                          )}
                        </div>
                      ) : (
                        <p className="text-sm leading-relaxed text-zinc-500">
                          No skills recorded.
                        </p>
                      )}
                    </div>

                    <div className="flex flex-col rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-md">
                      <h3 className="mb-4 text-lg font-semibold text-white">
                        Strengths
                      </h3>

                      {analysis.strengths?.length > 0 ? (
                        <div className="flex flex-wrap gap-2">
                          {analysis.strengths.map(
                            (strength, index) => (
                              <span
                                key={index}
                                className="rounded-full border border-purple-500/20 bg-purple-500/10 px-3 py-1.5 text-sm text-purple-100"
                              >
                                {strength}
                              </span>
                            )
                          )}
                        </div>
                      ) : (
                        <p className="text-sm leading-relaxed text-zinc-500">
                          No strengths recorded.
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="grid items-stretch gap-6 md:grid-cols-2">
                    <div className="flex flex-col rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-md">
                      <h3 className="mb-4 text-lg font-semibold text-white">
                        Improvement Areas
                      </h3>

                      {analysis.improvementAreas?.length >
                      0 ? (
                        <div className="flex flex-wrap gap-2">
                          {analysis.improvementAreas.map(
                            (area, index) => (
                              <span
                                key={index}
                                className="rounded-full border border-pink-500/20 bg-pink-500/10 px-3 py-1.5 text-sm text-pink-100"
                              >
                                {area}
                              </span>
                            )
                          )}
                        </div>
                      ) : (
                        <p className="text-sm leading-relaxed text-zinc-500">
                          No improvement areas recorded.
                        </p>
                      )}
                    </div>

                    <div className="flex flex-col rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-md">
                      <h3 className="mb-4 text-lg font-semibold text-white">
                        Missing Sections
                      </h3>

                      {analysis.missingSections?.length >
                      0 ? (
                        <div className="flex flex-wrap gap-2">
                          {analysis.missingSections.map(
                            (section, index) => (
                              <span
                                key={index}
                                className="rounded-full border border-pink-500/20 bg-pink-500/10 px-3 py-1.5 text-sm text-pink-100"
                              >
                                {section}
                              </span>
                            )
                          )}
                        </div>
                      ) : (
                        <p className="text-sm leading-relaxed text-zinc-500">
                          No missing sections recorded.
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="grid items-stretch gap-6 md:grid-cols-2">
                    <div className="flex flex-col rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-md">
                      <h3 className="mb-4 text-lg font-semibold text-white">
                        Experience Observations
                      </h3>

                      {analysis.experienceObservations?.length >
                      0 ? (
                        <div className="space-y-2">
                          {analysis.experienceObservations.map(
                            (observation, index) => (
                              <p
                                key={index}
                                className="text-sm leading-relaxed text-zinc-300"
                              >
                                {observation}
                              </p>
                            )
                          )}
                        </div>
                      ) : (
                        <p className="text-sm leading-relaxed text-zinc-500">
                          No experience observations recorded.
                        </p>
                      )}
                    </div>

                    <div className="flex flex-col rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-md">
                      <h3 className="mb-4 text-lg font-semibold text-white">
                        Education Observations
                      </h3>

                      {analysis.educationObservations?.length >
                      0 ? (
                        <div className="space-y-2">
                          {analysis.educationObservations.map(
                            (observation, index) => (
                              <p
                                key={index}
                                className="text-sm leading-relaxed text-zinc-300"
                              >
                                {observation}
                              </p>
                            )
                          )}
                        </div>
                      ) : (
                        <p className="text-sm leading-relaxed text-zinc-500">
                          No education observations recorded.
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-md">
                    <h3 className="mb-4 text-lg font-semibold text-white">
                      ATS Suggestions
                    </h3>

                    {analysis.atsSuggestions?.length > 0 ? (
                      <div className="space-y-2">
                        {analysis.atsSuggestions.map(
                          (suggestion, index) => (
                            <p
                              key={index}
                              className="text-sm leading-relaxed text-zinc-300"
                            >
                              {suggestion}
                            </p>
                          )
                        )}
                      </div>
                    ) : (
                      <p className="text-sm leading-relaxed text-zinc-500">
                        No ATS suggestions recorded.
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Rewrite */}
        <section className="mb-8 rounded-2xl border border-white/10 bg-white/5 p-6 shadow-[0_0_40px_rgba(168,85,247,0.15)] backdrop-blur-md md:p-8">
          <p className="text-sm uppercase tracking-wider text-zinc-500">
            AI improvement
          </p>

          <h2 className="mt-2 text-3xl font-semibold text-white">
            Improve Resume Section
          </h2>

          <p className="mt-2 text-zinc-400">
            Rewrite a section while keeping your original facts.
          </p>

          <div className="mt-8 grid gap-6">
            <div>
              <label className="mb-2 block text-sm font-medium text-zinc-300">
                Resume
              </label>

              <select
                value={selectedResumeId}
                onChange={(event) =>
                  setSelectedResumeId(
                    event.target.value
                  )
                }
                className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none transition focus:border-purple-500 focus:ring-2 focus:ring-purple-500/30"
              >
                <option
                  value=""
                  className="bg-[#121212]"
                >
                  Select a resume
                </option>

                {resumes.map((resume) => (
                  <option
                    key={resume._id}
                    value={resume._id}
                    className="bg-[#121212]"
                  >
                    {resume.originalFileName}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-zinc-300">
                Section
              </label>

              <input
                type="text"
                value={rewriteSection}
                onChange={(event) =>
                  setRewriteSection(
                    event.target.value
                  )
                }
                className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white placeholder:text-zinc-500 outline-none transition focus:border-purple-500 focus:ring-2 focus:ring-purple-500/30"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-zinc-300">
                Original Text
              </label>

              <textarea
                value={originalText}
                onChange={(event) =>
                  setOriginalText(
                    event.target.value
                  )
                }
                className="min-h-[180px] w-full resize-y rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white placeholder:text-zinc-500 outline-none transition focus:border-purple-500 focus:ring-2 focus:ring-purple-500/30"
                placeholder="Paste the resume section you want to improve..."
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-zinc-300">
                Instructions
              </label>

              <textarea
                value={rewriteInstructions}
                onChange={(event) =>
                  setRewriteInstructions(
                    event.target.value
                  )
                }
                className="min-h-[130px] w-full resize-y rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white placeholder:text-zinc-500 outline-none transition focus:border-purple-500 focus:ring-2 focus:ring-purple-500/30"
                placeholder="Example: Make this more professional and concise."
              />
            </div>

            <button
              type="button"
              onClick={handleRewrite}
              disabled={rewriting}
              className="w-fit rounded-xl bg-purple-600 px-6 py-3 font-medium text-white shadow-[0_0_25px_rgba(168,85,247,0.5)] transition hover:bg-purple-500 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {rewriting
                ? "Improving..."
                : "Improve Resume Section"}
            </button>

            {rewrittenText && (
              <div className="rounded-2xl border border-purple-400/20 bg-purple-500/5 p-6">
                <p className="text-sm uppercase tracking-wider text-zinc-500">
                  AI result
                </p>

                <h3 className="mt-2 text-xl font-semibold text-white">
                  Improved Content
                </h3>

                <p className="mt-4 whitespace-pre-wrap leading-7 text-zinc-300">
                  {rewrittenText}
                </p>
              </div>
            )}
          </div>
        </section>

        {/* Editor */}
        <section className="mb-8 rounded-2xl border border-white/10 bg-white/5 p-6 shadow-[0_0_40px_rgba(168,85,247,0.15)] backdrop-blur-md md:p-8">
          <p className="text-sm uppercase tracking-wider text-zinc-500">
            Final editing
          </p>

          <h2 className="mt-2 text-3xl font-semibold text-white">
            Resume Editor
          </h2>

          <p className="mt-2 text-zinc-400">
            Edit your final resume content before generating the PDF.
          </p>

          <textarea
            value={editorContent}
            onChange={(event) =>
              setEditorContent(
                event.target.value
              )
            }
            disabled={loadingEditor}
            className="mt-6 min-h-[500px] w-full resize-y rounded-2xl border border-white/10 bg-white/5 p-5 font-mono text-sm leading-7 text-white placeholder:text-zinc-500 outline-none transition focus:border-purple-500 focus:ring-2 focus:ring-purple-500/30 disabled:opacity-50"
            placeholder={
              loadingEditor
                ? "Loading editor..."
                : "Your resume content..."
            }
          />

          <div className="mt-5 flex flex-wrap gap-3">
            <button
              type="button"
              onClick={handleSaveEditor}
              disabled={savingEditor || loadingEditor}
              className="rounded-xl bg-purple-600 px-6 py-3 font-medium text-white shadow-[0_0_25px_rgba(168,85,247,0.5)] transition hover:bg-purple-500 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {savingEditor
                ? "Saving..."
                : "Save Resume"}
            </button>

            <button
              type="button"
              onClick={handleDownloadPdf}
              disabled={
                downloadingPdf ||
                loadingEditor
              }
              className="rounded-xl bg-white px-6 py-3 font-medium text-black transition hover:bg-zinc-200 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {downloadingPdf
                ? "Preparing PDF..."
                : "Download Resume PDF"}
            </button>
          </div>
        </section>

        <footer className="border-t border-white/10 pt-6 text-center">
          <p className="text-sm text-zinc-600">
            AI Resume + Interview Coach
          </p>
        </footer>
      </div>
    </div>
  );
};

export default ResumePage;


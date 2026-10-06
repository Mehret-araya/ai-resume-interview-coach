
import { useEffect, useState } from "react";
import "./InterviewPage.css";

import {
  speakText,
  stopSpeaking,
} from "../utils/speech.js";

import {
  getSpeechRecognition,
} from "../utils/speechRecognition.js";

import { useAuth } from "../context/AuthContext.jsx";

import {
  startInterview,
  submitInterviewAnswer,
} from "../api/interviewApi.js";

import {
  getMyResumes,
} from "../api/resumeApi.js";

const InterviewPage = () => {
  const { token } = useAuth();

  const [resumes, setResumes] = useState([]);
  const [selectedResumeId, setSelectedResumeId] =
    useState("");

  const [targetRole, setTargetRole] = useState("");
  const [interview, setInterview] = useState(null);
  const [answer, setAnswer] = useState("");

  const [loadingResumes, setLoadingResumes] =
    useState(true);

  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] =
    useState(false);

  const [isListening, setIsListening] =
    useState(false);

  const [recognition, setRecognition] =
    useState(null);

  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const [latestEvaluation, setLatestEvaluation] =
    useState(null);

  useEffect(() => {
    const loadResumes = async () => {
      try {
        const data = await getMyResumes(token);

        if (data.success) {
          const userResumes = data.resumes || [];

          setResumes(userResumes);

          if (userResumes.length > 0) {
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
            "Unable to load your resumes."
        );
      } finally {
        setLoadingResumes(false);
      }
    };

    if (token) {
      loadResumes();
    }
  }, [token]);

  const handleStartInterview = async () => {
    if (!selectedResumeId) {
      setError(
        "Please select a resume before starting the interview."
      );
      return;
    }

    if (!targetRole.trim()) {
      setError("Please enter a target role.");
      return;
    }

    setError("");
    setMessage("");
    setLatestEvaluation(null);
    setLoading(true);

    try {
      const data = await startInterview(
        selectedResumeId,
        targetRole,
        token
      );

      if (!data.success) {
        setError(
          data.message ||
            "Unable to start interview."
        );
        return;
      }

      setInterview(data.interview);
      setAnswer("");

      setMessage(
        "Interview started successfully."
      );
    } catch (error) {
      console.error(
        "Start interview error:",
        error
      );

      setError(
        error.response?.data?.message ||
          "Unable to start interview."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleStartListening = () => {
    try {
      const speechRecognition =
        getSpeechRecognition();

      speechRecognition.onstart = () => {
        setIsListening(true);
        setError("");
      };

      speechRecognition.onresult = (event) => {
        let transcript = "";

        for (
          let i = event.resultIndex;
          i < event.results.length;
          i++
        ) {
          transcript +=
            event.results[i][0].transcript;
        }

        setAnswer((previousAnswer) => {
          const separator =
            previousAnswer.trim()
              ? " "
              : "";

          return (
            previousAnswer +
            separator +
            transcript
          );
        });
      };

      speechRecognition.onerror = (event) => {
        console.error(
          "Speech recognition error:",
          event.error
        );

        setIsListening(false);

        if (event.error === "not-allowed") {
          setError(
            "Microphone permission was denied. Please allow microphone access in your browser."
          );
        } else {
          setError(
            `Speech recognition error: ${event.error}`
          );
        }
      };

      speechRecognition.onend = () => {
        setIsListening(false);
        setRecognition(null);
      };

      speechRecognition.start();

      setRecognition(speechRecognition);
    } catch (error) {
      console.error(
        "Start speech recognition error:",
        error
      );

      setError(error.message);
      setIsListening(false);
    }
  };

  const handleStopListening = () => {
    if (recognition) {
      recognition.stop();
      setRecognition(null);
    }

    setIsListening(false);
  };

  const handleSubmitAnswer = async () => {
    if (!answer.trim()) {
      if (recognition) {
        recognition.stop();
        setRecognition(null);
      }

      setIsListening(false);
      setError("Please enter an answer.");
      return;
    }

    if (!interview?.id) {
      setError(
        "Interview session not found."
      );
      return;
    }

    setError("");
    setMessage("");
    setLatestEvaluation(null);
    setSubmitting(true);

    try {
      const data =
        await submitInterviewAnswer(
          interview.id,
          answer,
          token
        );

      if (!data.success) {
        setError(
          data.message ||
            "Unable to submit answer."
        );
        return;
      }

      setInterview(data.interview);
      setAnswer("");

      setLatestEvaluation(
        data.evaluation
      );

      if (
        data.interview.status ===
        "completed"
      ) {
        setMessage(
          "Interview completed successfully."
        );
      } else {
        setMessage(
          "Answer evaluated. Continue to the next question."
        );
      }
    } catch (error) {
      console.error(
        "Submit answer error:",
        error
      );

      setError(
        error.response?.data?.message ||
          "Unable to evaluate answer."
      );
    } finally {
      setSubmitting(false);
    }
  };

  const currentQuestion =
    interview?.questions?.[
      interview.currentQuestionIndex
    ];

  useEffect(() => {
    if (
      interview?.status === "in_progress" &&
      currentQuestion?.question
    ) {
      setAnswer("");
      setLatestEvaluation(null);

      speakText(currentQuestion.question);
    }

    return () => {
      stopSpeaking();

      if (recognition) {
        recognition.stop();
      }

      setIsListening(false);
      setRecognition(null);
    };
  }, [
    interview?.status,
    interview?.currentQuestionIndex,
  ]);

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#0A0A0A] px-4 text-white sm:px-6">
      {/* Background glow */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute left-1/2 top-1/4 h-[650px] w-[650px] -translate-x-1/2 rounded-full bg-purple-600/10 blur-3xl" />

        <div className="absolute -left-40 top-40 h-80 w-80 rounded-full bg-purple-600/10 blur-3xl" />

        <div className="absolute -right-40 top-[45%] h-96 w-96 rounded-full bg-pink-500/10 blur-3xl" />
      </div>

      <div className="relative z-10 mx-auto max-w-6xl px-2 py-8 md:py-12">
        {/* Header */}
        <header className="mb-10 flex flex-col gap-6 border-b border-white/10 pb-6 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-xl font-semibold tracking-tight text-white">
              AI Career <span className="text-purple-400">+</span>{" "}
              Interview Coach
            </h1>

            <p className="mt-1 text-sm text-zinc-500">
              Practice and improve your interview performance
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
              className="rounded-xl px-4 py-2 text-sm font-medium text-zinc-400 transition hover:bg-white/10 hover:text-white"
            >
              My Resume
            </a>

            <a
              href="/interview"
              className="rounded-xl bg-white/10 px-4 py-2 text-sm font-medium text-white"
            >
              Interview Coach
            </a>
          </nav>
        </header>

        <main>
          {!interview ? (
            <section className="mx-auto max-w-3xl">
              <div className="mb-8 text-center">
                <p className="mb-4 text-sm uppercase tracking-[0.25em] text-zinc-500">
                  Mock Interview
                </p>

                <h2 className="text-4xl font-bold tracking-tight text-white md:text-5xl">
                  Prepare for your{" "}
                  <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                    next interview
                  </span>
                </h2>

                <p className="mx-auto mt-4 max-w-2xl text-sm leading-6 text-zinc-400 md:text-base">
                  Select your resume and enter the role you are preparing for.
                  The AI interviewer will generate questions based on your
                  background.
                </p>
              </div>

              <div className="rounded-2xl border border-white/10 bg-white/5 p-6 shadow-[0_0_40px_rgba(168,85,247,0.15)] backdrop-blur-md md:p-8">
                <h3 className="text-2xl font-semibold text-white">
                  Start Interview
                </h3>

                <p className="mt-2 text-sm text-zinc-400">
                  Choose the resume you want to use for this interview.
                </p>

                {loadingResumes ? (
                  <div className="mt-8 rounded-xl border border-white/10 bg-white/5 px-4 py-4 text-sm text-zinc-400">
                    Loading your resumes...
                  </div>
                ) : resumes.length === 0 ? (
                  <div className="mt-8 rounded-xl border border-yellow-400/20 bg-yellow-500/10 px-4 py-4 text-sm text-yellow-300">
                    No resumes found. Please upload a resume before starting
                    an interview.
                  </div>
                ) : (
                  <div className="mt-8 space-y-6">
                    <div>
                      <label
                        htmlFor="resume"
                        className="mb-2 block text-sm font-medium text-zinc-400"
                      >
                        Select Resume
                      </label>

                      <select
                        id="resume"
                        value={selectedResumeId}
                        onChange={(event) =>
                          setSelectedResumeId(
                            event.target.value
                          )
                        }
                        className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500/30"
                      >
                        {resumes.map((resume) => (
                          <option
                            key={resume._id}
                            value={resume._id}
                            className="bg-zinc-900 text-white"
                          >
                            {resume.originalFileName}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label
                        htmlFor="targetRole"
                        className="mb-2 block text-sm font-medium text-zinc-400"
                      >
                        Target Role
                      </label>

                      <input
                        id="targetRole"
                        type="text"
                        value={targetRole}
                        onChange={(event) =>
                          setTargetRole(
                            event.target.value
                          )
                        }
                        placeholder="Example: Software Engineer"
                        className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white placeholder:text-zinc-500 focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500/30"
                      />
                    </div>

                    <button
                      type="button"
                      onClick={
                        handleStartInterview
                      }
                      disabled={loading}
                      className="w-full rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 py-3 font-semibold text-white shadow-[0_0_25px_rgba(168,85,247,0.5)] transition hover:from-purple-500 hover:to-pink-500 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {loading
                        ? "Starting Interview..."
                        : "Start Interview"}
                    </button>
                  </div>
                )}
              </div>
            </section>
          ) : (
            <section>
              <div className="mb-8">
                <p className="mb-3 text-sm uppercase tracking-[0.25em] text-zinc-500">
                  Mock Interview
                </p>

                <h2 className="text-3xl font-bold tracking-tight text-white md:text-4xl">
                  Interview for:{" "}
                  <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                    {interview.targetRole}
                  </span>
                </h2>

                <p className="mt-3 text-sm text-zinc-400">
                  Question{" "}
                  {Math.min(
                    interview.currentQuestionIndex +
                      1,
                    interview.totalQuestions
                  )}{" "}
                  of{" "}
                  {interview.totalQuestions}
                </p>
              </div>

              {latestEvaluation && (
                <section className="mb-6 rounded-2xl border border-purple-400/20 bg-purple-500/10 p-6 shadow-[0_0_35px_rgba(168,85,247,0.12)] backdrop-blur-md">
                  <div className="mb-4 flex items-center justify-between gap-4">
                    <h3 className="text-xl font-semibold text-white">
                      AI Evaluation
                    </h3>

                    <div className="rounded-xl bg-white/10 px-4 py-2 text-sm font-semibold text-purple-300">
                      Score: {latestEvaluation.score}/10
                    </div>
                  </div>

                  <p className="text-sm leading-6 text-zinc-300">
                    <strong className="text-white">
                      Feedback:
                    </strong>{" "}
                    {latestEvaluation.evaluation}
                  </p>
                </section>
              )}

              {interview.status ===
              "completed" ? (
                <div className="rounded-2xl border border-white/10 bg-white/5 p-6 shadow-[0_0_40px_rgba(168,85,247,0.15)] backdrop-blur-md md:p-8">
                  <div className="mb-8 text-center">
                    <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-green-500/10 text-2xl text-green-400">
                      ✓
                    </div>

                    <h3 className="text-2xl font-bold text-white">
                      Interview Completed
                    </h3>

                    <p className="mt-2 text-sm text-zinc-400">
                      You have completed all five interview questions.
                    </p>
                  </div>

                  {interview.finalReport && (
                    <section>
                      <h3 className="mb-6 border-b border-white/10 pb-4 text-xl font-semibold text-white">
                        Final Interview Report
                      </h3>

                      {(() => {
                        let report;

                        try {
                          report =
                            typeof interview.finalReport ===
                            "string"
                              ? JSON.parse(
                                  interview.finalReport
                                )
                              : interview.finalReport;
                        } catch {
                          report = null;
                        }

                        if (!report) {
                          return (
                            <p className="rounded-xl border border-red-400/20 bg-red-500/10 px-4 py-3 text-sm text-red-400">
                              Final report could not be displayed.
                            </p>
                          );
                        }

                        return (
                          <div className="space-y-8">
                            <div>
                              <h4 className="mb-3 text-sm font-semibold uppercase tracking-wider text-purple-400">
                                Overall Performance
                              </h4>

                              <p className="text-sm leading-7 text-zinc-300">
                                {
                                  report.overallPerformance
                                }
                              </p>
                            </div>

                            <div>
                              <h4 className="mb-3 text-sm font-semibold uppercase tracking-wider text-purple-400">
                                Key Strengths
                              </h4>

                              {report.strengths
                                ?.length > 0 ? (
                                <ul className="space-y-2">
                                  {report.strengths.map(
                                    (
                                      strength,
                                      index
                                    ) => (
                                      <li
                                        key={
                                          index
                                        }
                                        className="rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm leading-6 text-zinc-300"
                                      >
                                        {strength}
                                      </li>
                                    )
                                  )}
                                </ul>
                              ) : (
                                <p className="text-sm text-zinc-500">
                                  No strengths recorded.
                                </p>
                              )}
                            </div>

                            <div>
                              <h4 className="mb-3 text-sm font-semibold uppercase tracking-wider text-purple-400">
                                Areas for Improvement
                              </h4>

                              {report
                                .areasForImprovement
                                ?.length > 0 ? (
                                <ul className="space-y-2">
                                  {report.areasForImprovement.map(
                                    (
                                      area,
                                      index
                                    ) => (
                                      <li
                                        key={
                                          index
                                        }
                                        className="rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm leading-6 text-zinc-300"
                                      >
                                        {area}
                                      </li>
                                    )
                                  )}
                                </ul>
                              ) : (
                                <p className="text-sm text-zinc-500">
                                  No improvement areas recorded.
                                </p>
                              )}
                            </div>

                            <div>
                              <h4 className="mb-3 text-sm font-semibold uppercase tracking-wider text-purple-400">
                                Technical Performance
                              </h4>

                              <p className="text-sm leading-7 text-zinc-300">
                                {
                                  report.technicalPerformance
                                }
                              </p>
                            </div>

                            <div>
                              <h4 className="mb-3 text-sm font-semibold uppercase tracking-wider text-purple-400">
                                Communication Performance
                              </h4>

                              <p className="text-sm leading-7 text-zinc-300">
                                {
                                  report.communicationPerformance
                                }
                              </p>
                            </div>

                            <div>
                              <h4 className="mb-3 text-sm font-semibold uppercase tracking-wider text-purple-400">
                                Recommendations
                              </h4>

                              {report
                                .recommendations
                                ?.length > 0 ? (
                                <ul className="space-y-2">
                                  {report.recommendations.map(
                                    (
                                      recommendation,
                                      index
                                    ) => (
                                      <li
                                        key={
                                          index
                                        }
                                        className="rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm leading-6 text-zinc-300"
                                      >
                                        {
                                          recommendation
                                        }
                                      </li>
                                    )
                                  )}
                                </ul>
                              ) : (
                                <p className="text-sm text-zinc-500">
                                  No recommendations recorded.
                                </p>
                              )}
                            </div>
                          </div>
                        );
                      })()}
                    </section>
                  )}
                </div>
              ) : (
                <div className="rounded-2xl border border-white/10 bg-white/5 p-6 shadow-[0_0_40px_rgba(168,85,247,0.15)] backdrop-blur-md md:p-8">
                  <div className="mb-8">
                    <div className="mb-3 flex items-center gap-2">
                      <span className="rounded-lg bg-purple-500/10 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-purple-400">
                        Current Question
                      </span>
                    </div>

                    <h3 className="text-2xl font-semibold leading-8 text-white">
                      {currentQuestion?.question}
                    </h3>
                  </div>

                  <div className="mb-6 flex flex-wrap gap-3">
                    <button
                      type="button"
                      onClick={() =>
                        speakText(
                          currentQuestion?.question ||
                            ""
                        )
                      }
                      className="rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm font-medium text-zinc-300 transition hover:bg-white/10 hover:text-white"
                    >
                      🔊 Read Question
                    </button>

                    <button
                      type="button"
                      onClick={stopSpeaking}
                      className="rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm font-medium text-zinc-400 transition hover:bg-red-500/10 hover:text-red-400"
                    >
                      Stop
                    </button>
                  </div>

                  <div>
                    <label
                      htmlFor="answer"
                      className="mb-2 block text-sm font-medium text-zinc-400"
                    >
                      Your Answer
                    </label>

                    <textarea
                      id="answer"
                      value={answer}
                      onChange={(event) =>
                        setAnswer(
                          event.target.value
                        )
                      }
                      rows="10"
                      cols="80"
                      placeholder="Type your answer here..."
                      className="w-full resize-y rounded-xl border border-white/10 bg-white/5 px-4 py-4 text-white placeholder:text-zinc-500 focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500/30"
                    />
                  </div>

                  <div className="mt-5 flex flex-wrap gap-3">
                    <button
                      type="button"
                      onClick={
                        handleStartListening
                      }
                      disabled={isListening}
                      className="rounded-xl border border-purple-400/20 bg-purple-500/10 px-4 py-2.5 text-sm font-medium text-purple-300 transition hover:bg-purple-500/20 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {isListening
                        ? "Listening..."
                        : "🎤 Start Recording"}
                    </button>

                    <button
                      type="button"
                      onClick={
                        handleStopListening
                      }
                      disabled={!isListening}
                      className="rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm font-medium text-zinc-400 transition hover:bg-white/10 hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      Stop Recording
                    </button>
                  </div>

                  <button
                    type="button"
                    onClick={
                      handleSubmitAnswer
                    }
                    disabled={submitting}
                    className="mt-6 w-full rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 py-3 font-semibold text-white shadow-[0_0_25px_rgba(168,85,247,0.5)] transition hover:from-purple-500 hover:to-pink-500 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {submitting
                      ? "Evaluating..."
                      : "Submit Answer"}
                  </button>
                </div>
              )}
            </section>
          )}

          {message && (
            <div className="mt-6 rounded-xl border border-purple-400/20 bg-purple-500/10 px-4 py-3 text-sm text-purple-300">
              {message}
            </div>
          )}

          {error && (
            <div className="mt-6 rounded-xl border border-red-400/20 bg-red-500/10 px-4 py-3 text-sm text-red-400">
              {error}
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default InterviewPage;


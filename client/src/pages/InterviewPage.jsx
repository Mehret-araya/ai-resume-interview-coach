
import { useState } from "react";

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

const InterviewPage = () => {
  const { token } = useAuth();

  const [targetRole, setTargetRole] = useState("");
  const [interview, setInterview] = useState(null);
  const [answer, setAnswer] = useState("");

  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [isListening, setIsListening] = useState(false);
  const [recognition, setRecognition] = useState(null);

  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const [latestEvaluation, setLatestEvaluation] =
    useState(null);

  const resumeId = "6abce543ec7acb0a3a734328";

  const handleStartInterview = async () => {
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
        resumeId,
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

  return (
    <div>
      <header>
        <h1>Text Mock Interview</h1>
      </header>

      <main>
        {!interview ? (
          <section>
            <h2>Start Interview</h2>

            <p>
              Enter the role you are preparing
              for.
            </p>

            <input
              type="text"
              value={targetRole}
              onChange={(event) =>
                setTargetRole(
                  event.target.value
                )
              }
              placeholder="Example: Software Engineer"
            />

            <br />
            <br />

            <button
              type="button"
              onClick={
                handleStartInterview
              }
              disabled={loading}
            >
              {loading
                ? "Starting Interview..."
                : "Start Interview"}
            </button>
          </section>
        ) : (
          <section>
            <h2>
              Interview for:{" "}
              {interview.targetRole}
            </h2>

            <p>
              Question{" "}
              {Math.min(
                interview.currentQuestionIndex +
                  1,
                interview.totalQuestions
              )}{" "}
              of{" "}
              {interview.totalQuestions}
            </p>

            {latestEvaluation && (
              <section>
                <h3>AI Evaluation</h3>

                <p>
                  <strong>
                    Score:
                  </strong>{" "}
                  {latestEvaluation.score}
                  /10
                </p>

                <p>
                  <strong>
                    Feedback:
                  </strong>{" "}
                  {
                    latestEvaluation.evaluation
                  }
                </p>
              </section>
            )}

            {interview.status ===
            "completed" ? (
              <div>
                <h3>
                  Interview Completed
                </h3>

                <p>
                  You have completed all
                  five interview questions.
                </p>

                {interview.finalReport && (
                  <section>
                    <h3>
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
                          <p>
                            Final report
                            could not be
                            displayed.
                          </p>
                        );
                      }

                      return (
                        <div>
                          <h4>
                            Overall
                            Performance
                          </h4>

                          <p>
                            {
                              report.overallPerformance
                            }
                          </p>

                          <h4>
                            Key Strengths
                          </h4>

                          {report.strengths
                            ?.length > 0 ? (
                            <ul>
                              {report.strengths.map(
                                (
                                  strength,
                                  index
                                ) => (
                                  <li
                                    key={
                                      index
                                    }
                                  >
                                    {strength}
                                  </li>
                                )
                              )}
                            </ul>
                          ) : (
                            <p>
                              No strengths
                              recorded.
                            </p>
                          )}

                          <h4>
                            Areas for
                            Improvement
                          </h4>

                          {report
                            .areasForImprovement
                            ?.length > 0 ? (
                            <ul>
                              {report.areasForImprovement.map(
                                (
                                  area,
                                  index
                                ) => (
                                  <li
                                    key={
                                      index
                                    }
                                  >
                                    {area}
                                  </li>
                                )
                              )}
                            </ul>
                          ) : (
                            <p>
                              No improvement
                              areas recorded.
                            </p>
                          )}

                          <h4>
                            Technical
                            Performance
                          </h4>

                          <p>
                            {
                              report.technicalPerformance
                            }
                          </p>

                          <h4>
                            Communication
                            Performance
                          </h4>

                          <p>
                            {
                              report.communicationPerformance
                            }
                          </p>

                          <h4>
                            Recommendations
                          </h4>

                          {report
                            .recommendations
                            ?.length > 0 ? (
                            <ul>
                              {report.recommendations.map(
                                (
                                  recommendation,
                                  index
                                ) => (
                                  <li
                                    key={
                                      index
                                    }
                                  >
                                    {
                                      recommendation
                                    }
                                  </li>
                                )
                              )}
                            </ul>
                          ) : (
                            <p>
                              No recommendations
                              recorded.
                            </p>
                          )}
                        </div>
                      );
                    })()}
                  </section>
                )}
              </div>
            ) : (
              <div>
                <h3>
                  {currentQuestion?.question}
                </h3>

                <div>
                  <button
                    type="button"
                    onClick={() =>
                      speakText(
                        currentQuestion?.question ||
                          ""
                      )
                    }
                  >
                    🔊 Read Question
                  </button>

                  <button
                    type="button"
                    onClick={stopSpeaking}
                  >
                    Stop
                  </button>
                </div>

                <br />

                <textarea
                  value={answer}
                  onChange={(event) =>
                    setAnswer(
                      event.target.value
                    )
                  }
                  rows="10"
                  cols="80"
                  placeholder="Type your answer here..."
                />

                <br />
                <br />

                <button
                  type="button"
                  onClick={
                    handleStartListening
                  }
                  disabled={isListening}
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
                >
                  Stop Recording
                </button>

                <br />
                <br />

                <button
                  type="button"
                  onClick={
                    handleSubmitAnswer
                  }
                  disabled={submitting}
                >
                  {submitting
                    ? "Evaluating..."
                    : "Submit Answer"}
                </button>
              </div>
            )}
          </section>
        )}

        {message && <p>{message}</p>}

        {error && <p>{error}</p>}
      </main>
    </div>
  );
};

export default InterviewPage;


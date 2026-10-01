import { useState } from "react";
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
          data.message || "Unable to start interview."
        );
        return;
      }

      setInterview(data.interview);
      setAnswer("");
      setMessage("Interview started successfully.");
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

  const handleSubmitAnswer = async () => {
    if (!answer.trim()) {
      setError("Please enter an answer.");
      return;
    }

    if (!interview?.id) {
      setError("Interview session not found.");
      return;
    }

    setError("");
    setMessage("");
    setLatestEvaluation(null);
    setSubmitting(true);

    try {
      const data = await submitInterviewAnswer(
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

      setLatestEvaluation(data.evaluation);

      if (data.interview.status === "completed") {
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
              Enter the role you are preparing for.
            </p>

            <input
              type="text"
              value={targetRole}
              onChange={(event) =>
                setTargetRole(event.target.value)
              }
              placeholder="Example: Software Engineer"
            />

            <br />
            <br />

            <button
              type="button"
              onClick={handleStartInterview}
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
              Interview for: {interview.targetRole}
            </h2>

            <p>
              Question{" "}
              {Math.min(
                interview.currentQuestionIndex + 1,
                interview.totalQuestions
              )}{" "}
              of {interview.totalQuestions}
            </p>

            {latestEvaluation && (
              <section>
                <h3>AI Evaluation</h3>

                <p>
                  <strong>Score:</strong>{" "}
                  {latestEvaluation.score}/10
                </p>

                <p>
                  <strong>Feedback:</strong>{" "}
                  {latestEvaluation.evaluation}
                </p>
              </section>
            )}

            {interview.status === "completed" ? (
              <div>
                <h3>Interview Completed</h3>

                <p>
                  You have completed all five
                  interview questions.
                </p>
              </div>
            ) : (
              <div>
                <h3>
                  {currentQuestion?.question}
                </h3>

                <textarea
                  value={answer}
                  onChange={(event) =>
                    setAnswer(event.target.value)
                  }
                  rows="10"
                  cols="80"
                  placeholder="Type your answer here..."
                />

                <br />
                <br />

                <button
                  type="button"
                  onClick={handleSubmitAnswer}
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
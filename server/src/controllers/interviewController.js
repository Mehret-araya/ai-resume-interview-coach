import Interview from "../models/Interview.js";
import Resume from "../models/Resume.js";
import aiProvider from "../ai/aiProvider.js";
import buildInterviewQuestionPrompt from "../ai/interviewQuestionPrompt.js";
import buildInterviewEvaluationPrompt from "../ai/interviewEvaluationPrompt.js";

export const startInterview = async (req, res) => {
  try {
    const { resumeId, targetRole } = req.body;

    if (!resumeId || !targetRole?.trim()) {
      return res.status(400).json({
        success: false,
        message: "Resume and target role are required",
      });
    }

    const resume = await Resume.findOne({
      _id: resumeId,
      user: req.userId,
    });

    if (!resume) {
      return res.status(404).json({
        success: false,
        message: "Resume not found",
      });
    }

    if (!resume.extractedText?.trim()) {
      return res.status(400).json({
        success: false,
        message: "Resume text is not available",
      });
    }

    const prompt = buildInterviewQuestionPrompt({
      resumeText: resume.extractedText,
      targetRole: targetRole.trim(),
    });

    const aiResponse = await aiProvider.generateText(prompt);

    let parsedResponse;

    try {
      parsedResponse = JSON.parse(aiResponse);
    } catch (parseError) {
      console.error(
        "Interview question JSON parse error:",
        parseError.message
      );

      return res.status(500).json({
        success: false,
        message: "AI returned invalid interview question data",
      });
    }

    if (
      !parsedResponse.questions ||
      !Array.isArray(parsedResponse.questions) ||
      parsedResponse.questions.length !== 5
    ) {
      return res.status(500).json({
        success: false,
        message: "AI did not return exactly 5 interview questions",
      });
    }

    const questions = parsedResponse.questions.map((item) => ({
      question: item.question,
      answer: "",
      evaluation: "",
      score: null,
    }));

    const interview = await Interview.create({
      user: req.userId,
      resume: resume._id,
      targetRole: targetRole.trim(),
      status: "in_progress",
      currentQuestionIndex: 0,
      totalQuestions: 5,
      questions,
    });

    res.status(201).json({
      success: true,
      message: "Interview started successfully",
      interview: {
        id: interview._id,
        resumeId: interview.resume,
        targetRole: interview.targetRole,
        status: interview.status,
        currentQuestionIndex:
          interview.currentQuestionIndex,
        totalQuestions: interview.totalQuestions,
        questions: interview.questions,
      },
    });
  } catch (error) {
    console.error(
      "Start interview error:",
      error.message
    );

    res.status(500).json({
      success: false,
      message: "Server error while starting interview",
    });
  }
};

export const submitInterviewAnswer = async (req, res) => {
  try {
    const { interviewId } = req.params;
    const { answer } = req.body;

    if (typeof answer !== "string" || !answer.trim()) {
      return res.status(400).json({
        success: false,
        message: "Interview answer is required",
      });
    }

    const interview = await Interview.findOne({
      _id: interviewId,
      user: req.userId,
    });

    if (!interview) {
      return res.status(404).json({
        success: false,
        message: "Interview not found",
      });
    }

    if (interview.status !== "in_progress") {
      return res.status(400).json({
        success: false,
        message: "Interview is no longer in progress",
      });
    }

    const questionIndex = interview.currentQuestionIndex;

    if (
      questionIndex < 0 ||
      questionIndex >= interview.questions.length
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid interview question",
      });
    }

    const currentQuestion =
      interview.questions[questionIndex].question;

    const evaluationPrompt =
      buildInterviewEvaluationPrompt({
        targetRole: interview.targetRole,
        question: currentQuestion,
        answer: answer.trim(),
      });

    const aiResponse =
      await aiProvider.generateText(evaluationPrompt);

    let parsedEvaluation;

    try {
      parsedEvaluation = JSON.parse(aiResponse);
    } catch (parseError) {
      console.error(
        "Interview evaluation JSON parse error:",
        parseError.message
      );

      return res.status(500).json({
        success: false,
        message: "AI returned invalid evaluation data",
      });
    }

    if (
      typeof parsedEvaluation.evaluation !== "string" ||
      typeof parsedEvaluation.score !== "number"
    ) {
      return res.status(500).json({
        success: false,
        message: "AI returned invalid evaluation data",
      });
    }

    interview.questions[questionIndex].answer =
      answer.trim();

    interview.questions[questionIndex].evaluation =
      parsedEvaluation.evaluation;

    interview.questions[questionIndex].score =
      parsedEvaluation.score;

    interview.currentQuestionIndex =
      questionIndex + 1;

    if (
      interview.currentQuestionIndex >=
      interview.totalQuestions
    ) {
      interview.status = "completed";
    }

    await interview.save();

    res.status(200).json({
      success: true,
      message: "Interview answer evaluated successfully",
      evaluation: {
        evaluation: parsedEvaluation.evaluation,
        score: parsedEvaluation.score,
      },
      interview: {
        id: interview._id,
        status: interview.status,
        currentQuestionIndex:
          interview.currentQuestionIndex,
        totalQuestions: interview.totalQuestions,
        questions: interview.questions,
      },
    });
  } catch (error) {
    console.error(
      "Submit interview answer error:",
      error.message
    );

    res.status(500).json({
      success: false,
      message: "Server error while evaluating interview answer",
    });
  }
};

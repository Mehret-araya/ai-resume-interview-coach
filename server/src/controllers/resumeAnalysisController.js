import Resume from "../models/Resume.js";
import ResumeAnalysis from "../models/ResumeAnalysis.js";
import aiProvider from "../ai/aiProvider.js";
import buildResumeAnalysisPrompt from "../ai/resumeAnalysisPrompt.js";

export const analyzeResume = async (req, res) => {
  try {
    const { resumeId } = req.params;

    // Find the resume and make sure it belongs to the logged-in user
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

    // Make sure the resume contains extracted text
    if (!resume.extractedText || !resume.extractedText.trim()) {
      return res.status(400).json({
        success: false,
        message: "Resume does not contain extracted text",
      });
    }

    // Build the AI prompt
    const prompt = buildResumeAnalysisPrompt(resume.extractedText);

    // Ask the configured AI provider to analyze the resume
    const aiResponse = await aiProvider.generateText(prompt);

    // Remove accidental markdown code fences if the model adds them
    const cleanedResponse = aiResponse
      .replace(/^```json\s*/i, "")
      .replace(/^```\s*/i, "")
      .replace(/\s*```$/i, "")
      .trim();

    // Convert the AI response into JSON
    let analysisData;

    try {
      analysisData = JSON.parse(cleanedResponse);
    } catch (error) {
      console.error("AI JSON parsing error:", error.message);

      return res.status(502).json({
        success: false,
        message: "AI returned an invalid analysis format",
        rawAnalysis: aiResponse,
      });
    }

    // Save the analysis in MongoDB
    const analysis = await ResumeAnalysis.create({
      user: req.userId,
      resume: resume._id,
      summary: analysisData.summary || "",
      skills: Array.isArray(analysisData.skills)
        ? analysisData.skills
        : [],
      strengths: Array.isArray(analysisData.strengths)
        ? analysisData.strengths
        : [],
      improvementAreas: Array.isArray(analysisData.improvementAreas)
        ? analysisData.improvementAreas
        : [],
      experienceObservations: Array.isArray(
        analysisData.experienceObservations
      )
        ? analysisData.experienceObservations
        : [],
      educationObservations: Array.isArray(
        analysisData.educationObservations
      )
        ? analysisData.educationObservations
        : [],
      missingSections: Array.isArray(analysisData.missingSections)
        ? analysisData.missingSections
        : [],
      atsSuggestions: Array.isArray(analysisData.atsSuggestions)
        ? analysisData.atsSuggestions
        : [],
      rawAnalysis: aiResponse,
    });

    res.status(201).json({
      success: true,
      message: "Resume analyzed successfully",
      analysis: {
        id: analysis._id,
        resumeId: analysis.resume,
        summary: analysis.summary,
        skills: analysis.skills,
        strengths: analysis.strengths,
        improvementAreas: analysis.improvementAreas,
        experienceObservations: analysis.experienceObservations,
        educationObservations: analysis.educationObservations,
        missingSections: analysis.missingSections,
        atsSuggestions: analysis.atsSuggestions,
        createdAt: analysis.createdAt,
      },
    });
  } catch (error) {
    console.error("Resume analysis error:", error.message);

    res.status(500).json({
      success: false,
      message: "Server error while analyzing resume",
    });
  }
};

export const getResumeAnalysis = async (req, res) => {
  try {
    const { analysisId } = req.params;

    const analysis = await ResumeAnalysis.findOne({
      _id: analysisId,
      user: req.userId,
    }).populate("resume", "originalFileName");

    if (!analysis) {
      return res.status(404).json({
        success: false,
        message: "Resume analysis not found",
      });
    }

    res.status(200).json({
      success: true,
      analysis,
    });
  } catch (error) {
    console.error("Get resume analysis error:", error.message);

    res.status(500).json({
      success: false,
      message: "Server error while getting resume analysis",
    });
  }
};

export const getMyResumeAnalyses = async (req, res) => {
  try {
    const analyses = await ResumeAnalysis.find({
      user: req.userId,
    })
      .populate("resume", "originalFileName")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      analyses,
    });
  } catch (error) {
    console.error("Get resume analyses error:", error.message);

    res.status(500).json({
      success: false,
      message: "Server error while getting resume analyses",
    });
  }
};
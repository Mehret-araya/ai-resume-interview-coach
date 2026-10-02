
import Resume from "../models/Resume.js";
import ResumeRewrite from "../models/ResumeRewrite.js";
import User from "../models/User.js";
import aiProvider from "../ai/aiProvider.js";
import buildResumeRewritePrompt from "../ai/resumeRewritePrompt.js";
import {
  FREE_RESUME_REWRITES,
  hasResumeRewriteAvailable,
} from "../utils/usageLimits.js";

export const rewriteResumeSection = async (req, res) => {
  try {
    const { resumeId } = req.params;
    const { section, originalText, instructions } = req.body;

    if (!section || !originalText) {
      return res.status(400).json({
        success: false,
        message: "Section and original text are required",
      });
    }

    const user = await User.findById(req.userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    if (!hasResumeRewriteAvailable(user)) {
      return res.status(429).json({
        success: false,
        message: `Free resume rewrite limit reached. You can use ${FREE_RESUME_REWRITES} resume rewrites per usage period.`,
        limit: FREE_RESUME_REWRITES,
        used: user.resumeRewriteCount,
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

    const prompt = buildResumeRewritePrompt({
      section,
      originalText,
      instructions,
    });

    const rewrittenText = await aiProvider.generateText(prompt);

    if (!rewrittenText || !rewrittenText.trim()) {
      return res.status(502).json({
        success: false,
        message: "AI returned an empty rewrite",
      });
    }

    const rewrite = await ResumeRewrite.create({
      user: req.userId,
      resume: resume._id,
      section,
      originalText,
      rewrittenText: rewrittenText.trim(),
      instructions: instructions || "",
    });

    user.resumeRewriteCount += 1;
    await user.save();

    res.status(201).json({
      success: true,
      message: "Resume section rewritten successfully",
      rewrite: {
        id: rewrite._id,
        resumeId: rewrite.resume,
        section: rewrite.section,
        originalText: rewrite.originalText,
        rewrittenText: rewrite.rewrittenText,
        instructions: rewrite.instructions,
        createdAt: rewrite.createdAt,
      },
      usage: {
        used: user.resumeRewriteCount,
        limit: FREE_RESUME_REWRITES,
        remaining:
          FREE_RESUME_REWRITES -
          user.resumeRewriteCount,
      },
    });
  } catch (error) {
    console.error("Resume rewrite error:", error.message);

    res.status(500).json({
      success: false,
      message: "Server error while rewriting resume section",
    });
  }
};

export const getMyResumeRewrites = async (req, res) => {
  try {
    const rewrites = await ResumeRewrite.find({
      user: req.userId,
    })
      .populate("resume", "originalFileName")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      rewrites,
    });
  } catch (error) {
    console.error("Get resume rewrites error:", error.message);

    res.status(500).json({
      success: false,
      message: "Server error while getting resume rewrites",
    });
  }
};


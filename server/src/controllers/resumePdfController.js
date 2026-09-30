import Resume from "../models/Resume.js";
import ResumeEditor from "../models/ResumeEditor.js";
import generateResumePdf from "../utils/pdfGenerator.js";

export const generateResumePdfFile = async (req, res) => {
  try {
    const { resumeId } = req.params;

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

    const editor = await ResumeEditor.findOne({
      resume: resume._id,
      user: req.userId,
    });

    if (!editor || !editor.content.trim()) {
      return res.status(404).json({
        success: false,
        message: "No saved resume editor content found",
      });
    }

    generateResumePdf(editor.content, res);
  } catch (error) {
    console.error("Resume PDF generation error:", error.message);

    if (!res.headersSent) {
      res.status(500).json({
        success: false,
        message: "Server error while generating resume PDF",
      });
    }
  }
};
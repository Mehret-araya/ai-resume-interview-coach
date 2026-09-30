import Resume from "../models/Resume.js";
import ResumeEditor from "../models/ResumeEditor.js";

export const createOrUpdateResumeEditor = async (req, res) => {
  try {
    const { resumeId } = req.params;
    const { content } = req.body;

    if (typeof content !== "string") {
      return res.status(400).json({
        success: false,
        message: "Resume content must be provided as text",
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

    const editor = await ResumeEditor.findOneAndUpdate(
      {
        resume: resume._id,
        user: req.userId,
      },
      {
        content,
      },
      {
        new: true,
        upsert: true,
        setDefaultsOnInsert: true,
      }
    );

    res.status(200).json({
      success: true,
      message: "Resume editor content saved successfully",
      editor: {
        id: editor._id,
        resumeId: editor.resume,
        content: editor.content,
        updatedAt: editor.updatedAt,
      },
    });
  } catch (error) {
    console.error("Save resume editor error:", error.message);

    res.status(500).json({
      success: false,
      message: "Server error while saving resume editor content",
    });
  }
};

export const getResumeEditor = async (req, res) => {
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

    if (!editor) {
      return res.status(404).json({
        success: false,
        message: "Resume editor content not found",
      });
    }

    res.status(200).json({
      success: true,
      editor: {
        id: editor._id,
        resumeId: editor.resume,
        content: editor.content,
        createdAt: editor.createdAt,
        updatedAt: editor.updatedAt,
      },
    });
  } catch (error) {
    console.error("Get resume editor error:", error.message);

    res.status(500).json({
      success: false,
      message: "Server error while getting resume editor content",
    });
  }
};

export const deleteResumeEditor = async (req, res) => {
  try {
    const { resumeId } = req.params;

    const editor = await ResumeEditor.findOneAndDelete({
      resume: resumeId,
      user: req.userId,
    });

    if (!editor) {
      return res.status(404).json({
        success: false,
        message: "Resume editor content not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Resume editor content deleted successfully",
    });
  } catch (error) {
    console.error("Delete resume editor error:", error.message);

    res.status(500).json({
      success: false,
      message: "Server error while deleting resume editor content",
    });
  }
};
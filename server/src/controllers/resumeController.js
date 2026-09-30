import Resume from "../models/Resume.js";
import parseResume from "../utils/resumeParser.js";

export const uploadResume = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "Please upload a resume file",
      });
    }

    // Extract text from the uploaded resume
    const extractedText = await parseResume(
      req.file.path,
      req.file.mimetype
    );

    // Save resume information and extracted text
    const resume = await Resume.create({
      user: req.userId,
      originalFileName: req.file.originalname,
      filePath: req.file.path,
      mimeType: req.file.mimetype,
      fileSize: req.file.size,
      extractedText,
    });

    res.status(201).json({
      success: true,
      message: "Resume uploaded and parsed successfully",
      resume: {
        id: resume._id,
        originalFileName: resume.originalFileName,
        mimeType: resume.mimeType,
        fileSize: resume.fileSize,
        extractedText: resume.extractedText,
        createdAt: resume.createdAt,
      },
    });
  } catch (error) {
    console.error("Resume upload/parsing error:", error.message);

    res.status(500).json({
      success: false,
      message: "Server error while uploading and parsing resume",
    });
  }
};

export const getMyResumes = async (req, res) => {
  try {
    const resumes = await Resume.find({
      user: req.userId,
    }).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      resumes,
    });
  } catch (error) {
    console.error("Get resumes error:", error.message);

    res.status(500).json({
      success: false,
      message: "Server error while getting resumes",
    });
  }
};
import Resume from "../models/Resume.js";

export const uploadResume = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "Please upload a resume file",
      });
    }

    const resume = await Resume.create({
      user: req.userId,
      originalFileName: req.file.originalname,
      filePath: req.file.path,
      mimeType: req.file.mimetype,
      fileSize: req.file.size,
    });

    res.status(201).json({
      success: true,
      message: "Resume uploaded successfully",
      resume: {
        id: resume._id,
        originalFileName: resume.originalFileName,
        mimeType: resume.mimeType,
        fileSize: resume.fileSize,
        createdAt: resume.createdAt,
      },
    });
  } catch (error) {
    console.error("Resume upload error:", error.message);

    res.status(500).json({
      success: false,
      message: "Server error while uploading resume",
    });
  }
};
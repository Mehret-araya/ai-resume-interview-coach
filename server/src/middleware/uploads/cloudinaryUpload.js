import multer from "multer";
import { CloudinaryStorage } from "multer-storage-cloudinary";

import cloudinary from "../../config/cloudinary.js";

const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: "ai-resume-interview-coach/resumes",
    resource_type: "raw",
    allowed_formats: ["pdf", "docx"],
  },
});

const cloudinaryUpload = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024,
  },
});

export default cloudinaryUpload;
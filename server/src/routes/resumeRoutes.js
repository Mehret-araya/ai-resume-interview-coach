import express from "express";

import authMiddleware from "../middleware/authMiddleware.js";

import upload from "../middleware/uploads/upload.js";
import cloudinaryUpload from "../middleware/uploads/cloudinaryUpload.js";

import {
  uploadResume,
  getMyResumes,
} from "../controllers/resumeController.js";

const router = express.Router();

const resumeUpload =
  process.env.NODE_ENV === "production"
    ? cloudinaryUpload
    : upload;

// Upload and parse a resume
router.post(
  "/upload",
  authMiddleware,
  resumeUpload.single("resume"),
  uploadResume
);

// Get all resumes belonging to the logged-in user
router.get(
  "/",
  authMiddleware,
  getMyResumes
);

export default router;
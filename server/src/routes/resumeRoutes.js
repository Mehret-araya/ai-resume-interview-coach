import express from "express";
import authMiddleware from "../middleware/authMiddleware.js";
import upload from "../middleware/uploads/upload.js";
import {
  uploadResume,
  getMyResumes,
} from "../controllers/resumeController.js";

const router = express.Router();

// Upload and parse a resume
router.post(
  "/upload",
  authMiddleware,
  upload.single("resume"),
  uploadResume
);

// Get all resumes belonging to the logged-in user
router.get(
  "/",
  authMiddleware,
  getMyResumes
);

export default router;
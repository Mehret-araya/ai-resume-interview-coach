import express from "express";
import authMiddleware from "../middleware/authMiddleware.js";
import {
  analyzeResume,
  getResumeAnalysis,
  getMyResumeAnalyses,
} from "../controllers/resumeAnalysisController.js";

const router = express.Router();

// Analyze a resume using the configured AI provider
router.post(
  "/:resumeId/analyze",
  authMiddleware,
  analyzeResume
);

// Get all analyses belonging to the logged-in user
router.get(
  "/analysis",
  authMiddleware,
  getMyResumeAnalyses
);

// Get one saved resume analysis
router.get(
  "/analysis/:analysisId",
  authMiddleware,
  getResumeAnalysis
);

export default router;
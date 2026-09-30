import express from "express";

import authMiddleware from "../middleware/authMiddleware.js";

import {
  rewriteResumeSection,
  getMyResumeRewrites,
} from "../controllers/resumeRewriteController.js";
const router = express.Router();

// Rewrite one section of a user's resume
router.get(
  "/rewrites",
  authMiddleware,
  getMyResumeRewrites
);

router.post(
  "/:resumeId/rewrite",
  authMiddleware,
  rewriteResumeSection
);

export default router;
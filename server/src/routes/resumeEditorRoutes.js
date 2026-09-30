import express from "express";

import authMiddleware from "../middleware/authMiddleware.js";

import {
  createOrUpdateResumeEditor,
  getResumeEditor,
  deleteResumeEditor,
} from "../controllers/resumeEditorController.js";

const router = express.Router();

// Save or update resume editor content

router.post(
  "/:resumeId/editor",
  authMiddleware,
  createOrUpdateResumeEditor
);

// Get saved resume editor content

router.get(
  "/:resumeId/editor",
  authMiddleware,
  getResumeEditor
);

// Delete saved resume editor content

router.delete(
  "/:resumeId/editor",
  authMiddleware,
  deleteResumeEditor
);

export default router;
import express from "express";

import authMiddleware from "../middleware/authMiddleware.js";

import {
  generateResumePdfFile,
} from "../controllers/resumePdfController.js";

const router = express.Router();

// Generate and download a resume PDF

router.get(
  "/:resumeId/pdf",
  authMiddleware,
  generateResumePdfFile
);

export default router;
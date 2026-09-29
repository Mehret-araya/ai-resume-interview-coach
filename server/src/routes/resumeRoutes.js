import express from "express";
import authMiddleware from "../middleware/authMiddleware.js";
import upload from "../middleware/uploads/upload.js";
import { uploadResume } from "../controllers/resumeController.js";

const router = express.Router();

router.post(
  "/upload",
  authMiddleware,
  (req, res, next) => {
    console.log("Upload request reached resume route");
    next();
  },
  upload.single("resume"),
  (req, res, next) => {
    console.log("Multer finished processing upload");
    console.log("Uploaded file:", req.file);
    next();
  },
  uploadResume
);

export default router;
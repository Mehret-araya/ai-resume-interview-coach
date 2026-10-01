import express from "express";
import authMiddleware from "../middleware/authMiddleware.js";
import {
  startInterview,
} from "../controllers/interviewController.js";

const router = express.Router();

router.post(
  "/start",
  authMiddleware,
  startInterview
);

export default router;
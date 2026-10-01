import express from "express";
import authMiddleware from "../middleware/authMiddleware.js";
import {
  startInterview,
  submitInterviewAnswer,
} from "../controllers/interviewController.js";

const router = express.Router();

router.post(
  "/start",
  authMiddleware,
  startInterview
);
router.post(
  "/:interviewId/answer",
  authMiddleware,
  submitInterviewAnswer
);

export default router;
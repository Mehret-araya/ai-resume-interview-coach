
import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import dotenv from "dotenv";
import rateLimit from "express-rate-limit";

import connectDB from "./config/database.js";

import authRoutes from "./routes/authRoutes.js";
import resumeRoutes from "./routes/resumeRoutes.js";
import resumeAnalysisRoutes from "./routes/resumeAnalysisRoutes.js";
import resumeRewriteRoutes from "./routes/resumeRewriteRoutes.js";
import resumeEditorRoutes from "./routes/resumeEditorRoutes.js";
import resumePdfRoutes from "./routes/resumePdfRoutes.js";
import interviewRoutes from "./routes/interviewRoutes.js";

dotenv.config();

const app = express();

const PORT = process.env.PORT || 5000;

// Connect to MongoDB
connectDB();

// Global rate limiter
const globalRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 100,
  standardHeaders: "draft-8",
  legacyHeaders: false,
  message: {
    success: false,
    message:
      "Too many requests. Please try again later.",
  },
});

// Security middleware
app.use(helmet());
app.use(globalRateLimiter);

// Enable requests from the frontend

app.use(
  cors({
    origin: "http://localhost:5174",
  })
);

// Parse JSON request bodies
app.use(express.json({ limit: "1mb" }));

// HTTP request logging
app.use(morgan("dev"));

// Authentication routes
app.use("/auth", authRoutes);

// Resume routes
app.use("/resumes", resumeRoutes);
app.use("/resumes", resumeAnalysisRoutes);
app.use("/resumes", resumeRewriteRoutes);
app.use("/resumes", resumeEditorRoutes);
app.use("/resumes", resumePdfRoutes);

// Interview routes
app.use("/interviews", interviewRoutes);

// Health check route
app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "AI Resume + Interview Coach API is running 🚀",
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});


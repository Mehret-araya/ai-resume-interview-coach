
import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import dotenv from "dotenv";
import connectDB from "./config/database.js";
import authRoutes from "./routes/authRoutes.js";
import resumeRoutes from "./routes/resumeRoutes.js";
import resumeAnalysisRoutes from "./routes/resumeAnalysisRoutes.js";
import resumeRewriteRoutes from "./routes/resumeRewriteRoutes.js";
import resumeEditorRoutes from "./routes/resumeEditorRoutes.js";

dotenv.config();

const app = express();

const PORT = process.env.PORT || 5000;

// Connect to MongoDB
connectDB();

// Security middleware
app.use(helmet());

// Enable requests from the frontend
app.use(cors());

// Parse JSON request bodies
app.use(express.json());

// HTTP request logging
app.use(morgan("dev"));

// Authentication routes
app.use("/auth", authRoutes);

// Resume routes
app.use("/resumes", resumeRoutes);
app.use("/resumes", resumeAnalysisRoutes);
app.use("/resumes", resumeRewriteRoutes);
app.use("/resumes", resumeEditorRoutes);
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



import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import dotenv from "dotenv";
import connectDB from "./config/database.js";

dotenv.config();

const app = express();

connectDB();

const PORT = process.env.PORT || 5000;

// Security middleware
app.use(helmet());

// Enable requests from the frontend
app.use(cors());

// Parse JSON request bodies
app.use(express.json());

// HTTP request logging
app.use(morgan("dev"));

// Health check route
app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "AI Resume + Interview Coach API is running 🚀"
  });
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});


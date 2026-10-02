
import express from "express";

import {
  register,
  login,
  getMe,
} from "../controllers/authController.js";

import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();

// Public authentication routes
router.post("/register", register);
router.post("/login", login);

// Protected authentication route
router.get("/me", authMiddleware, getMe);

export default router;


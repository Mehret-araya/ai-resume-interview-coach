import mongoose from "mongoose";

const resumeAnalysisSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    resume: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Resume",
      required: true,
    },

    summary: {
      type: String,
      default: "",
    },

    skills: {
      type: [String],
      default: [],
    },

    strengths: {
      type: [String],
      default: [],
    },

    improvementAreas: {
      type: [String],
      default: [],
    },

    experienceObservations: {
      type: [String],
      default: [],
    },

    educationObservations: {
      type: [String],
      default: [],
    },

    missingSections: {
      type: [String],
      default: [],
    },

    atsSuggestions: {
      type: [String],
      default: [],
    },

    rawAnalysis: {
      type: String,
      default: "",
    },
  },
  {
    timestamps: true,
  }
);

const ResumeAnalysis = mongoose.model(
  "ResumeAnalysis",
  resumeAnalysisSchema
);

export default ResumeAnalysis;
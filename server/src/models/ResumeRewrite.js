import mongoose from "mongoose";

const resumeRewriteSchema = new mongoose.Schema(
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

    section: {
      type: String,
      required: true,
      trim: true,
    },

    originalText: {
      type: String,
      required: true,
    },

    rewrittenText: {
      type: String,
      required: true,
    },

    instructions: {
      type: String,
      default: "",
    },
  },
  {
    timestamps: true,
  }
);

const ResumeRewrite = mongoose.model(
  "ResumeRewrite",
  resumeRewriteSchema
);

export default ResumeRewrite;
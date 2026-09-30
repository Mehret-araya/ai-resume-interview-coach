import mongoose from "mongoose";

const resumeEditorSchema = new mongoose.Schema(
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

    content: {
      type: String,
      required: true,
      default: "",
    },
  },
  {
    timestamps: true,
  }
);

const ResumeEditor = mongoose.model(
  "ResumeEditor",
  resumeEditorSchema
);

export default ResumeEditor;
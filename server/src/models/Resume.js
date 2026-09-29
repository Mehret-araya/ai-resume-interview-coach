import mongoose from "mongoose";

const resumeSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    originalFileName: {
      type: String,
      required: true,
      trim: true,
    },

    filePath: {
      type: String,
      required: true,
      trim: true,
    },

    mimeType: {
      type: String,
      required: true,
      trim: true,
    },

    fileSize: {
      type: Number,
      required: true,
    },

    extractedText: {
      type: String,
      default: "",
    },
  },
  {
    timestamps: true,
  }
);

const Resume = mongoose.model("Resume", resumeSchema);

export default Resume;
import mongoose from "mongoose";

const studyCircleSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    description: String,
    skill: { type: String, required: true },
    members: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    messages: [
      {
        sender: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
        text: { type: String, required: true },
        createdAt: { type: Date, default: Date.now }
      }
    ]
  },
  { timestamps: true }
);

export default mongoose.model("StudyCircle", studyCircleSchema);

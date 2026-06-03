import mongoose from "mongoose";

const progressSchema = new mongoose.Schema(
  {
    student: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    roadmap: { type: mongoose.Schema.Types.ObjectId, ref: "Roadmap", required: true },
    item: { type: String, required: true },
    completed: { type: Boolean, default: false },
    completedAt: Date
  },
  { timestamps: true }
);

export default mongoose.model("Progress", progressSchema);

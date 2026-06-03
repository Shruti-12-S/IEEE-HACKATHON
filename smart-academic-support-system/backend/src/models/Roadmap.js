import mongoose from "mongoose";

const resourceSchema = new mongoose.Schema(
  {
    title: String,
    type: String,
    url: String
  },
  { _id: false }
);

const stageSchema = new mongoose.Schema(
  {
    name: String,
    goals: [String],
    resources: [resourceSchema],
    projectIdeas: [String]
  },
  { _id: false }
);

const roadmapSchema = new mongoose.Schema(
  {
    student: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    skill: { type: String, required: true },
    summary: String,
    aiProvider: { type: String, default: "fallback" },
    stages: [stageSchema],
    progress: { type: Number, default: 0, min: 0, max: 100 },
    completedItems: [String]
  },
  { timestamps: true }
);

export default mongoose.model("Roadmap", roadmapSchema);

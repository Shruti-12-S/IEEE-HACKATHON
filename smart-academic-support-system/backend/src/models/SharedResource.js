import mongoose from "mongoose";

const sharedResourceSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    url: { type: String, required: true },
    type: { type: String, enum: ["video", "article", "documentation", "other"], default: "article" },
    skill: { type: String, required: true },
    submittedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    upvotes: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    downvotes: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }]
  },
  { timestamps: true }
);

export default mongoose.model("SharedResource", sharedResourceSchema);

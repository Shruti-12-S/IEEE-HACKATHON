import mongoose from "mongoose";

const p2pBookSchema = new mongoose.Schema(
  {
    owner: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    title: { type: String, required: true },
    author: { type: String, required: true },
    category: String,
    description: String,
    status: { type: String, enum: ["available", "requested", "borrowed"], default: "available" }
  },
  { timestamps: true }
);

export default mongoose.model("P2PBook", p2pBookSchema);

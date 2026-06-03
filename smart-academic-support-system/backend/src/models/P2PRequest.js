import mongoose from "mongoose";

const p2pRequestSchema = new mongoose.Schema(
  {
    book: { type: mongoose.Schema.Types.ObjectId, ref: "P2PBook", required: true },
    borrower: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    owner: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    status: { type: String, enum: ["pending", "approved", "rejected", "returned"], default: "pending" },
    message: String,
    notes: String
  },
  { timestamps: true }
);

export default mongoose.model("P2PRequest", p2pRequestSchema);

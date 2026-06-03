import mongoose from "mongoose";

const issueRequestSchema = new mongoose.Schema(
  {
    student: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    book: { type: mongoose.Schema.Types.ObjectId, ref: "Book", required: true },
    status: { type: String, enum: ["pending", "approved", "rejected", "return_requested", "returned"], default: "pending" },
    requestedAt: { type: Date, default: Date.now },
    approvedAt: Date,
    dueDate: Date,
    returnedAt: Date,
    renewalCount: { type: Number, default: 0 },
    notes: String
  },
  { timestamps: true }
);

export default mongoose.model("IssueRequest", issueRequestSchema);

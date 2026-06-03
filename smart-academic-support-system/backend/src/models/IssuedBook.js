import mongoose from "mongoose";

const issuedBookSchema = new mongoose.Schema(
  {
    issueRequest: { type: mongoose.Schema.Types.ObjectId, ref: "IssueRequest", required: true },
    student: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    book: { type: mongoose.Schema.Types.ObjectId, ref: "Book", required: true },
    issueDate: { type: Date, default: Date.now },
    dueDate: { type: Date, required: true },
    returnDate: Date,
    status: { type: String, enum: ["issued", "return_requested", "returned", "overdue"], default: "issued" },
    fine: { type: Number, default: 0 }
  },
  { timestamps: true }
);

export default mongoose.model("IssuedBook", issuedBookSchema);

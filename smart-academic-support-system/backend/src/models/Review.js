import mongoose from "mongoose";

const reviewSchema = new mongoose.Schema(
  {
    student: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    book: { type: mongoose.Schema.Types.ObjectId, ref: "Book", required: true },
    rating: { type: Number, min: 1, max: 5, required: true },
    comment: String
  },
  { timestamps: true }
);

reviewSchema.index({ student: 1, book: 1 }, { unique: true });

export default mongoose.model("Review", reviewSchema);

import mongoose from "mongoose";

const bookSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    author: { type: String, required: true, trim: true },
    isbn: { type: String, unique: true, sparse: true },
    category: { type: String, required: true },
    topic: { type: String, required: true },
    description: String,
    coverUrl: String,
    totalCopies: { type: Number, default: 1, min: 0 },
    availableCopies: { type: Number, default: 1, min: 0 },
    shelfLocation: String,
    tags: [String],
    averageRating: { type: Number, default: 0 },
    ratingCount: { type: Number, default: 0 },
    issueCount: { type: Number, default: 0 }
  },
  { timestamps: true }
);

bookSchema.index({ title: "text", author: "text", category: "text", topic: "text", tags: "text" });

export default mongoose.model("Book", bookSchema);

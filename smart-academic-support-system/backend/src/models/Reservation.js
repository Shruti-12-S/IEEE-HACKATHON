import mongoose from "mongoose";

const reservationSchema = new mongoose.Schema(
  {
    student: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    book: { type: mongoose.Schema.Types.ObjectId, ref: "Book", required: true },
    status: { type: String, enum: ["active", "fulfilled", "cancelled"], default: "active" },
    queuePosition: { type: Number, default: 1 }
  },
  { timestamps: true }
);

export default mongoose.model("Reservation", reservationSchema);

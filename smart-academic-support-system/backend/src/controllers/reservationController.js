import Book from "../models/Book.js";
import Notification from "../models/Notification.js";
import Reservation from "../models/Reservation.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const createReservation = asyncHandler(async (req, res) => {
  const book = await Book.findById(req.body.bookId);
  if (!book) return res.status(404).json({ message: "Book not found" });
  const duplicate = await Reservation.findOne({ student: req.user._id, book: book._id, status: "active" });
  if (duplicate) return res.status(409).json({ message: "You already have an active reservation for this book" });
  const activeCount = await Reservation.countDocuments({ book: book._id, status: "active" });
  const reservation = await Reservation.create({ student: req.user._id, book: book._id, queuePosition: activeCount + 1 });
  res.status(201).json(reservation);
});

export const myReservations = asyncHandler(async (req, res) => {
  res.json(await Reservation.find({ student: req.user._id }).populate("book").sort({ createdAt: -1 }));
});

export const allReservations = asyncHandler(async (req, res) => {
  res.json(await Reservation.find().populate("book").populate("student", "name email").sort({ createdAt: -1 }));
});

export const fulfillReservation = asyncHandler(async (req, res) => {
  const reservation = await Reservation.findById(req.params.id).populate("book").populate("student", "name email");
  if (!reservation) return res.status(404).json({ message: "Reservation not found" });
  if (reservation.status !== "active") return res.status(400).json({ message: "Only active reservations can be fulfilled" });
  if (reservation.book.availableCopies < 1) return res.status(400).json({ message: "No copies are available yet" });

  reservation.status = "fulfilled";
  await reservation.save();
  await Notification.create({
    user: reservation.student._id,
    title: "Reservation fulfilled",
    message: `${reservation.book.title} is now available for issue.`,
    type: "success"
  });

  res.json(reservation);
});

export const cancelReservation = asyncHandler(async (req, res) => {
  const reservation = await Reservation.findById(req.params.id).populate("book").populate("student", "name email");
  if (!reservation) return res.status(404).json({ message: "Reservation not found" });
  if (req.user.role !== "admin" && reservation.student._id.toString() !== req.user._id.toString()) {
    return res.status(403).json({ message: "You can only cancel your own reservation" });
  }
  if (reservation.status !== "active") return res.status(400).json({ message: "Only active reservations can be cancelled" });

  reservation.status = "cancelled";
  await reservation.save();
  await Notification.create({
    user: reservation.student._id,
    title: "Reservation cancelled",
    message: req.body.notes || `${reservation.book.title} reservation was cancelled by the library.`,
    type: "warning"
  });

  res.json(reservation);
});

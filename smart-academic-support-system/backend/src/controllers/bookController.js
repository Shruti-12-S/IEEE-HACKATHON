import Book from "../models/Book.js";
import Review from "../models/Review.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const listBooks = asyncHandler(async (req, res) => {
  const { q, title, author, category, topic, available, lowStock } = req.query;
  const filter = {};
  if (q) filter.$text = { $search: q };
  if (title) filter.title = new RegExp(title, "i");
  if (author) filter.author = new RegExp(author, "i");
  if (category) filter.category = new RegExp(category, "i");
  if (topic) filter.topic = new RegExp(topic, "i");
  if (available === "true") filter.availableCopies = { $gt: 0 };
  if (available === "false") filter.availableCopies = 0;
  if (lowStock === "true") filter.$expr = { $lte: ["$availableCopies", 2] };

  const books = await Book.find(filter).sort({ createdAt: -1 });
  res.json(books);
});

export const bookStats = asyncHandler(async (req, res) => {
  const [totalTitles, inventory] = await Promise.all([
    Book.countDocuments(),
    Book.aggregate([
      {
        $group: {
          _id: null,
          totalCopies: { $sum: "$totalCopies" },
          availableCopies: { $sum: "$availableCopies" },
          issuedCopies: { $sum: { $subtract: ["$totalCopies", "$availableCopies"] } },
          lowStock: { $sum: { $cond: [{ $lte: ["$availableCopies", 2] }, 1, 0] } },
          unavailable: { $sum: { $cond: [{ $eq: ["$availableCopies", 0] }, 1, 0] } }
        }
      }
    ])
  ]);

  res.json({
    totalTitles,
    totalCopies: inventory[0]?.totalCopies || 0,
    availableCopies: inventory[0]?.availableCopies || 0,
    issuedCopies: inventory[0]?.issuedCopies || 0,
    lowStock: inventory[0]?.lowStock || 0,
    unavailable: inventory[0]?.unavailable || 0
  });
});

export const getBook = asyncHandler(async (req, res) => {
  const book = await Book.findById(req.params.id);
  if (!book) return res.status(404).json({ message: "Book not found" });
  const reviews = await Review.find({ book: book._id }).populate("student", "name");
  res.json({ ...book.toObject(), reviews });
});

export const getAvailability = asyncHandler(async (req, res) => {
  const book = await Book.findById(req.params.id).select("title totalCopies availableCopies shelfLocation");
  if (!book) return res.status(404).json({ message: "Book not found" });
  res.json({
    bookId: book._id,
    title: book.title,
    totalCopies: book.totalCopies,
    availableCopies: book.availableCopies,
    shelfLocation: book.shelfLocation,
    available: book.availableCopies > 0,
    action: book.availableCopies > 0 ? "request_issue" : "reserve"
  });
});

export const createBook = asyncHandler(async (req, res) => {
  const totalCopies = Number(req.body.totalCopies ?? 1);
  const availableCopies = Number(req.body.availableCopies ?? totalCopies);
  if (availableCopies > totalCopies) return res.status(400).json({ message: "Available copies cannot exceed total copies" });
  const book = await Book.create({ ...req.body, totalCopies, availableCopies });
  res.status(201).json(book);
});

export const updateBook = asyncHandler(async (req, res) => {
  if (Number(req.body.availableCopies) > Number(req.body.totalCopies)) {
    return res.status(400).json({ message: "Available copies cannot exceed total copies" });
  }
  const book = await Book.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
  if (!book) return res.status(404).json({ message: "Book not found" });
  res.json(book);
});

export const adjustInventory = asyncHandler(async (req, res) => {
  const { totalDelta = 0, availableDelta = 0 } = req.body;
  const book = await Book.findById(req.params.id);
  if (!book) return res.status(404).json({ message: "Book not found" });

  const nextTotal = book.totalCopies + Number(totalDelta);
  const nextAvailable = book.availableCopies + Number(availableDelta);
  if (nextTotal < 0 || nextAvailable < 0) return res.status(400).json({ message: "Inventory cannot be negative" });
  if (nextAvailable > nextTotal) return res.status(400).json({ message: "Available copies cannot exceed total copies" });

  book.totalCopies = nextTotal;
  book.availableCopies = nextAvailable;
  await book.save();
  res.json(book);
});

export const deleteBook = asyncHandler(async (req, res) => {
  const book = await Book.findByIdAndDelete(req.params.id);
  if (!book) return res.status(404).json({ message: "Book not found" });
  res.json({ message: "Book deleted" });
});

export const rateBook = asyncHandler(async (req, res) => {
  const { rating, comment } = req.body;
  const review = await Review.findOneAndUpdate(
    { student: req.user._id, book: req.params.id },
    { rating, comment },
    { upsert: true, new: true, runValidators: true }
  );
  const stats = await Review.aggregate([
    { $match: { book: review.book } },
    { $group: { _id: "$book", averageRating: { $avg: "$rating" }, ratingCount: { $sum: 1 } } }
  ]);
  if (stats[0]) await Book.findByIdAndUpdate(review.book, stats[0]);
  res.json(review);
});

import P2PBook from "../models/P2PBook.js";
import P2PRequest from "../models/P2PRequest.js";
import { asyncHandler } from "../utils/asyncHandler.js";

// List available books listed by peer students
export const getP2PBooks = asyncHandler(async (req, res) => {
  const books = await P2PBook.find({ owner: { $ne: req.user._id } })
    .populate("owner", "name email department")
    .sort({ createdAt: -1 });
  res.json(books);
});

// List books listed by current student
export const getMyP2PBooks = asyncHandler(async (req, res) => {
  const books = await P2PBook.find({ owner: req.user._id })
    .sort({ createdAt: -1 });
  res.json(books);
});

// List a new book for peer sharing
export const addP2PBook = asyncHandler(async (req, res) => {
  const { title, author, category, description } = req.body;
  if (!title || !author) return res.status(400).json({ message: "Title and author are required" });

  const book = await P2PBook.create({
    owner: req.user._id,
    title,
    author,
    category,
    description,
    status: "available"
  });
  res.status(201).json(book);
});

// Delete listed book
export const deleteP2PBook = asyncHandler(async (req, res) => {
  const book = await P2PBook.findOne({ _id: req.params.id, owner: req.user._id });
  if (!book) return res.status(404).json({ message: "Book not found or unauthorized" });

  if (book.status === "borrowed") {
    return res.status(400).json({ message: "Cannot delete a book that is currently lent to a peer" });
  }

  // Clean up associated requests
  await P2PRequest.deleteMany({ book: req.params.id });
  await book.deleteOne();
  res.json({ message: "Book and active requests removed successfully" });
});

// Request to borrow a book
export const requestBorrowP2P = asyncHandler(async (req, res) => {
  const { bookId, message } = req.body;
  if (!bookId) return res.status(400).json({ message: "Book ID is required" });

  const book = await P2PBook.findById(bookId);
  if (!book) return res.status(404).json({ message: "Book not found" });
  if (book.status !== "available") return res.status(400).json({ message: "Book is not available for borrowing" });
  if (book.owner.toString() === req.user._id.toString()) {
    return res.status(400).json({ message: "You cannot borrow your own book" });
  }

  // Create request
  const request = await P2PRequest.create({
    book: bookId,
    borrower: req.user._id,
    owner: book.owner,
    message,
    status: "pending"
  });

  // Update book status
  book.status = "requested";
  await book.save();

  res.status(201).json(request);
});

// Get incoming requests (requests sent to the user to borrow their books)
export const getIncomingRequests = asyncHandler(async (req, res) => {
  const requests = await P2PRequest.find({ owner: req.user._id })
    .populate("book")
    .populate("borrower", "name email department")
    .sort({ createdAt: -1 });
  res.json(requests);
});

// Get outgoing requests (requests sent by the user to borrow books from others)
export const getOutgoingRequests = asyncHandler(async (req, res) => {
  const requests = await P2PRequest.find({ borrower: req.user._id })
    .populate("book")
    .populate("owner", "name email department")
    .sort({ createdAt: -1 });
  res.json(requests);
});

// Process borrow request (approve, reject, return)
export const handleBorrowRequest = asyncHandler(async (req, res) => {
  const { id, action } = req.params; // action = "approve" | "reject" | "return"
  const { notes } = req.body;

  const request = await P2PRequest.findById(id).populate("book");
  if (!request) return res.status(404).json({ message: "Borrow request not found" });

  if (action === "approve") {
    if (request.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Unauthorized action" });
    }
    if (request.status !== "pending") return res.status(400).json({ message: "Request already processed" });

    request.status = "approved";
    request.notes = notes || "Approved by peer owner";
    request.book.status = "borrowed";
    
    await request.save();
    await request.book.save();

    // Reject other pending requests for the same book
    await P2PRequest.updateMany(
      { book: request.book._id, _id: { $ne: request._id }, status: "pending" },
      { status: "rejected", notes: "Book lent to another student" }
    );
  } 
  else if (action === "reject") {
    if (request.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Unauthorized action" });
    }
    if (request.status !== "pending") return res.status(400).json({ message: "Request already processed" });

    request.status = "rejected";
    request.notes = notes || "Rejected by peer owner";
    request.book.status = "available";

    await request.save();
    await request.book.save();
  } 
  else if (action === "return") {
    // Either borrower or owner can trigger a return
    if (
      request.owner.toString() !== req.user._id.toString() &&
      request.borrower.toString() !== req.user._id.toString()
    ) {
      return res.status(403).json({ message: "Unauthorized action" });
    }
    if (request.status !== "approved") return res.status(400).json({ message: "Only approved loans can be returned" });

    request.status = "returned";
    request.notes = notes || "Marked as returned";
    request.book.status = "available";

    await request.save();
    await request.book.save();
  } 
  else {
    return res.status(400).json({ message: "Invalid action" });
  }

  res.json(request);
});

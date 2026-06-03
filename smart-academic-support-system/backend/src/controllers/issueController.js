import Book from "../models/Book.js";
import IssueRequest from "../models/IssueRequest.js";
import IssuedBook from "../models/IssuedBook.js";
import Notification from "../models/Notification.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const addDays = (days) => new Date(Date.now() + days * 24 * 60 * 60 * 1000);
const daysBetween = (from, to) => Math.ceil((from.getTime() - to.getTime()) / (24 * 60 * 60 * 1000));
const fineFor = (dueDate, rate = 5) => {
  if (!dueDate || dueDate >= new Date()) return 0;
  return Math.max(1, daysBetween(new Date(), dueDate)) * rate;
};
const issueMeta = (issue) => {
  const dueDate = issue.dueDate ? new Date(issue.dueDate) : null;
  const daysRemaining = dueDate ? Math.ceil((dueDate.getTime() - Date.now()) / (24 * 60 * 60 * 1000)) : null;
  const isOverdue = ["approved", "return_requested"].includes(issue.status) && dueDate && dueDate < new Date();
  return {
    ...issue.toObject(),
    daysRemaining,
    isOverdue,
    estimatedFine: fineFor(dueDate)
  };
};

export const requestIssue = asyncHandler(async (req, res) => {
  const book = await Book.findById(req.body.bookId);
  if (!book) return res.status(404).json({ message: "Book not found" });
  if (book.availableCopies < 1) return res.status(400).json({ message: "Book is unavailable. Please reserve it." });
  const duplicate = await IssueRequest.findOne({
    student: req.user._id,
    book: book._id,
    status: { $in: ["pending", "approved", "return_requested"] }
  });
  if (duplicate) return res.status(409).json({ message: "You already have an active request for this book" });

  const issue = await IssueRequest.create({ student: req.user._id, book: book._id });
  res.status(201).json(issue);
});

export const myIssues = asyncHandler(async (req, res) => {
  const issues = await IssueRequest.find({ student: req.user._id }).populate("book").sort({ createdAt: -1 });
  res.json(issues.map(issueMeta));
});

export const allIssues = asyncHandler(async (req, res) => {
  const { status, q, overdue } = req.query;
  const filter = {};
  if (status && status !== "all") filter.status = status;
  if (overdue === "true") {
    filter.status = { $in: ["approved", "return_requested"] };
    filter.dueDate = { $lt: new Date() };
  }

  let issues = await IssueRequest.find(filter).populate("book").populate("student", "name email department").sort({ createdAt: -1 });
  if (q) {
    const needle = q.toLowerCase();
    issues = issues.filter((issue) =>
      [issue.book?.title, issue.book?.author, issue.student?.name, issue.student?.email, issue.student?.department]
        .filter(Boolean)
        .some((value) => value.toLowerCase().includes(needle))
    );
  }

  res.json(issues.map(issueMeta));
});

export const issueStats = asyncHandler(async (req, res) => {
  const [statusCounts, overdueCount, dueSoonCount] = await Promise.all([
    IssueRequest.aggregate([{ $group: { _id: "$status", value: { $sum: 1 } } }]),
    IssueRequest.countDocuments({ status: { $in: ["approved", "return_requested"] }, dueDate: { $lt: new Date() } }),
    IssueRequest.countDocuments({ status: { $in: ["approved", "return_requested"] }, dueDate: { $gte: new Date(), $lte: addDays(3) } })
  ]);

  const counts = statusCounts.reduce((acc, item) => ({ ...acc, [item._id]: item.value }), {});
  res.json({
    total: Object.values(counts).reduce((sum, value) => sum + value, 0),
    pending: counts.pending || 0,
    approved: counts.approved || 0,
    rejected: counts.rejected || 0,
    returnRequested: counts.return_requested || 0,
    returned: counts.returned || 0,
    overdue: overdueCount,
    dueSoon: dueSoonCount
  });
});

export const overdueIssues = asyncHandler(async (req, res) => {
  const issues = await IssueRequest.find({
    status: { $in: ["approved", "return_requested"] },
    dueDate: { $lt: new Date() }
  })
    .populate("book")
    .populate("student", "name email department")
    .sort({ dueDate: 1 });

  res.json(
    issues.map((issue) => ({
      ...issue.toObject(),
      daysOverdue: Math.max(1, Math.ceil((Date.now() - issue.dueDate.getTime()) / (24 * 60 * 60 * 1000))),
      estimatedFine: Math.max(1, Math.ceil((Date.now() - issue.dueDate.getTime()) / (24 * 60 * 60 * 1000))) * 5
    }))
  );
});

export const approveIssue = asyncHandler(async (req, res) => {
  const issue = await IssueRequest.findById(req.params.id).populate("book");
  if (!issue) return res.status(404).json({ message: "Issue request not found" });
  if (issue.status !== "pending") return res.status(400).json({ message: "Only pending requests can be approved" });
  if (issue.book.availableCopies < 1) return res.status(400).json({ message: "No copies available" });

  issue.status = "approved";
  issue.approvedAt = new Date();
  issue.dueDate = req.body.dueDate ? new Date(req.body.dueDate) : addDays(Number(req.body.loanDays || 14));
  issue.notes = req.body.notes || issue.notes;
  await issue.save();

  await Book.findByIdAndUpdate(issue.book._id, { $inc: { availableCopies: -1, issueCount: 1 } });
  const issuedBook = await IssuedBook.create({ issueRequest: issue._id, student: issue.student, book: issue.book._id, dueDate: issue.dueDate });
  await Notification.create({ user: issue.student, title: "Book issued", message: `${issue.book.title} is approved until ${issue.dueDate.toDateString()}.`, type: "success" });

  res.json({ issue, issuedBook });
});

export const rejectIssue = asyncHandler(async (req, res) => {
  const issue = await IssueRequest.findById(req.params.id);
  if (!issue) return res.status(404).json({ message: "Issue request not found" });
  if (issue.status !== "pending") return res.status(400).json({ message: "Only pending requests can be rejected" });
  issue.status = "rejected";
  issue.notes = req.body.notes || "Rejected by library admin";
  await issue.save();
  await Notification.create({ user: issue.student, title: "Issue request rejected", message: req.body.notes || "Your book request was rejected.", type: "warning" });
  res.json(issue);
});

export const returnIssue = asyncHandler(async (req, res) => {
  const issue = await IssueRequest.findById(req.params.id).populate("book");
  if (!issue) return res.status(404).json({ message: "Issue request not found" });
  if (req.user.role !== "admin" && issue.student.toString() !== req.user._id.toString()) {
    return res.status(403).json({ message: "You can only return your own issued books" });
  }
  if (!["approved", "return_requested"].includes(issue.status)) return res.status(400).json({ message: "Only approved issued books can be returned" });
  if (req.user.role !== "admin") {
    issue.status = "return_requested";
    issue.notes = req.body.notes || "Student requested return";
    await issue.save();
    await IssuedBook.findOneAndUpdate({ issueRequest: issue._id }, { status: "return_requested" });
    await Notification.create({
      user: issue.student,
      title: "Return request submitted",
      message: `${issue.book.title} return request is waiting for librarian confirmation.`,
      type: "info"
    });
    return res.json(issueMeta(issue));
  }
  issue.status = "returned";
  issue.returnedAt = new Date();
  issue.notes = req.body.notes || issue.notes;
  const fine = fineFor(issue.dueDate);
  await issue.save();
  await IssuedBook.findOneAndUpdate({ issueRequest: issue._id }, { status: "returned", returnDate: new Date(), fine });
  await Book.findByIdAndUpdate(issue.book._id, { $inc: { availableCopies: 1 } });
  await Notification.create({ user: issue.student, title: "Book returned", message: `${issue.book.title} return has been recorded.${fine ? ` Fine due: Rs. ${fine}.` : ""}`, type: fine ? "warning" : "info" });
  res.json({ ...issueMeta(issue), fine });
});

export const renewIssue = asyncHandler(async (req, res) => {
  const issue = await IssueRequest.findOne({ _id: req.params.id, student: req.user._id });
  if (!issue) return res.status(404).json({ message: "Issue not found" });
  if (issue.status !== "approved") return res.status(400).json({ message: "Only approved issued books can be renewed" });
  if (issue.renewalCount >= 2) return res.status(400).json({ message: "Renewal limit reached" });
  issue.dueDate = new Date(Math.max(Date.now(), issue.dueDate?.getTime?.() || Date.now()) + 14 * 24 * 60 * 60 * 1000);
  issue.renewalCount += 1;
  await issue.save();
  await IssuedBook.findOneAndUpdate({ issueRequest: issue._id }, { dueDate: issue.dueDate });
  await Notification.create({ user: issue.student, title: "Book renewed", message: `Your due date has been extended to ${issue.dueDate.toDateString()}.`, type: "success" });
  res.json(issueMeta(issue));
});

export const extendIssue = asyncHandler(async (req, res) => {
  const issue = await IssueRequest.findById(req.params.id).populate("book");
  if (!issue) return res.status(404).json({ message: "Issue not found" });
  if (issue.status !== "approved") return res.status(400).json({ message: "Only approved issued books can be extended" });

  const days = Number(req.body.days || 7);
  issue.dueDate = new Date((issue.dueDate || new Date()).getTime() + days * 24 * 60 * 60 * 1000);
  issue.notes = req.body.notes || issue.notes;
  await issue.save();
  await IssuedBook.findOneAndUpdate({ issueRequest: issue._id }, { dueDate: issue.dueDate });
  await Notification.create({ user: issue.student, title: "Due date extended", message: `${issue.book.title} is now due on ${issue.dueDate.toDateString()}.`, type: "success" });
  res.json(issue);
});

export const cancelIssue = asyncHandler(async (req, res) => {
  const issue = await IssueRequest.findById(req.params.id);
  if (!issue) return res.status(404).json({ message: "Issue request not found" });
  if (issue.status !== "pending") return res.status(400).json({ message: "Only pending requests can be cancelled" });
  if (req.user.role !== "admin" && issue.student.toString() !== req.user._id.toString()) {
    return res.status(403).json({ message: "You can only cancel your own request" });
  }

  issue.status = "rejected";
  issue.notes = req.body.notes || (req.user.role === "admin" ? "Cancelled by admin" : "Cancelled by student");
  await issue.save();
  await Notification.create({ user: issue.student, title: "Issue request cancelled", message: issue.notes, type: "info" });
  res.json(issue);
});

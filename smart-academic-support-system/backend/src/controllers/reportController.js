import Book from "../models/Book.js";
import IssueRequest from "../models/IssueRequest.js";
import IssuedBook from "../models/IssuedBook.js";
import Reservation from "../models/Reservation.js";
import User from "../models/User.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const adminReport = asyncHandler(async (req, res) => {
  const today = new Date();
  const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
  const sixMonthsAgo = new Date(today.getFullYear(), today.getMonth() - 5, 1);

  const [
    totalBooks,
    issuedBooks,
    overdueBooks,
    activeStudents,
    pendingRequests,
    popularBooks,
    activeReservations,
    inventory,
    lowStockBooks,
    unavailableBooks,
    pendingIssueRequests,
    overdueIssueList,
    activeReservationList,
    recentIssueRequests,
    categoryDistribution,
    requestStatusDistribution,
    reservationStatusDistribution,
    topAuthors,
    issueTrend,
    departmentActivity,
    newStudentsThisWeek
  ] = await Promise.all([
    Book.countDocuments(),
    IssuedBook.countDocuments({ status: { $in: ["issued", "overdue", "return_requested"] } }),
    IssuedBook.countDocuments({ dueDate: { $lt: today }, status: { $ne: "returned" } }),
    User.countDocuments({ role: "student", isActive: true }),
    IssueRequest.countDocuments({ status: "pending" }),
    Book.find().sort({ issueCount: -1, averageRating: -1 }).limit(5),
    Reservation.countDocuments({ status: "active" }),
    Book.aggregate([
      {
        $group: {
          _id: null,
          totalCopies: { $sum: "$totalCopies" },
          availableCopies: { $sum: "$availableCopies" },
          issuedCopies: { $sum: { $subtract: ["$totalCopies", "$availableCopies"] } },
          averageRating: { $avg: "$averageRating" }
        }
      }
    ]),
    Book.find({ availableCopies: { $lte: 2 } }).sort({ availableCopies: 1, issueCount: -1 }).limit(6),
    Book.find({ availableCopies: 0 }).sort({ issueCount: -1 }).limit(6),
    IssueRequest.find({ status: "pending" }).populate("book", "title author").populate("student", "name email department").sort({ createdAt: -1 }).limit(6),
    IssueRequest.find({ status: { $in: ["approved", "return_requested"] }, dueDate: { $lt: today } }).populate("book", "title author").populate("student", "name email department").sort({ dueDate: 1 }).limit(6),
    Reservation.find({ status: "active" }).populate("book", "title availableCopies totalCopies").populate("student", "name email").sort({ createdAt: 1 }).limit(6),
    IssueRequest.find().populate("book", "title").populate("student", "name").sort({ createdAt: -1 }).limit(8),
    Book.aggregate([{ $group: { _id: "$category", value: { $sum: 1 } } }, { $sort: { value: -1 } }, { $limit: 8 }]),
    IssueRequest.aggregate([{ $group: { _id: "$status", value: { $sum: 1 } } }, { $sort: { value: -1 } }]),
    Reservation.aggregate([{ $group: { _id: "$status", value: { $sum: 1 } } }, { $sort: { value: -1 } }]),
    Book.aggregate([{ $group: { _id: "$author", value: { $sum: "$issueCount" }, titles: { $sum: 1 } } }, { $sort: { value: -1, titles: -1 } }, { $limit: 8 }]),
    IssueRequest.aggregate([
      { $match: { createdAt: { $gte: sixMonthsAgo } } },
      { $group: { _id: { year: { $year: "$createdAt" }, month: { $month: "$createdAt" } }, value: { $sum: 1 } } },
      { $sort: { "_id.year": 1, "_id.month": 1 } }
    ]),
    IssueRequest.aggregate([
      { $lookup: { from: "users", localField: "student", foreignField: "_id", as: "studentInfo" } },
      { $unwind: "$studentInfo" },
      { $group: { _id: "$studentInfo.department", value: { $sum: 1 } } },
      { $sort: { value: -1 } },
      { $limit: 8 }
    ]),
    User.countDocuments({ role: "student", createdAt: { $gte: weekAgo } })
  ]);

  const inv = inventory[0] || {};
  const utilizationRate = inv.totalCopies ? Math.round(((inv.issuedCopies || 0) / inv.totalCopies) * 100) : 0;
  const estimatedFineExposure = overdueIssueList.reduce((sum, issue) => {
    const days = Math.max(1, Math.ceil((today.getTime() - issue.dueDate.getTime()) / (24 * 60 * 60 * 1000)));
    return sum + days * 5;
  }, 0);

  res.json({
    totalBooks,
    issuedBooks,
    overdueBooks,
    activeStudents,
    pendingRequests,
    activeReservations,
    newStudentsThisWeek,
    totalCopies: inv.totalCopies || 0,
    availableCopies: inv.availableCopies || 0,
    issuedCopies: inv.issuedCopies || 0,
    averageRating: Number((inv.averageRating || 0).toFixed(1)),
    utilizationRate,
    estimatedFineExposure,
    lowStockCount: lowStockBooks.length,
    unavailableCount: unavailableBooks.length,
    popularBooks,
    lowStockBooks,
    unavailableBooks,
    pendingIssueRequests,
    overdueIssueList: overdueIssueList.map((issue) => ({
      ...issue.toObject(),
      daysOverdue: Math.max(1, Math.ceil((today.getTime() - issue.dueDate.getTime()) / (24 * 60 * 60 * 1000)))
    })),
    activeReservationList,
    recentIssueRequests,
    categoryDistribution: categoryDistribution.map((item) => ({ label: item._id || "Uncategorized", value: item.value })),
    requestStatusDistribution: requestStatusDistribution.map((item) => ({ label: item._id || "unknown", value: item.value })),
    reservationStatusDistribution: reservationStatusDistribution.map((item) => ({ label: item._id || "unknown", value: item.value })),
    topAuthors: topAuthors.map((item) => ({ label: item._id || "Unknown author", value: item.value, titles: item.titles })),
    issueTrend: issueTrend.map((item) => ({
      label: `${item._id.year}-${String(item._id.month).padStart(2, "0")}`,
      value: item.value
    })),
    departmentActivity: departmentActivity.map((item) => ({ label: item._id || "Unknown department", value: item.value })),
    chart: [
      { label: "Total Books", value: totalBooks },
      { label: "Issued", value: issuedBooks },
      { label: "Overdue", value: overdueBooks },
      { label: "Students", value: activeStudents },
      { label: "Reservations", value: activeReservations }
    ]
  });
});

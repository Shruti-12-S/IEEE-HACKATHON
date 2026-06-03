import Notification from "../models/Notification.js";
import IssueRequest from "../models/IssueRequest.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const listNotifications = asyncHandler(async (req, res) => {
  const overdueIssues = await IssueRequest.find({
    student: req.user._id,
    status: "approved",
    dueDate: { $lt: new Date() }
  }).populate("book", "title");

  await Promise.all(
    overdueIssues.map(async (issue) => {
      const days = Math.max(1, Math.ceil((Date.now() - issue.dueDate.getTime()) / (24 * 60 * 60 * 1000)));
      const existing = await Notification.findOne({
        user: req.user._id,
        title: "Overdue fine alert",
        message: new RegExp(issue.book?.title || "", "i"),
        read: false
      });
      if (!existing) {
        await Notification.create({
          user: req.user._id,
          title: "Overdue fine alert",
          message: `${issue.book?.title || "A book"} is ${days} days overdue. Estimated fine is Rs. ${days * 5}.`,
          type: "danger"
        });
      }
    })
  );

  res.json(await Notification.find({ user: req.user._id }).sort({ createdAt: -1 }));
});

export const markRead = asyncHandler(async (req, res) => {
  const notification = await Notification.findOneAndUpdate({ _id: req.params.id, user: req.user._id }, { read: true }, { new: true });
  if (!notification) return res.status(404).json({ message: "Notification not found" });
  res.json(notification);
});

export const markAllRead = asyncHandler(async (req, res) => {
  await Notification.updateMany({ user: req.user._id, read: false }, { read: true });
  res.json({ message: "All notifications marked as read" });
});

export const deleteNotification = asyncHandler(async (req, res) => {
  const notification = await Notification.findOneAndDelete({ _id: req.params.id, user: req.user._id });
  if (!notification) return res.status(404).json({ message: "Notification not found" });
  res.json({ message: "Notification deleted" });
});

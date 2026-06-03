import express from "express";
import { allIssues, approveIssue, cancelIssue, extendIssue, issueStats, myIssues, overdueIssues, rejectIssue, renewIssue, requestIssue, returnIssue } from "../controllers/issueController.js";
import { protect, requireRole } from "../middleware/auth.js";

const router = express.Router();

router.post("/request", protect, requireRole("student"), requestIssue);
router.get("/my", protect, requireRole("student"), myIssues);
router.get("/all", protect, requireRole("admin"), allIssues);
router.get("/stats", protect, requireRole("admin"), issueStats);
router.get("/overdue", protect, requireRole("admin"), overdueIssues);
router.patch("/:id/approve", protect, requireRole("admin"), approveIssue);
router.patch("/:id/reject", protect, requireRole("admin"), rejectIssue);
router.patch("/:id/extend", protect, requireRole("admin"), extendIssue);
router.patch("/:id/cancel", protect, cancelIssue);
router.patch("/:id/return", protect, returnIssue);
router.patch("/:id/renew", protect, requireRole("student"), renewIssue);

export default router;

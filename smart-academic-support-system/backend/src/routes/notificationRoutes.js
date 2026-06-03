import express from "express";
import { deleteNotification, listNotifications, markAllRead, markRead } from "../controllers/notificationController.js";
import { protect } from "../middleware/auth.js";

const router = express.Router();

router.get("/", protect, listNotifications);
router.patch("/read-all", protect, markAllRead);
router.patch("/:id/read", protect, markRead);
router.delete("/:id", protect, deleteNotification);

export default router;

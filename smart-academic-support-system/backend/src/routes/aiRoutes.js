import express from "express";
import { chat, status } from "../controllers/aiController.js";
import { protect, requireRole } from "../middleware/auth.js";

const router = express.Router();

router.post("/chat", protect, requireRole("student"), chat);
router.get("/status", protect, status);

export default router;

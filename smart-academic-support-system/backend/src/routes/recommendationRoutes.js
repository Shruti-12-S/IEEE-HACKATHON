import express from "express";
import { recommendBooks } from "../controllers/recommendationController.js";
import { protect, requireRole } from "../middleware/auth.js";

const router = express.Router();

router.get("/books", protect, requireRole("student"), recommendBooks);

export default router;

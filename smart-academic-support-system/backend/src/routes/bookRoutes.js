import express from "express";
import { adjustInventory, bookStats, createBook, deleteBook, getAvailability, getBook, listBooks, rateBook, updateBook } from "../controllers/bookController.js";
import { protect, requireRole } from "../middleware/auth.js";

const router = express.Router();

router.get("/", protect, listBooks);
router.get("/admin/stats", protect, requireRole("admin"), bookStats);
router.get("/:id/availability", protect, getAvailability);
router.get("/:id", protect, getBook);
router.post("/", protect, requireRole("admin"), createBook);
router.put("/:id", protect, requireRole("admin"), updateBook);
router.patch("/:id/inventory", protect, requireRole("admin"), adjustInventory);
router.delete("/:id", protect, requireRole("admin"), deleteBook);
router.post("/:id/rate", protect, requireRole("student"), rateBook);

export default router;

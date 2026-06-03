import express from "express";
import { adminReport } from "../controllers/reportController.js";
import { protect, requireRole } from "../middleware/auth.js";

const router = express.Router();

router.get("/admin", protect, requireRole("admin"), adminReport);

export default router;

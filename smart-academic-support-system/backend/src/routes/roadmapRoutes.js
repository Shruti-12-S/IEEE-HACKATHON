import express from "express";
import { generateRoadmap, myRoadmaps, updateRoadmapProgress } from "../controllers/roadmapController.js";
import { protect, requireRole } from "../middleware/auth.js";

const router = express.Router();

router.post("/generate", protect, requireRole("student"), generateRoadmap);
router.get("/my", protect, requireRole("student"), myRoadmaps);
router.patch("/:id/progress", protect, requireRole("student"), updateRoadmapProgress);

export default router;

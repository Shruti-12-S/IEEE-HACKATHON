import Roadmap from "../models/Roadmap.js";
import Progress from "../models/Progress.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { generateAiRoadmap } from "../utils/aiService.js";

export const generateRoadmap = asyncHandler(async (req, res) => {
  if (!req.body.skill) return res.status(400).json({ message: "Skill is required" });
  const { provider, roadmap: draft } = await generateAiRoadmap({ skill: req.body.skill, user: req.user });
  const roadmap = await Roadmap.create({ student: req.user._id, ...draft, aiProvider: provider });
  res.status(201).json(roadmap);
});

export const myRoadmaps = asyncHandler(async (req, res) => {
  res.json(await Roadmap.find({ student: req.user._id }).sort({ createdAt: -1 }));
});

export const updateRoadmapProgress = asyncHandler(async (req, res) => {
  const { progress, item, completed = true } = req.body;
  const roadmap = await Roadmap.findOne({ _id: req.params.id, student: req.user._id });
  if (!roadmap) return res.status(404).json({ message: "Roadmap not found" });
  if (typeof progress === "number") roadmap.progress = Math.max(0, Math.min(100, progress));
  if (item) {
    if (completed && !roadmap.completedItems.includes(item)) roadmap.completedItems.push(item);
    if (!completed) roadmap.completedItems = roadmap.completedItems.filter((value) => value !== item);
    await Progress.findOneAndUpdate(
      { student: req.user._id, roadmap: roadmap._id, item },
      { completed, completedAt: completed ? new Date() : null },
      { upsert: true }
    );
  }
  await roadmap.save();
  res.json(roadmap);
});

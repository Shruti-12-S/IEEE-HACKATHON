import StudyCircle from "../models/StudyCircle.js";
import Roadmap from "../models/Roadmap.js";
import SharedResource from "../models/SharedResource.js";
import { asyncHandler } from "../utils/asyncHandler.js";

// Peer matching algorithm
export const getPeers = asyncHandler(async (req, res) => {
  const myRoadmaps = await Roadmap.find({ student: req.user._id });
  if (!myRoadmaps.length) return res.json([]);

  const mySkills = myRoadmaps.map((r) => r.skill);

  const otherRoadmaps = await Roadmap.find({
    student: { $ne: req.user._id },
    skill: { $in: mySkills }
  }).populate("student", "name email department");

  const suggestions = otherRoadmaps.map((other) => {
    const myMatch = myRoadmaps.find((r) => r.skill === other.skill);
    const myProgress = myMatch ? myMatch.progress : 0;
    const diff = Math.abs(myProgress - other.progress);

    return {
      student: other.student,
      skill: other.skill,
      progress: other.progress,
      similarity: Math.max(0, 100 - diff)
    };
  });

  suggestions.sort((a, b) => b.similarity - a.similarity);
  res.json(suggestions);
});

// List Study Circles
export const getCircles = asyncHandler(async (req, res) => {
  const circles = await StudyCircle.find()
    .populate("members", "name email department")
    .sort({ updatedAt: -1 });
  res.json(circles);
});

// Create Study Circle
export const createCircle = asyncHandler(async (req, res) => {
  const { name, description, skill } = req.body;
  if (!name || !skill) return res.status(400).json({ message: "Name and skill are required" });

  const circle = await StudyCircle.create({
    name,
    description,
    skill,
    members: [req.user._id]
  });

  const populated = await StudyCircle.findById(circle._id).populate("members", "name email department");
  res.status(201).json(populated);
});

// Join Study Circle
export const joinCircle = asyncHandler(async (req, res) => {
  const circle = await StudyCircle.findById(req.params.id);
  if (!circle) return res.status(404).json({ message: "Study circle not found" });

  if (!circle.members.includes(req.user._id)) {
    circle.members.push(req.user._id);
    await circle.save();
  }

  const populated = await StudyCircle.findById(circle._id).populate("members", "name email department");
  res.json(populated);
});

// Get Messages / Poll Board
export const getMessages = asyncHandler(async (req, res) => {
  const circle = await StudyCircle.findById(req.params.id)
    .populate("messages.sender", "name email");
  if (!circle) return res.status(404).json({ message: "Study circle not found" });

  res.json(circle.messages);
});

// Post message to Circle
export const postMessage = asyncHandler(async (req, res) => {
  const { text } = req.body;
  if (!text) return res.status(400).json({ message: "Message text is required" });

  const circle = await StudyCircle.findById(req.params.id);
  if (!circle) return res.status(404).json({ message: "Study circle not found" });

  circle.messages.push({ sender: req.user._id, text });
  await circle.save();

  const populated = await StudyCircle.findById(circle._id)
    .populate("messages.sender", "name email");

  res.status(201).json(populated.messages);
});

// Submit shared link resource
export const submitResource = asyncHandler(async (req, res) => {
  const { title, url, type, skill } = req.body;
  if (!title || !url || !skill) return res.status(400).json({ message: "Title, url, and skill are required" });

  const resource = await SharedResource.create({
    title,
    url,
    type,
    skill,
    submittedBy: req.user._id,
    upvotes: [req.user._id]
  });

  const populated = await SharedResource.findById(resource._id).populate("submittedBy", "name");
  res.status(201).json(populated);
});

// Get Resources list for skill (Reddit-Style)
export const getResources = asyncHandler(async (req, res) => {
  const { skill } = req.params;
  const list = await SharedResource.find({ skill }).populate("submittedBy", "name");

  const mapped = list.map((item) => {
    const isUp = item.upvotes.includes(req.user._id);
    const isDown = item.downvotes.includes(req.user._id);
    return {
      ...item.toObject(),
      score: item.upvotes.length - item.downvotes.length,
      userVote: isUp ? "up" : isDown ? "down" : null
    };
  });

  mapped.sort((a, b) => b.score - a.score);
  res.json(mapped);
});

// Vote resource link
export const voteResource = asyncHandler(async (req, res) => {
  const { vote } = req.body; // "up", "down", "clear"
  const resource = await SharedResource.findById(req.params.id);
  if (!resource) return res.status(404).json({ message: "Resource not found" });

  // Remove from both lists first
  resource.upvotes = resource.upvotes.filter((id) => id.toString() !== req.user._id.toString());
  resource.downvotes = resource.downvotes.filter((id) => id.toString() !== req.user._id.toString());

  if (vote === "up") {
    resource.upvotes.push(req.user._id);
  } else if (vote === "down") {
    resource.downvotes.push(req.user._id);
  }

  await resource.save();
  res.json({
    _id: resource._id,
    score: resource.upvotes.length - resource.downvotes.length,
    userVote: vote === "clear" ? null : vote
  });
});

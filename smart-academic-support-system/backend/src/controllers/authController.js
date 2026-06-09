import User from "../models/User.js";
import { isProductionRuntime } from "../config/env.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { signToken } from "../utils/token.js";

const userPayload = (user) => ({
  id: user._id,
  name: user.name,
  email: user.email,
  role: user.role,
  studentId: user.studentId,
  department: user.department,
  interests: user.interests,
  favoriteGenres: user.favoriteGenres,
  favoriteAuthors: user.favoriteAuthors,
  loginCount: user.loginCount
});

export const register = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body;
  const exists = await User.findOne({ email });
  if (exists) return res.status(409).json({ message: "Email already registered" });

  const user = await User.create({
    name,
    email,
    password,
    studentId: `STU${Date.now().toString().slice(-6)}`
  });

  res.status(201).json({ user: userPayload(user), token: signToken(user) });
});

export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });
  if (!user || !(await user.matchPassword(password))) {
    return res.status(401).json({ message: "Invalid email or password" });
  }

  user.loginCount = (user.loginCount || 0) + 1;
  await user.save();

  res.json({ user: userPayload(user), token: signToken(user) });
});

export const me = asyncHandler(async (req, res) => {
  res.json({ user: userPayload(req.user) });
});

export const updateProfile = asyncHandler(async (req, res) => {
  const allowed = ["name", "department", "interests", "favoriteGenres", "favoriteAuthors"];
  const updates = {};
  allowed.forEach((field) => {
    if (req.body[field] !== undefined) updates[field] = req.body[field];
  });

  const user = await User.findByIdAndUpdate(req.user._id, updates, { new: true, runValidators: true });
  res.json({ user: userPayload(user) });
});

export const resetPassword = asyncHandler(async (req, res) => {
  if (isProductionRuntime()) {
    return res.status(503).json({
      message: "Password reset is unavailable. Contact an administrator for account recovery."
    });
  }

  const { email, studentId, newPassword } = req.body;
  if (!email || !studentId || !newPassword) {
    return res.status(400).json({ message: "Email, Student ID, and new password are required" });
  }

  const user = await User.findOne({ email: email.toLowerCase(), studentId: studentId.toUpperCase() });
  if (!user) {
    return res.status(404).json({ message: "No account found matching this email and Student ID" });
  }

  if (newPassword.length < 6) {
    return res.status(400).json({ message: "Password must be at least 6 characters long" });
  }

  user.password = newPassword;
  await user.save();

  res.json({ message: "Password reset successful. You can now log in with your new password." });
});

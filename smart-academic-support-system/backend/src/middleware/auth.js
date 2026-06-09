import jwt from "jsonwebtoken";
import User from "../models/User.js";
import { getJwtSecret } from "../config/env.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const protect = asyncHandler(async (req, res, next) => {
  const header = req.headers.authorization || "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : null;

  if (!token) {
    return res.status(401).json({ message: "Authentication required" });
  }

  const decoded = jwt.verify(token, getJwtSecret());
  const user = await User.findById(decoded.id).select("-password");
  if (!user || !user.isActive) {
    return res.status(401).json({ message: "User not found or inactive" });
  }

  req.user = user;
  next();
});

export const requireRole = (...roles) => (req, res, next) => {
  if (!roles.includes(req.user.role)) {
    return res.status(403).json({ message: "You do not have permission for this action" });
  }
  next();
};

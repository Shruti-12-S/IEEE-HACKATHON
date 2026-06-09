import jwt from "jsonwebtoken";
import { getJwtSecret } from "../config/env.js";

export const signToken = (user) =>
  jwt.sign(
    { id: user._id, role: user.role },
    getJwtSecret(),
    { expiresIn: process.env.JWT_EXPIRES_IN || "7d" }
  );

import express from "express";
import { login, me, register, updateProfile, resetPassword } from "../controllers/authController.js";
import { protect } from "../middleware/auth.js";

const router = express.Router();

router.post("/register", register);
router.post("/login", login);
router.post("/forgot-password", resetPassword);
router.get("/me", protect, me);
router.patch("/me", protect, updateProfile);

export default router;

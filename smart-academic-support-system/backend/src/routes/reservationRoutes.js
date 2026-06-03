import express from "express";
import { allReservations, cancelReservation, createReservation, fulfillReservation, myReservations } from "../controllers/reservationController.js";
import { protect, requireRole } from "../middleware/auth.js";

const router = express.Router();

router.post("/", protect, requireRole("student"), createReservation);
router.get("/my", protect, requireRole("student"), myReservations);
router.get("/all", protect, requireRole("admin"), allReservations);
router.patch("/:id/fulfill", protect, requireRole("admin"), fulfillReservation);
router.patch("/:id/cancel", protect, cancelReservation);

export default router;

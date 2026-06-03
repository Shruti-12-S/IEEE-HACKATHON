import express from "express";
import { getPeers, getCircles, createCircle, joinCircle, getMessages, postMessage, submitResource, getResources, voteResource } from "../controllers/studyCircleController.js";
import { protect } from "../middleware/auth.js";

const router = express.Router();

router.get("/peers", protect, getPeers);
router.get("/", protect, getCircles);
router.post("/", protect, createCircle);
router.post("/:id/join", protect, joinCircle);
router.get("/:id/messages", protect, getMessages);
router.post("/:id/messages", protect, postMessage);

router.get("/resources/:skill", protect, getResources);
router.post("/resources", protect, submitResource);
router.post("/resources/:id/vote", protect, voteResource);

export default router;

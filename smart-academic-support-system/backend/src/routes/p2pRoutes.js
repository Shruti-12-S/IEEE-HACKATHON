import express from "express";
import { getP2PBooks, getMyP2PBooks, addP2PBook, deleteP2PBook, requestBorrowP2P, getIncomingRequests, getOutgoingRequests, handleBorrowRequest } from "../controllers/p2pController.js";
import { protect } from "../middleware/auth.js";

const router = express.Router();

router.get("/books", protect, getP2PBooks);
router.get("/my-books", protect, getMyP2PBooks);
router.post("/books", protect, addP2PBook);
router.delete("/books/:id", protect, deleteP2PBook);

router.post("/requests", protect, requestBorrowP2P);
router.get("/requests/incoming", protect, getIncomingRequests);
router.get("/requests/outgoing", protect, getOutgoingRequests);
router.patch("/requests/:id/:action", protect, handleBorrowRequest);

export default router;

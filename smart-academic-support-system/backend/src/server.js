import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { connectDB } from "./config/db.js";
import { errorHandler, notFound } from "./middleware/errorHandler.js";
import authRoutes from "./routes/authRoutes.js";
import bookRoutes from "./routes/bookRoutes.js";
import issueRoutes from "./routes/issueRoutes.js";
import reservationRoutes from "./routes/reservationRoutes.js";
import recommendationRoutes from "./routes/recommendationRoutes.js";
import roadmapRoutes from "./routes/roadmapRoutes.js";
import notificationRoutes from "./routes/notificationRoutes.js";
import reportRoutes from "./routes/reportRoutes.js";
import aiRoutes from "./routes/aiRoutes.js";
import studyCircleRoutes from "./routes/studyCircleRoutes.js";
import p2pRoutes from "./routes/p2pRoutes.js";

dotenv.config();

const app = express();
const port = process.env.PORT || 5000;
const allowedOrigins = new Set([
  process.env.CLIENT_URL || "http://localhost:5173",
  "http://localhost:5173",
  "http://127.0.0.1:5173",
  "http://localhost:5174",
  "http://127.0.0.1:5174"
]);

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.has(origin)) return callback(null, true);
      return callback(new Error("Not allowed by CORS"));
    },
    credentials: true
  })
);
app.use(express.json());

app.get("/", (req, res) => {
  res.json({ name: "Smart Academic Support System API", status: "running" });
});

app.get("/api", (req, res) => {
  res.json({
    name: "Smart Academic Support System API",
    status: "running",
    routes: {
      auth: "/api/auth",
      books: "/api/books",
      issues: "/api/issues",
      reservations: "/api/reservations",
      recommendations: "/api/recommendations/books",
      roadmaps: "/api/roadmaps",
      notifications: "/api/notifications",
      reports: "/api/reports/admin",
      ai: "/api/ai/chat",
      aiStatus: "/api/ai/status"
    }
  });
});

app.use("/api/auth", authRoutes);
app.use("/api/books", bookRoutes);
app.use("/api/issues", issueRoutes);
app.use("/api/reservations", reservationRoutes);
app.use("/api/recommendations", recommendationRoutes);
app.use("/api/roadmaps", roadmapRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/reports", reportRoutes);
app.use("/api/ai", aiRoutes);
app.use("/api/study-circles", studyCircleRoutes);
app.use("/api/p2p", p2pRoutes);

app.use(notFound);
app.use(errorHandler);

connectDB()
  .then(() => {
    app.listen(port, () => console.log(`API listening on port ${port}`));
  })
  .catch((error) => {
    console.error(`Database connection failed: ${error.message}`);
    process.exit(1);
  });

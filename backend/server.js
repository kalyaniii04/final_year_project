import dotenv from "dotenv";
import express from "express";
import cors from "cors";
import mongoose from "mongoose";

import authRoutes from "./routes/auth.js";
import certificateRoutes from "./routes/certificateRoutes.js";
import verifyRoutes from "./routes/verify.js";

dotenv.config();

const app = express();
import authRoutes from "./routes/auth.js";

app.use("/auth", authRoutes);

/* ================= CORS (✅ FIXED) ================= */
app.use(
  cors({
    origin: [
      "http://localhost:3000",
      "https://final-year-project-khvy.vercel.app" // ✅ FRONTEND URL
    ],
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true
  })
);

/* ================= Middleware ================= */
app.use(express.json());

/* ================= MongoDB ================= */
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("✅ MongoDB connected"))
  .catch((err) => {
    console.error("❌ MongoDB connection failed:", err.message);
    process.exit(1);
  });

/* ================= API Routes ================= */
app.use("/auth", authRoutes);
app.use("/certificates", certificateRoutes);
app.use("/verify", verifyRoutes);

/* ================= Health Check ================= */
app.get("/", (req, res) => {
  res.send("🚀 Backend API is running");
});

/* ================= Server ================= */
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});

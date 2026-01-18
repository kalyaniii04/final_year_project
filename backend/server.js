import dotenv from "dotenv";
import express from "express";
import cors from "cors";
import mongoose from "mongoose";

import authRoutes from "./routes/auth.js";
import certificateRoutes from "./routes/certificateRoutes.js";
import verifyRoutes from "./routes/verify.js";

dotenv.config();

const app = express();

/* ================= Trust Proxy ================= */
app.set("trust proxy", 1);

/* ================= Middleware ================= */
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

/* ================= CORS ================= */
app.use(
  cors({
    origin: [
      "http://localhost:3000",
      "https://final-year-project-khvy.vercel.app",
    ],
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
  })
);

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
app.use("/verify", verifyRoutes);
app.use("/certificates", certificateRoutes);

/* ================= Health Check ================= */
app.get("/", (req, res) => {
  res.send("🚀 Backend API is running");
});

/* ================= Global Error Handler ================= */
app.use((err, req, res, next) => {
  console.error("🔥 Error:", err.stack);
  res.status(500).json({ message: "Internal Server Error" });
});

/* ================= Server ================= */
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});

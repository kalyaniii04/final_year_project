import dotenv from "dotenv";
import express from "express";
import cors from "cors";
import mongoose from "mongoose";

import authRoutes from "./routes/auth.js";
import certificateRoutes from "./routes/certificateRoutes.js";
import verifyRoutes from "./routes/verify.js";

dotenv.config();

const app = express();

/* ===================== CORS ===================== */
const allowedOrigins = [
  "http://localhost:3000",
  "https://final-year-project-0dox.onrender.com",
];

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true);
      if (allowedOrigins.includes(origin)) return callback(null, true);
      return callback(null, true);
    },
    credentials: true,
  })
);

app.use(express.json());

/* ===================== Mongo ===================== */
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("✅ MongoDB connected"))
  .catch((err) => {
    console.error("❌ MongoDB connection failed:", err.message);
    process.exit(1);
  });

/* ===================== Routes ===================== */
app.use("/auth", authRoutes);
app.use("/certificates", certificateRoutes);
app.use("/verify", verifyRoutes);

app.get("/", (req, res) => {
  res.send("✅ Certificate Verification Server Running");
});

/* ===================== Server ===================== */
const PORT = process.env.PORT || 5000;
app.listen(PORT, "0.0.0.0", () => {
  console.log(`🚀 Server running on port ${PORT}`);
});

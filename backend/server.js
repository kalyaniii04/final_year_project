import dotenv from "dotenv";
import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import path from "path";
import { fileURLToPath } from "url";

import authRoutes from "./routes/auth.js";
import certificateRoutes from "./routes/certificateRoutes.js";
import verifyRoutes from "./routes/verify.js";

dotenv.config();

const app = express();

/* ================= Path Fix ================= */
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/* ================= CORS ================= */
app.use(
  cors({
    origin: "*",
    methods: ["GET", "POST", "PUT", "DELETE"],
  })
);

app.use(express.json());

/* ================= Mongo ================= */
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

/* ================= Serve React ================= */
app.use(
  express.static(path.join(__dirname, "../frontend/build"))
);

/* ✅ DO NOT USE app.get("*") */
/* ✅ USE THIS INSTEAD */
app.get(/^\/(?!verify|auth|certificates).*/, (req, res) => {
  res.sendFile(
    path.join(__dirname, "../frontend/build/index.html")
  );
});

/* ================= Server ================= */
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});

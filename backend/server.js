import dotenv from "dotenv";
import express from "express";
import cors from "cors";
import mongoose from "mongoose";

import authRoutes from "./routes/auth.js";
import certificateRoutes from "./routes/certificateRoutes.js";
import verifyRoutes from "./routes/verify.js";

dotenv.config();

const app = express();

/* =====================================================
   ✅ CORS CONFIG (LOCALHOST + LAN IP)
   This FIXES your QR scan + phone access issue
===================================================== */

const allowedOrigins = [
  "http://localhost:3000",
  "http://192.168.1.9:3000", // ✅ your Wi-Fi IP
];

app.use(
  cors({
    origin: (origin, callback) => {
      // allow server-to-server & curl requests
      if (!origin) return callback(null, true);

      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      return callback(new Error("Not allowed by CORS"));
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// Handle preflight requests
// app.options("/*", cors());

/* =====================================================
   Middleware
===================================================== */
app.use(express.json());

/* =====================================================
   MongoDB Connection
===================================================== */
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("✅ MongoDB connected"))
  .catch((err) => {
    console.error("❌ MongoDB connection failed:", err.message);
    process.exit(1);
  });

/* =====================================================
   Routes
===================================================== */
app.use("/auth", authRoutes);
app.use("/certificates", certificateRoutes);
app.use("/verify", verifyRoutes);

/* =====================================================
   Health Check
===================================================== */
app.get("/", (req, res) => {
  res.status(200).send("✅ Certificate Verification Server Running");
});

/* =====================================================
   Server
===================================================== */
const PORT = 5000;
app.listen(PORT, "0.0.0.0", () => {
  console.log(`✅ Server running on http://localhost:${PORT}`);
  console.log(`✅ LAN access: http://192.168.1.9:${PORT}`);
});

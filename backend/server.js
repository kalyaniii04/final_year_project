require("dotenv").config();
const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");

const authRoutes = require("./routes/auth");
const certificateRoutes = require("./routes/certificateRoutes");

const app = express();

// ===============================
// ✅ CORS (THIS IS ENOUGH)
// ===============================
app.use(
  cors({
    origin: "http://localhost:3000",
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"]
  })
);

app.use(express.json());

// ===============================
// MongoDB
// ===============================
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("✅ MongoDB connected"))
  .catch((err) => {
    console.error("❌ MongoDB connection failed:", err.message);
    process.exit(1);
  });

// ===============================
// Routes
// ===============================
app.use("/auth", authRoutes);
app.use("/certificates", certificateRoutes);

// Health check
app.get("/", (req, res) => {
  res.send("MFA Auth Server Running");
});

// ===============================
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
});

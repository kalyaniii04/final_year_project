import bcrypt from "bcryptjs";
import crypto from "crypto";
import User from "../models/User.js";
import { sendOTP } from "../utils/sendOtp.js"; 
// ↑ adjust name if your OTP file name is different

// ================= SIGNUP =================
export const signup = async (req, res) => {
  try {
    const { email, password, confirmPassword } = req.body;

    // 1️⃣ double-check password
    if (password !== confirmPassword) {
      return res.status(400).json({ message: "Passwords do not match" });
    }

    // 2️⃣ check existing user
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "User already registered" });
    }

    // 3️⃣ hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // 4️⃣ save user
    await User.create({
      email,
      password: hashedPassword
    });

    // 5️⃣ (later) store email hash on blockchain
    // const emailHash = crypto.createHash("sha256").update(email).digest("hex");

    res.status(201).json({ message: "Signup successful" });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ================= LOGIN =================
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // 1️⃣ check email exists
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({
        message: "Email not registered. Please signup first."
      });
    }

    // 2️⃣ check password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid password" });
    }

    // 3️⃣ email matched → send OTP
    await sendOTP(email);

    res.json({ message: "OTP sent to registered email" });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

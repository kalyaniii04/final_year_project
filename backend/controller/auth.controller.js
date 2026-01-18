import bcrypt from "bcryptjs";
import crypto from "crypto";
import jwt from "jsonwebtoken";
import { ethers } from "ethers";

import User from "../models/User.js";
import { sendOTP } from "../utils/sendOtp.js";
import nonceStore from "../utils/nonceStore.js";
import otpStore from "../utils/otpStore.js";

/* =====================================================
   EMAIL + PASSWORD AUTH (ISSUER / USER)
===================================================== */

// ================= SIGNUP =================
export const signup = async (req, res) => {
  try {
    const { email, password, confirmPassword } = req.body;

    if (!email || !password || !confirmPassword) {
      return res.status(400).json({ message: "All fields required" });
    }

    if (password !== confirmPassword) {
      return res.status(400).json({ message: "Passwords do not match" });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "User already registered" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await User.create({
      email,
      password: hashedPassword,
      role: "ISSUER"
    });

    res.status(201).json({ message: "Signup successful" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ================= LOGIN (SEND OTP) =================
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Email & password required" });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({
        message: "Email not registered. Please signup first."
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid password" });
    }

    await sendOTP(email);

    res.json({ message: "OTP sent to registered email" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ================= VERIFY OTP =================
export const verifyOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({ message: "Email & OTP required" });
    }

    const storedOtp = otpStore.get(email);
    if (!storedOtp || storedOtp !== otp) {
      return res.status(401).json({ message: "Invalid or expired OTP" });
    }

    otpStore.delete(email);

    const user = await User.findOne({ email });

    const token = jwt.sign(
      {
        id: user._id,
        email: user.email,
        role: user.role
      },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    res.json({
      message: "Login successful",
      token
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/* =====================================================
   WALLET SIGNATURE AUTH (VERIFIER)
===================================================== */

// ================= GET NONCE =================
export const getWalletNonce = (req, res) => {
  try {
    const { walletAddress } = req.body;

    if (!walletAddress) {
      return res.status(400).json({ message: "Wallet address required" });
    }

    const nonce = `Verify login nonce: ${crypto
      .randomBytes(16)
      .toString("hex")}`;

    nonceStore.set(walletAddress.toLowerCase(), nonce);

    res.json({ nonce });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ================= VERIFY SIGNATURE =================
export const verifyWalletSignature = async (req, res) => {
  try {
    const { walletAddress, signature } = req.body;

    if (!walletAddress || !signature) {
      return res.status(400).json({ message: "Missing data" });
    }

    const nonce = nonceStore.get(walletAddress.toLowerCase());
    if (!nonce) {
      return res.status(400).json({ message: "Nonce expired or not found" });
    }

    const recoveredAddress = ethers.verifyMessage(nonce, signature);

    if (recoveredAddress.toLowerCase() !== walletAddress.toLowerCase()) {
      return res.status(401).json({ message: "Invalid signature" });
    }

    nonceStore.delete(walletAddress.toLowerCase());

    const token = jwt.sign(
      {
        wallet: walletAddress,
        role: "VERIFIER"
      },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    res.json({
      message: "Wallet verified successfully",
      token
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

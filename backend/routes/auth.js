import express from "express";
import { ethers } from "ethers";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import SibApiV3Sdk from "sib-api-v3-sdk";

import User from "../models/User.js";
import nonceStore from "../utils/nonceStore.js";
import otpStore from "../utils/otpStore.js";

const router = express.Router();

/* =====================================================
   BREVO API CONFIG
===================================================== */
const client = SibApiV3Sdk.ApiClient.instance;
client.authentications["api-key"].apiKey = process.env.BREVO_API_KEY;
const emailApi = new SibApiV3Sdk.TransactionalEmailsApi();

/* =====================================================
   0️⃣ SIGNUP (EMAIL + PASSWORD) — ISSUER
===================================================== */
router.post("/signup", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: "Email and password required" });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: "Email already registered" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await User.create({ email, password: hashedPassword });

    res.status(201).json({ message: "Signup successful. Please login." });
  } catch (err) {
    console.error("SIGNUP ERROR:", err);
    res.status(500).json({ error: "Signup failed" });
  }
});

/* =====================================================
   1️⃣ LOGIN WITH EMAIL + PASSWORD — ISSUER
===================================================== */
router.post("/login-password", async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ error: "Email not registered" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ error: "Invalid password" });
    }

    res.json({
      message: "Password verified",
      next: "WALLET_REQUIRED",
      email,
    });
  } catch (err) {
    console.error("PASSWORD LOGIN ERROR:", err);
    res.status(500).json({ error: "Login failed" });
  }
});

/* =====================================================
   2️⃣ REQUEST NONCE — ISSUER & VERIFIER
===================================================== */
router.post("/request-nonce", (req, res) => {
  try {
    const { walletAddress } = req.body;

    if (!walletAddress || !ethers.isAddress(walletAddress)) {
      return res.status(400).json({ error: "Invalid wallet address" });
    }

    const nonce = `Login nonce: ${Math.floor(
      100000 + Math.random() * 900000
    )}`;

    nonceStore[walletAddress.toLowerCase()] = {
      nonce,
      expiresAt: Date.now() + 5 * 60 * 1000,
    };

    res.json({ nonce });
  } catch (err) {
    console.error("REQUEST NONCE ERROR:", err);
    res.status(500).json({ error: "Failed to generate nonce" });
  }
});

/* =====================================================
   3️⃣ VERIFY WALLET — ISSUER (CONTINUES MFA)
===================================================== */
router.post("/login", async (req, res) => {
  try {
    const { walletAddress, signature } = req.body;

    const record = nonceStore[walletAddress?.toLowerCase()];
    if (!record) {
      return res.status(401).json({ error: "Nonce not found" });
    }

    if (Date.now() > record.expiresAt) {
      delete nonceStore[walletAddress.toLowerCase()];
      return res.status(401).json({ error: "Nonce expired" });
    }

    const recovered = ethers.verifyMessage(record.nonce, signature);
    if (recovered.toLowerCase() !== walletAddress.toLowerCase()) {
      return res.status(401).json({ error: "Invalid wallet signature" });
    }

    delete nonceStore[walletAddress.toLowerCase()];

    res.json({
      message: "Wallet verified",
      next: "OTP_REQUIRED",
    });
  } catch (err) {
    console.error("WALLET LOGIN ERROR:", err);
    res.status(500).json({ error: "Wallet verification failed" });
  }
});

/* =====================================================
   4️⃣ SEND OTP — ISSUER ONLY
===================================================== */
router.post("/send-otp", async (req, res) => {
  try {
    const { walletAddress, email } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(403).json({ error: "Email not registered" });
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    otpStore[walletAddress.toLowerCase()] = {
      hash: await bcrypt.hash(otp, 10),
      expiresAt: Date.now() + 5 * 60 * 1000,
      email,
    };

    await emailApi.sendTransacEmail({
      sender: { email: "kalyanibj1@gmail.com", name: "Cert Issuer MFA" },
      to: [{ email }],
      subject: "Issuer MFA OTP",
      textContent: `Your OTP is ${otp}. Valid for 5 minutes.`,
    });

    res.json({ message: "OTP sent successfully" });
  } catch (err) {
    console.error("SEND OTP ERROR:", err);
    res.status(500).json({ error: "Failed to send OTP" });
  }
});

/* =====================================================
   5️⃣ VERIFY OTP + JWT — ISSUER
===================================================== */
router.post("/verify-otp", async (req, res) => {
  try {
    const { walletAddress, otp } = req.body;

    const record = otpStore[walletAddress?.toLowerCase()];
    if (!record) {
      return res.status(401).json({ error: "OTP not found" });
    }

    if (Date.now() > record.expiresAt) {
      delete otpStore[walletAddress.toLowerCase()];
      return res.status(401).json({ error: "OTP expired" });
    }

    const isValid = await bcrypt.compare(otp, record.hash);
    if (!isValid) {
      return res.status(401).json({ error: "Invalid OTP" });
    }

    delete otpStore[walletAddress.toLowerCase()];

    const token = jwt.sign(
      {
        wallet: walletAddress,
        email: record.email,
        role: "ISSUER",
        mfa: true,
      },
      process.env.JWT_SECRET,
      { expiresIn: "15m" }
    );

    res.json({ message: "Issuer authenticated", token });
  } catch (err) {
    console.error("VERIFY OTP ERROR:", err);
    res.status(500).json({ error: "OTP verification failed" });
  }
});

/* =====================================================
   ⭐ 6️⃣ VERIFIER LOGIN (SIMPLE WALLET AUTH)
===================================================== */
router.post("/verifier-login", async (req, res) => {
  try {
    const { walletAddress, signature } = req.body;

    const record = nonceStore[walletAddress?.toLowerCase()];
    if (!record) {
      return res.status(401).json({ error: "Nonce not found" });
    }

    if (Date.now() > record.expiresAt) {
      delete nonceStore[walletAddress.toLowerCase()];
      return res.status(401).json({ error: "Nonce expired" });
    }

    const recovered = ethers.verifyMessage(record.nonce, signature);
    if (recovered.toLowerCase() !== walletAddress.toLowerCase()) {
      return res.status(401).json({ error: "Invalid signature" });
    }

    delete nonceStore[walletAddress.toLowerCase()];

    const token = jwt.sign(
      {
        wallet: walletAddress,
        role: "VERIFIER",
      },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    res.json({
      message: "Verifier authenticated",
      token,
    });
  } catch (err) {
    console.error("VERIFIER LOGIN ERROR:", err);
    res.status(500).json({ error: "Verifier login failed" });
  }
});

export default router;

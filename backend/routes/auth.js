const express = require("express");
const { ethers } = require("ethers");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const nodemailer = require("nodemailer");
const nonceStore = require("../utils/nonceStore");

const otpStore = require("../utils/otpStore");

const router = express.Router();

/* ================================
   EMAIL CONFIG
================================ */
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS, // Must be Gmail App Password
  },
});

router.post("/request-nonce", (req, res) => {
  const { walletAddress } = req.body;

  if (!walletAddress || !ethers.isAddress(walletAddress)) {
    return res.status(400).json({ error: "Invalid wallet address" });
  }

  const nonce = Math.floor(100000 + Math.random() * 900000).toString();

  nonceStore[walletAddress] = {
    nonce,
    expiresAt: Date.now() + 5 * 60 * 1000, // 5 minutes
  };

  res.json({
    message: "Nonce generated",
    nonce,
  });
});


/* ================================
   1️⃣ WALLET LOGIN (Stage 2)
================================ */
router.post("/login", async (req, res) => {
  try {
    const { walletAddress, signature } = req.body;

    if (!walletAddress || !signature) {
      return res.status(400).json({ error: "Missing walletAddress or signature" });
    }

    const record = nonceStore[walletAddress];

    if (!record) {
      return res.status(401).json({ error: "Nonce not found" });
    }

    if (Date.now() > record.expiresAt) {
      delete nonceStore[walletAddress];
      return res.status(401).json({ error: "Nonce expired" });
    }

    const message = `Login nonce: ${record.nonce}`;
    const recovered = ethers.verifyMessage(message, signature);

    if (recovered.toLowerCase() !== walletAddress.toLowerCase()) {
      return res.status(401).json({ error: "Invalid wallet signature" });
    }

    // 🔥 IMPORTANT: invalidate nonce
    delete nonceStore[walletAddress];

    res.json({
      message: "Wallet verified",
      next: "OTP_REQUIRED",
    });
  } catch (err) {
    console.error("WALLET LOGIN ERROR:", err);
    res.status(500).json({ error: "Wallet verification failed" });
  }
});


/* ================================
   2️⃣ SEND OTP
================================ */
router.post("/send-otp", async (req, res) => {
  try {
    const { walletAddress, email } = req.body;

    if (!walletAddress || !email) {
      return res.status(400).json({ error: "Missing walletAddress or email" });
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    // Store OTP securely
    otpStore[walletAddress] = {
      hash: await bcrypt.hash(otp, 10),
      expiresAt: Date.now() + 5 * 60 * 1000,
      email,
    };

    // Send OTP email
    await transporter.sendMail({
      from: `"Cert Issuer MFA" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: "Issuer MFA OTP",
      text: `Your OTP is ${otp}. It is valid for 5 minutes.`,
    });

    console.log(`OTP sent to ${email}: ${otp}`);
    res.json({ message: "OTP sent successfully" });
  } catch (err) {
    console.error("SEND OTP ERROR:", err); // ✅ detailed error
    res.status(500).json({ error: err.message || "Failed to send OTP" });
  }
});


/* ================================
   3️⃣ VERIFY OTP + ISSUE JWT
================================ */
router.post("/verify-otp", async (req, res) => {
  try {
    const { walletAddress, otp } = req.body;

    if (!walletAddress || !otp) {
      return res.status(400).json({ error: "Missing walletAddress or OTP" });
    }

    const record = otpStore[walletAddress];

    if (!record) {
      return res.status(401).json({ error: "OTP not found" });
    }

    if (Date.now() > record.expiresAt) {
      delete otpStore[walletAddress];
      return res.status(401).json({ error: "OTP expired" });
    }

    const isValid = await bcrypt.compare(otp, record.hash);

    if (!isValid) {
      return res.status(401).json({ error: "Invalid OTP" });
    }

    // OTP success → remove from store
    delete otpStore[walletAddress];

    // Issue JWT token for MFA session
    const token = jwt.sign(
      {
        wallet: walletAddress,
        role: "ISSUER",
        mfa: true,
      },
      process.env.JWT_SECRET,
      { expiresIn: "15m" }
    );

    res.json({
      message: "MFA verified",
      token,
    });
  } catch (err) {
    console.error("VERIFY OTP ERROR:", err);
    res.status(500).json({ error: "OTP verification failed" });
  }
});

module.exports = router;

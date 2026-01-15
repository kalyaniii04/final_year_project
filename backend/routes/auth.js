import express from "express";
import { ethers } from "ethers";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import SibApiV3Sdk from "sib-api-v3-sdk";

import nonceStore from "../utils/nonceStore.js";
import otpStore from "../utils/otpStore.js";

const router = express.Router();

/* =====================================================
   BREVO API CONFIG (NO SMTP)
===================================================== */
const client = SibApiV3Sdk.ApiClient.instance;
client.authentications["api-key"].apiKey = process.env.BREVO_API_KEY;

const emailApi = new SibApiV3Sdk.TransactionalEmailsApi();

/* =====================================================
   1️⃣ REQUEST NONCE (Wallet Login – Step 1)
===================================================== */
router.post("/request-nonce", (req, res) => {
  try {
    const { walletAddress } = req.body;

    if (!walletAddress || !ethers.isAddress(walletAddress)) {
      return res.status(400).json({ error: "Invalid wallet address" });
    }

    const nonce = Math.floor(100000 + Math.random() * 900000).toString();

    nonceStore[walletAddress] = {
      nonce,
      expiresAt: Date.now() + 5 * 60 * 1000,
    };

    res.json({
      message: "Nonce generated",
      nonce,
    });
  } catch (err) {
    console.error("REQUEST NONCE ERROR:", err);
    res.status(500).json({ error: "Failed to generate nonce" });
  }
});

/* =====================================================
   2️⃣ VERIFY WALLET SIGNATURE
===================================================== */
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

/* =====================================================
   3️⃣ SEND OTP (BREVO API)
===================================================== */
router.post("/send-otp", async (req, res) => {
  try {
    const { walletAddress, email } = req.body;

    if (!walletAddress || !email) {
      return res.status(400).json({ error: "Missing walletAddress or email" });
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    otpStore[walletAddress] = {
      hash: await bcrypt.hash(otp, 10),
      expiresAt: Date.now() + 5 * 60 * 1000,
      email,
    };

    await emailApi.sendTransacEmail({
      sender: {
        email: "no-reply@cert-project.com",
        name: "Cert Issuer MFA",
      },
      to: [{ email }],
      subject: "Issuer MFA OTP",
      textContent: `Your OTP is ${otp}. It is valid for 5 minutes.`,
    });

    res.json({ message: "OTP sent successfully" });
  } catch (err) {
    console.error("SEND OTP ERROR:", err);
    res.status(500).json({ error: "Failed to send OTP" });
  }
});

/* =====================================================
   4️⃣ VERIFY OTP + ISSUE JWT
===================================================== */
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

    delete otpStore[walletAddress];

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

export default router;

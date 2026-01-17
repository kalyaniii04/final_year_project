import express from "express";
import { ethers } from "ethers";
import fs from "fs";
import jwt from "jsonwebtoken";
import { CONTRACT_ADDRESS } from "../config/contract.js";

const router = express.Router();

/* =====================================================
   🔐 VERIFIER AUTH MIDDLEWARE
===================================================== */
const verifyVerifier = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).json({
      verified: false,
      message: "Authorization token missing"
    });
  }

  try {
    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    if (decoded.role !== "VERIFIER") {
      return res.status(403).json({
        verified: false,
        message: "Access denied: verifier only"
      });
    }

    req.verifierWallet = decoded.wallet;
    next();
  } catch (err) {
    return res.status(401).json({
      verified: false,
      message: "Invalid or expired token"
    });
  }
};

/* ================= ABI ================= */
const abiJson = JSON.parse(
  fs.readFileSync(
    new URL("../abi/CertificateRegistry.abi.json", import.meta.url),
    "utf-8"
  )
);
const abi = abiJson.abi;

/* ================= Provider ================= */
const provider = new ethers.JsonRpcProvider(
  "https://sepolia.infura.io/v3/30650fddcd9c4ae5845345d25dd4967e"
);

/* ================= Contract ================= */
const contract = new ethers.Contract(CONTRACT_ADDRESS, abi, provider);

/* =====================================================
   🔍 VERIFY CERTIFICATE (VERIFIER ONLY)
===================================================== */
router.get("/:certificateId", verifyVerifier, async (req, res) => {
  try {
    const certificateId = req.params.certificateId?.trim();

    if (!certificateId) {
      return res.status(400).json({
        verified: false,
        message: "Certificate ID required"
      });
    }

    const certIdBytes = ethers.id(certificateId);

    let cert;
    try {
      cert = await contract.getCertificate(certIdBytes);
    } catch {
      return res.status(404).json({
        verified: false,
        status: "NOT_FOUND",
        message: "Certificate not found on blockchain"
      });
    }

    return res.json({
      verified: true,
      status: cert.revoked ? "REVOKED" : "VALID",
      revoked: cert.revoked,
      issuedAt: Number(cert.issuedAt),

      // Certificate details
      studentName: cert.studentName,
      courseName: cert.courseName,
      instituteName: cert.instituteName,
      instituteId: cert.instituteId,

      // Audit info (optional, good for exams)
      verifiedBy: req.verifierWallet
    });

  } catch (err) {
    console.error("❌ Verify error:", err);
    return res.status(500).json({
      verified: false,
      status: "ERROR",
      message: "Internal server error"
    });
  }
});

export default router;

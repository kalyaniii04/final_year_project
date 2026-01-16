import express from "express";
import { ethers } from "ethers";
import fs from "fs";
import { CONTRACT_ADDRESS } from "../config/contract.js";

const router = express.Router();

/* ================= ABI ================= */
const abiJson = JSON.parse(
  fs.readFileSync(new URL("../abi/CertificateRegistry.abi.json", import.meta.url), "utf-8")
);
const abi = abiJson.abi;

/* ================= Provider ================= */
const provider = new ethers.JsonRpcProvider(
  "https://sepolia.infura.io/v3/30650fddcd9c4ae5845345d25dd4967e"
);

/* ================= Contract ================= */
const contract = new ethers.Contract(CONTRACT_ADDRESS, abi, provider);

/* =====================================================
   GET Certificate Details by ID (QR / URL)
===================================================== */
router.get("/:certificateId", async (req, res) => {
  try {
    const certificateId = req.params.certificateId.trim();
    console.log("🔹 GET request received for certificateId:", certificateId);

    const certIdBytes = ethers.id(certificateId);
    console.log("🔹 Computed bytes32 (ethers.id):", certIdBytes);

    const cert = await contract.getCertificate(certIdBytes);
    console.log("🔹 Certificate fetched from blockchain:", cert);

    const status = cert.revoked ? "REVOKED" : "VALID";

    return res.json({
      verified: true,
      status,
      revoked: cert.revoked,
      revokedAt: cert.revokedAt ? Number(cert.revokedAt) : null,
      certificateId,
      studentName: cert.studentName,
      courseName: cert.courseName,
      studentWallet: cert.student,
      issuerWallet: cert.issuer,
      instituteName: cert.instituteName,
      instituteId: cert.instituteId,
      issuedAt: Number(cert.issuedAt),
      ipfsLink: cert.ipfsHash
        ? cert.ipfsHash.replace("ipfs://", "https://ipfs.io/ipfs/")
        : null,
    });
  } catch (err) {
    console.error("❌ GET verification error:", err);

    return res.status(404).json({
      verified: false,
      status: "NOT_FOUND",
      message: "Certificate not issued on blockchain",
      error: err.message,
    });
  }
});

/* =====================================================
   POST Manual SHA-256 Hash Verification
===================================================== */
router.post("/", async (req, res) => {
  try {
    const { certificateId, fileHash } = req.body;
    console.log("🔹 POST request received:", { certificateId, fileHash });

    if (!certificateId || !fileHash) {
      console.warn("⚠️ Missing certificateId or fileHash");
      return res.status(400).json({
        verified: false,
        message: "Certificate ID and hash are required",
      });
    }

    const certIdBytes = ethers.id(certificateId.trim());
    console.log("🔹 Computed bytes32 from certificateId:", certIdBytes);

    const cert = await contract.getCertificate(certIdBytes);
    console.log("🔹 Certificate fetched from blockchain:", cert);

    // Certificate not issued
    if (cert.issuedAt === 0n) {
      console.warn("⚠️ Certificate not issued on blockchain");
      return res.status(404).json({
        verified: false,
        status: "NOT_FOUND",
        message: "Certificate not issued on blockchain",
      });
    }

    // Compare hashes
    const onChainHash = cert.fileHash.toLowerCase();
    const enteredHash = "0x" + fileHash.toLowerCase().replace(/^0x/, "");

    console.log("🔹 On-chain hash:", onChainHash);
    console.log("🔹 Entered hash:", enteredHash);

    if (onChainHash !== enteredHash) {
      console.warn("⚠️ Hash mismatch!");
      return res.json({
        verified: false,
        status: "HASH_MISMATCH",
        message: "Certificate hash does not match",
      });
    }

    // Certificate valid
    console.log("✅ Certificate is valid and matches on-chain hash!");
    return res.json({
      verified: true,
      status: cert.revoked ? "REVOKED" : "VALID",
      revoked: cert.revoked,
      revokedAt: cert.revokedAt ? Number(cert.revokedAt) : null,
      issuedAt: Number(cert.issuedAt),
      ipfsLink: cert.ipfsHash
        ? cert.ipfsHash.replace("ipfs://", "https://ipfs.io/ipfs/")
        : null,
    });
  } catch (err) {
    console.error("❌ POST verification error:", err);
    return res.status(500).json({
      verified: false,
      status: "ERROR",
      message: err.message,
      stack: err.stack,
    });
  }
});

export default router;

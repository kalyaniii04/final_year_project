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
   GET Certificate Details by ID (Original Route)
===================================================== */
router.get("/:certificateId", async (req, res) => {
  try {
    const certificateId = req.params.certificateId.trim();
    const certIdBytes = ethers.id(certificateId);

    const cert = await contract.getCertificate(certIdBytes);

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
    return res.status(404).json({
      verified: false,
      status: "NOT_FOUND",
      message: "Certificate not issued on blockchain",
    });
  }
});

/* =====================================================
   POST Manual SHA-256 Hash Verification
===================================================== */
router.post("/", async (req, res) => {
  try {
    const { certificateId, fileHash } = req.body;

    if (!certificateId || !fileHash) {
      return res.status(400).json({
        verified: false,
        message: "Certificate ID and hash are required",
      });
    }

    const certIdBytes = ethers.id(certificateId.trim());
    const cert = await contract.getCertificate(certIdBytes);

    // Certificate not issued
    if (cert.issuedAt === 0n) {
      return res.status(404).json({
        verified: false,
        status: "NOT_FOUND",
        message: "Certificate not issued on blockchain",
      });
    }

    // Compare hashes
    const onChainHash = cert.fileHash.toLowerCase();
    const enteredHash = "0x" + fileHash.toLowerCase().replace(/^0x/, "");

    if (onChainHash !== enteredHash) {
      return res.json({
        verified: false,
        status: "HASH_MISMATCH",
        message: "Certificate hash does not match",
      });
    }

    // Certificate valid
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
    console.error(err);
    return res.status(500).json({
      verified: false,
      status: "ERROR",
      message: err.message,
    });
  }
});

export default router;

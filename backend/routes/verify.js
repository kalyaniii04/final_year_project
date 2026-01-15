import express from "express";
import { ethers } from "ethers";
import fs from "fs";
import { CONTRACT_ADDRESS } from "../config/contract.js";

const router = express.Router();

/* =====================================================
   Load ABI JSON
===================================================== */
const abiJson = JSON.parse(
  fs.readFileSync(
    new URL("../abi/CertificateRegistry.abi.json", import.meta.url),
    "utf-8"
  )
);
const abi = abiJson.abi;

/* =====================================================
   Ethereum Provider (Sepolia)
===================================================== */
const provider = new ethers.JsonRpcProvider(
  "https://sepolia.infura.io/v3/30650fddcd9c4ae5845345d25dd4967e"
);

/* =====================================================
   Contract Instance (READ-ONLY)
===================================================== */
const contract = new ethers.Contract(CONTRACT_ADDRESS, abi, provider);

/* =====================================================
   GET /verify/:certificateId
===================================================== */
router.get("/:certificateId", async (req, res) => {
  try {
    const certificateId = req.params.certificateId;

    // 🔑 MUST MATCH issueCertificate()
    // You used ethers.id(certificateId) while issuing
    const certIdBytes = ethers.id(certificateId);

    // Call smart contract
    const cert = await contract.getCertificate(certIdBytes);

    // Success response
    res.json({
      verified: true,
      certificateId,
      studentName: cert.studentName,
      course: cert.courseName,
      issuedTo: cert.student,
      instituteName: cert.instituteName,
      instituteId: cert.instituteId,
      ipfsLink: cert.ipfsHash
        ? `https://ipfs.io/ipfs/${cert.ipfsHash.replace("ipfs://", "")}`
        : null,
      issuedAt: Number(cert.issuedAt),
      revoked: cert.revoked,
    });
  } catch (err) {
    console.error("❌ Verification error:", err.message);

    // Any revert = certificate not found
    res.status(404).json({
      verified: false,
      message: "Certificate not found or invalid certificate ID",
    });
  }
});

export default router;

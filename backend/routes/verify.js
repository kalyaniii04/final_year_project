import express from "express";
import { ethers } from "ethers";
import fs from "fs";
import { CONTRACT_ADDRESS } from "../config/contract.js";

const router = express.Router();

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
   VERIFY CERTIFICATE (STATUS ONLY)
===================================================== */
router.get("/:certificateId", async (req, res) => {
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

      // Student + Institute info
      studentName: cert.studentName,
      courseName: cert.courseName,
      instituteName: cert.instituteName,
      instituteId: cert.instituteId
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

// console.log("Cert ID:", certificateId);
// console.log("Bytes32:", certIdBytes);


export default router;

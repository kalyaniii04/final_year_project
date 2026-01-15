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
   VERIFY CERTIFICATE DETAILS
===================================================== */
router.get("/:certificateId", async (req, res) => {
  try {
    const certificateId = req.params.certificateId.trim();
    const certIdBytes = ethers.id(certificateId);

    const cert = await contract.getCertificate(certIdBytes);

    const status = cert.revoked ? "REVOKED" : "VALID";

    return res.json({
      verified: true,
      status,                 // ✅ VALID / REVOKED
      revoked: cert.revoked,  // ✅ true / false
      revokedAt: cert.revokedAt
        ? Number(cert.revokedAt)
        : null,

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

export default router;

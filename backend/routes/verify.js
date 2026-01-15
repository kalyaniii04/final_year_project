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
   Reliable Ethereum Providers (Fallback)
   Replace YOUR_ALCHEMY_KEY / YOUR_INFURA_KEY with real keys
===================================================== */
const providers = [
  new ethers.JsonRpcProvider("https://sepolia.infura.io/v3/30650fddcd9c4ae5845345d25dd4967e"),
  // new ethers.JsonRpcProvider("https://sepolia.infura.io/v3/YOUR_INFURA_KEY"),
];
const provider = new ethers.FallbackProvider(providers);

/* =====================================================
   Contract Instance
===================================================== */
const contract = new ethers.Contract(CONTRACT_ADDRESS, abi, provider);

/* =====================================================
   GET /verify/:certificateId
===================================================== */
router.get("/:certificateId", async (req, res) => {
  const { certificateId } = req.params;

  try {
    // Convert certificateId string to bytes32 hash
    const certIdBytes = ethers.id(certificateId);

    // Fetch certificate from contract
    const cert = await contract.getCertificate(certIdBytes);

    // Check if certificate exists
    if (!cert || cert.fileHash === "0x") {
      return res.status(404).json({
        verified: false,
        message: "Certificate not found",
      });
    }

    // Respond with certificate details
    res.json({
      verified: true,
      certificateId,
      studentName: cert.studentName,
      course: cert.course,
      issuedTo: cert.student,
      ipfsLink: cert.ipfsHash ? `https://ipfs.io/ipfs/${cert.ipfsHash}` : null,
    });
  } catch (err) {
    console.error("❌ Verification error:", err);
    res.status(500).json({
      verified: false,
      message: "RPC or contract error: " + err.message,
    });
  }
});

export default router;

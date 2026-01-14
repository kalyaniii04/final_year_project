import express from "express";
import { ethers } from "ethers";
import fs from "fs";

const router = express.Router();

/* =====================================================
   Load ABI JSON (ABI-ONLY FILE)
===================================================== */
const abiJson = JSON.parse(
  fs.readFileSync(
    new URL("../abi/CertificateRegistry.abi.json", import.meta.url),
    "utf-8"
  )
);

const abi = abiJson.abi;

/* =====================================================
   Contract address (DO NOT JSON.parse JS FILES)
===================================================== */
import { CONTRACT_ADDRESS } from "../config/contract.js";

/* =====================================================
   Ethereum Provider + Contract
===================================================== */
const provider = new ethers.JsonRpcProvider(process.env.RPC_URL);

const contract = new ethers.Contract(
  CONTRACT_ADDRESS,
  abi,
  provider
);

/* =====================================================
   GET /verify/:certificateId
===================================================== */
router.get("/:certificateId", async (req, res) => {
  const { certificateId } = req.params;

  try {
    const certIdBytes = ethers.id(certificateId);
    const cert = await contract.getCertificate(certIdBytes);

    if (!cert || cert.fileHash === "0x") {
      return res.status(404).json({
        verified: false,
        message: "Certificate not found",
      });
    }

    res.json({
      verified: true,
      certificateId,
      studentName: cert.studentName,
      course: cert.course,
      issuedTo: cert.student,
      ipfsLink: cert.ipfsHash,
    });
  } catch (err) {
    res.status(500).json({
      verified: false,
      message: err.message,
    });
  }
});

export default router;

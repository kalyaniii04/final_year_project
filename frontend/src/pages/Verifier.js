import React, { useState } from "react";
import { ethers } from "ethers";
import {
  Card,
  CardContent,
  TextField,
  Button,
  Typography,
  Divider,
  Box,
} from "@mui/material";
import { connectWallet } from "../utils/connectWallet";
import "./Verifier.css";

/**
 * VerifyCertificate Component
 * ----------------------------
 * Verifies blockchain-issued certificates using
 * Certificate ID + PDF SHA-256 hash
 */
export default function VerifyCertificate() {
  const [certId, setCertId] = useState("");
  const [fileHash, setFileHash] = useState("");
  const [status, setStatus] = useState("");
  const [certDetails, setCertDetails] = useState(null);

  // Normalize SHA-256 hash
  const normalizeHash = (hash) => {
    if (!hash) return "";
    let clean = hash.trim().toLowerCase();
    if (clean.startsWith("0x")) clean = clean.slice(2);
    return "0x" + clean;
  };

  const handleVerify = async () => {
    if (!certId || !fileHash) {
      alert("Please fill both fields before verifying!");
      return;
    }

    try {
      setStatus("⏳ Verifying certificate on blockchain...");
      setCertDetails(null);

      const { contract } = await connectWallet();

      const certIdBytes = ethers.id(certId.trim());
      const fileHashBytes = normalizeHash(fileHash);

      const cert = await contract.getCertificate(certIdBytes);

      if (cert.issuer === ethers.ZeroAddress) {
        setStatus("❌ Certificate does NOT exist on blockchain");
        return;
      }

      const isValid = await contract.verifyCertificate(
        certIdBytes,
        fileHashBytes
      );

      if (!isValid) {
        setStatus("❌ Certificate is INVALID or REVOKED!");
        return;
      }

      setStatus("✅ Certificate is VALID and not revoked!");
      setCertDetails({
        studentName: cert.studentName,
        courseName: cert.courseName,
        instituteName: cert.instituteName,
        instituteId: cert.instituteId,
        student: cert.student,
        issuer: cert.issuer,
        issuedAt: new Date(Number(cert.issuedAt) * 1000).toLocaleString(),
        revoked: cert.revoked,
        revokedAt:
          cert.revokedAt > 0
            ? new Date(Number(cert.revokedAt) * 1000).toLocaleString()
            : "Not revoked",
        fileHash: cert.fileHash,
      });
    } catch (error) {
      console.error("Verification error:", error);
      setStatus("❌ " + (error.reason || error.message));
      setCertDetails(null);
    }
  };

  return (
    <div className="verify-page">
      <div className="verify-wrapper">
        <Typography className="verify-title">
          🔍 Verify Certificate
        </Typography>

        <Card className="glass-card">
          <CardContent>
            <Typography className="verify-subtitle">
              Enter the Certificate ID and SHA-256 hash to verify authenticity.
            </Typography>

            <TextField
              fullWidth
              label="Certificate ID"
              value={certId}
              onChange={(e) => setCertId(e.target.value)}
              sx={{ mb: 2 }}
            />

            <TextField
              fullWidth
              label="File Hash (SHA-256)"
              value={fileHash}
              onChange={(e) => setFileHash(e.target.value)}
              sx={{ mb: 3 }}
            />

            <Button
              fullWidth
              variant="contained"
              className="verify-btn"
              onClick={handleVerify}
              disabled={!certId || !fileHash}
            >
              Verify Certificate
            </Button>

            {status && (
              <Typography
                className="status-text"
                sx={{ mt: 3 }}
                color={status.includes("✅") ? "success.main" : "error.main"}
              >
                {status}
              </Typography>
            )}

            {certDetails && (
              <>
                <Divider sx={{ my: 3 }} />

                {/* LEFT-ALIGNED CERTIFICATE DETAILS */}
                <Box sx={{ textAlign: "left" }}>
                  <Typography variant="h6" sx={{ mb: 1 }}>
                    📄 Certificate Details
                  </Typography>

                  <Typography sx={{ color: "white" }}>
                    <strong>Student Name:</strong> {certDetails.studentName}
                  </Typography>
                  <Typography sx={{ color: "white" }}>
                    <strong>Course:</strong> {certDetails.courseName}
                  </Typography>
                  <Typography sx={{ color: "white" }}>
                    <strong>Institute:</strong> {certDetails.instituteName}
                  </Typography>
                  <Typography sx={{ color: "white" }}>
                    <strong>Institute ID:</strong> {certDetails.instituteId}
                  </Typography>
                  <Typography sx={{ color: "white" }}>
                    <strong>Student Address:</strong> {certDetails.student}
                  </Typography>
                  <Typography sx={{ color: "white" }}>
                    <strong>Issuer Address:</strong> {certDetails.issuer}
                  </Typography>
                  <Typography sx={{ color: "white" }}>
                    <strong>Issued At:</strong> {certDetails.issuedAt}
                  </Typography>
                  <Typography sx={{ color: "white" }}>
                    <strong>Revoked:</strong>{" "}
                    {certDetails.revoked ? "Yes" : "No"}
                  </Typography>
                  <Typography sx={{ color: "white" }}>
                    <strong>Revoked At:</strong> {certDetails.revokedAt}
                  </Typography>
                  <Typography sx={{ color: "white", wordBreak: "break-all" }}>
                    <strong>File Hash:</strong> {certDetails.fileHash}
                  </Typography>
                </Box>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

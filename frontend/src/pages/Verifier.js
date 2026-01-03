import React, { useState } from "react";
import { ethers } from "ethers";
import {
  Card,
  CardContent,
  TextField,
  Button,
  Typography,
  Divider,
} from "@mui/material";
import { connectWallet } from "../utils/connectWallet"; // adjust if path differs

/**
 * VerifyCertificate Component
 * ----------------------------
 * Allows users to verify certificates stored on the blockchain
 * by entering a Certificate ID and file hash.
 */
export default function VerifyCertificate() {
  // -------------------- State --------------------
  const [certId, setCertId] = useState("");
  const [fileHash, setFileHash] = useState("");
  const [status, setStatus] = useState("");
  const [certDetails, setCertDetails] = useState(null);

  // -------------------- Handlers --------------------
  const handleVerify = async () => {
    if (!certId || !fileHash) {
      alert("Please fill both fields before verifying!");
      return;
    }

    try {
      setStatus("⏳ Verifying certificate on blockchain...");
      setCertDetails(null);

      const { contract } = await connectWallet();

      const certIdBytes = ethers.id(certId);
      const fileHashBytes = "0x" + fileHash;

      // Fetch on-chain certificate data
      const cert = await contract.getCertificate(certIdBytes);

      // Verify validity
      const isValid = await contract.verifyCertificate(
        certIdBytes,
        fileHashBytes
      );

      if (isValid) {
        setStatus("✅ Certificate is VALID and not revoked!");
        setCertDetails({
          fileHash: cert.fileHash,
          student: cert.student,
          issuer: cert.issuer,
          issuedAt: new Date(Number(cert.issuedAt) * 1000).toLocaleString(),
          revoked: cert.revoked,
          revokedAt:
            cert.revokedAt > 0
              ? new Date(Number(cert.revokedAt) * 1000).toLocaleString()
              : "Not revoked",
          instituteName: cert.instituteName,
          instituteId: cert.instituteId,
          studentName: cert.studentName,
          courseName: cert.courseName,
        });
      } else {
        setStatus("❌ Certificate is INVALID or REVOKED!");
        setCertDetails(null);
      }
    } catch (error) {
      console.error("Verification error:", error);
      setStatus("❌ " + (error.reason || error.message));
      setCertDetails(null);
    }
  };

  // -------------------- Render --------------------
  return (
    <div style={{ padding: "40px", maxWidth: "700px", margin: "auto" }}>
      <Typography variant="h4" gutterBottom>
        🔍 Verify Certificate
      </Typography>

      <Card>
        <CardContent>
          <Typography variant="body1" sx={{ mb: 2 }}>
            Enter the Certificate ID and file hash to check authenticity.
          </Typography>

          {/* Certificate ID Input */}
          <TextField
            fullWidth
            label="Certificate ID (text)"
            value={certId}
            onChange={(e) => setCertId(e.target.value)}
            variant="outlined"
            sx={{ mb: 2 }}
          />

          {/* File Hash Input */}
          <TextField
            fullWidth
            label="File Hash (SHA-256)"
            value={fileHash}
            onChange={(e) => setFileHash(e.target.value)}
            variant="outlined"
            sx={{ mb: 3 }}
          />

          {/* Verify Button */}
          <Button
            variant="contained"
            color="primary"
            onClick={handleVerify}
            disabled={!certId || !fileHash}
          >
            Verify Certificate
          </Button>

          {/* Status Message */}
          {status && (
            <Typography
              variant="body1"
              sx={{ mt: 3 }}
              color={status.includes("✅") ? "green" : "red"}
            >
              {status}
            </Typography>
          )}

          {/* Certificate Details */}
          {certDetails && (
            <>
              <Divider sx={{ my: 3 }} />
              <Typography variant="h6">📄 Certificate Details</Typography>

              <Typography sx={{ mt: 1 }}>
                <strong>Student Name:</strong> {certDetails.studentName}
              </Typography>
              <Typography>
                <strong>Course Name:</strong> {certDetails.courseName}
              </Typography>
              <Typography>
                <strong>Institute Name:</strong> {certDetails.instituteName}
              </Typography>
              <Typography>
                <strong>Institute ID:</strong> {certDetails.instituteId}
              </Typography>
              <Typography>
                <strong>Student Address:</strong> {certDetails.student}
              </Typography>
              <Typography>
                <strong>Issuer Address:</strong> {certDetails.issuer}
              </Typography>
              <Typography>
                <strong>Issued At:</strong> {certDetails.issuedAt}
              </Typography>
              <Typography>
                <strong>Revoked:</strong> {certDetails.revoked ? "Yes" : "No"}
              </Typography>
              <Typography>
                <strong>Revoked At:</strong> {certDetails.revokedAt}
              </Typography>
              <Typography>
                <strong>File Hash:</strong> {certDetails.fileHash}
              </Typography>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

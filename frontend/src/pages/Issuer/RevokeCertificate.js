import React, { useState } from "react";
import { ethers } from "ethers";
import { Card, CardContent, TextField, Button, Typography } from "@mui/material";
import { connectWallet } from "../../utils/connectWallet"; // adjust if needed

export default function RevokeCertificate() {
  const [certId, setCertId] = useState("");
  const [status, setStatus] = useState("");

  // 🧩 Function to revoke certificate
  const handleRevoke = async () => {
    try {
      setStatus("⏳ Processing... please confirm the transaction in MetaMask.");

      // ✅ Connect wallet & contract
      const { contract } = await connectWallet();

      // ✅ Call revoke function
      const tx = await contract.revokeCertificate(ethers.id(certId)); 
      await tx.wait();

      setStatus("✅ Certificate revoked successfully!");
    } catch (error) {
      console.error("Revoke error:", error);
      if (error?.reason) {
        setStatus("❌ " + error.reason);
      } else {
        setStatus("❌ " + error.message);
      }
    }
  };

  return (
    <div style={{ padding: "40px", maxWidth: "600px", margin: "auto" }}>
      <Typography variant="h4" gutterBottom>
        🔒 Revoke Certificate
      </Typography>

      <Card>
        <CardContent>
          <Typography variant="body1" sx={{ mb: 2 }}>
            Enter the Certificate ID you want to revoke:
          </Typography>

          <TextField
            fullWidth
            label="Certificate ID (text)"
            value={certId}
            onChange={(e) => setCertId(e.target.value)}
            variant="outlined"
            sx={{ mb: 3 }}
          />

          <Button
            variant="contained"
            color="error"
            onClick={handleRevoke}
            disabled={!certId}
          >
            Revoke Certificate
          </Button>

          {status && (
            <Typography
              variant="body1"
              color={status.includes("✅") ? "green" : "red"}
              sx={{ mt: 3 }}
            >
              {status}
            </Typography>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

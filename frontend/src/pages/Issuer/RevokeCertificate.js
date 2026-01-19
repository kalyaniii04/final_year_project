import React, { useState } from "react";
import { ethers } from "ethers";
import { connectWallet } from "../../utils/connectWallet";
import "./RevokeCertificate.css";

export default function RevokeCertificate() {
  const [certId, setCertId] = useState("");
  const [status, setStatus] = useState("");

  // 🧩 Function to revoke certificate
  const handleRevoke = async () => {
    try {
      setStatus("⏳ Processing... confirm the transaction in MetaMask.");

      const { contract } = await connectWallet();

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
    <div className="revoke-page">
      <div className="revoke-container">
        <h1 className="revoke-title">🔒 Revoke Certificate</h1>
        <p className="revoke-subtitle">
          Enter the Certificate ID you want to revoke from the blockchain.
        </p>

        <input
          className="revoke-input"
          placeholder="Certificate ID"
          value={certId}
          onChange={(e) => setCertId(e.target.value)}
        />

        <button
          className="primary-btn"
          onClick={handleRevoke}
          disabled={!certId}
        >
          Revoke Certificate
        </button>

        {status && (
          <p
            className={`status-text ${
              status.includes("✅") ? "success" : "error"
            }`}
          >
            {status}
          </p>
        )}
      </div>
    </div>
  );
}

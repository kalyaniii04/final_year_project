import { useState } from "react";
import { ethers } from "ethers";
import CONTRACT_ABI from "../CertificateRegistry.json"

// 🔴 UPDATE THESE
const CONTRACT_ADDRESS = "0x5FbDB2315678afecb367f032d93F642f64180aa3";

export default function Student() {
  const [walletAddress, setWalletAddress] = useState(null);
  const [certificates, setCertificates] = useState([]);
  const [loading, setLoading] = useState(false);

  // ===============================
  // Phase 2: Fetch Certificates
  // ===============================
  const fetchCertificates = async (studentAddress) => {
    try {
      setLoading(true);

      const provider = new ethers.BrowserProvider(window.ethereum);
      const contract = new ethers.Contract(
        CONTRACT_ADDRESS,
        CONTRACT_ABI,
        provider
      );

      const [ids, certs] =
        await contract.getCertificatesByStudent(studentAddress);

      const formatted = certs.map((c, index) => ({
        certificateId: ids[index],
        courseName: c.courseName,
        instituteName: c.instituteName,
        issuer: c.issuer,
        issuedAt: new Date(
          Number(c.issuedAt) * 1000
        ).toLocaleDateString(),
        revoked: c.revoked
      }));

      setCertificates(formatted);
    } catch (err) {
      console.error("Failed to fetch certificates:", err);
    } finally {
      setLoading(false);
    }
  };

  // ===============================
  // Phase 1: Connect Wallet
  // ===============================
  const connectWallet = async () => {
    try {
      if (!window.ethereum) {
        alert("MetaMask not detected");
        return;
      }

      const provider = new ethers.BrowserProvider(window.ethereum);
      const accounts = await provider.send("eth_requestAccounts", []);

      setWalletAddress(accounts[0]);

      // ✅ CALL PHASE 2
      fetchCertificates(accounts[0]);

    } catch (error) {
      console.error("Wallet connection failed:", error);
    }
  };

  return (
    <div style={{ padding: 20 }}>
      <h2>Student Dashboard</h2>

      {!walletAddress ? (
        <button onClick={connectWallet}>Connect Wallet</button>
      ) : (
        <>
          <p><strong>Wallet:</strong> {walletAddress}</p>

          <h3>Your Certificates</h3>

          {loading ? (
            <p>Loading certificates...</p>
          ) : certificates.length === 0 ? (
            <p>No certificates found.</p>
          ) : (
            <ul>
              {certificates.map((cert, index) => (
                <li key={index} style={{ marginBottom: 12 }}>
                  <p><strong>Course:</strong> {cert.courseName}</p>
                  <p><strong>Institute:</strong> {cert.instituteName}</p>
                  <p><strong>Issued:</strong> {cert.issuedAt}</p>
                  <p>
                    <strong>Status:</strong>{" "}
                    {cert.revoked ? "Revoked" : "Valid"}
                  </p>
                </li>
              ))}
            </ul>
          )}
        </>
      )}
    </div>
  );
}

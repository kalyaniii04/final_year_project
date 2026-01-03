import { useState } from "react";
import { ethers } from "ethers";

export default function Student() {
  const [walletAddress, setWalletAddress] = useState(null);
  const [certificates, setCertificates] = useState([]);

  // Connect Wallet
  const connectWallet = async () => {
    try {
      if (!window.ethereum) {
        alert("MetaMask not detected. Please install MetaMask.");
        return;
      }

      const provider = new ethers.BrowserProvider(window.ethereum);
      const accounts = await provider.send("eth_requestAccounts", []);
      setWalletAddress(accounts[0]);

      // Phase 2: Fetch certificates from smart contract
      // fetchCertificates(accounts[0]);

    } catch (error) {
      console.error("Wallet connection failed:", error);
    }
  };

  return (
    <div style={{ padding: 20 }}>
      <h2>Student Dashboard</h2>

      {!walletAddress ? (
        <button onClick={connectWallet}>
          Connect Wallet
        </button>
      ) : (
        <>
          <p><strong>Wallet Connected:</strong> {walletAddress}</p>

          <h3>Your Certificates</h3>

          {certificates.length === 0 ? (
            <p>No certificates found.</p>
          ) : (
            <ul>
              {certificates.map((cert, index) => (
                <li key={index}>
                  <p><strong>Course:</strong> {cert.course}</p>
                  <p><strong>Issuer:</strong> {cert.issuer}</p>
                  <p><strong>Issue Date:</strong> {cert.date}</p>
                </li>
              ))}
            </ul>
          )}
        </>
      )}
    </div>
  );
}

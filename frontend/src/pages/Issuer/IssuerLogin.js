import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { connectWallet } from "../../utils/connectWallet";

const IssuerLogin = () => {
  const [walletAddress, setWalletAddress] = useState("");
  const [email, setEmail] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState("");
  const [generatedOtp, setGeneratedOtp] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  // ==============================
  // 🔗 Handle MetaMask connection
  // ==============================
  const handleWalletConnect = async () => {
    try {
      setLoading(true);

      // ✅ connectWallet now returns an object
      const { signer } = await connectWallet();

      // ✅ Extract address safely
      const address = await signer.getAddress();

      setWalletAddress(address);
    } catch (error) {
      console.error("❌ Wallet connection failed:", error);
      alert("Wallet connection failed. Check console.");
    } finally {
      setLoading(false);
    }
  };

  // ==============================
  // 📧 Simulate OTP sending
  // ==============================
  const sendOtp = () => {
    if (!email) {
      alert("Please enter your email ID first.");
      return;
    }

    const randomOtp = Math.floor(100000 + Math.random() * 900000).toString();
    setGeneratedOtp(randomOtp);
    setOtpSent(true);

    // ⚠️ Simulation only
    alert("OTP sent to your email (simulated): " + randomOtp);
  };

  // ==============================
  // ✅ Verify OTP
  // ==============================
  const verifyOtp = () => {
    if (otp === generatedOtp) {
      alert("✅ OTP Verified Successfully!");
      navigate("/issuer-dashboard");
    } else {
      alert("❌ Invalid OTP. Please try again.");
    }
  };

  // ==============================
  // 🧱 UI
  // ==============================
  return (
    <div style={{ textAlign: "center", marginTop: "50px" }}>
      <h1>Issuer Login & MFA Verification</h1>

      {/* MetaMask Connection */}
      {!walletAddress ? (
        <button onClick={handleWalletConnect} disabled={loading}>
          {loading ? "Connecting..." : "Connect MetaMask"}
        </button>
      ) : (
        <p>
          ✅ Connected Wallet:{" "}
          <strong>
            {walletAddress.slice(0, 6)}...{walletAddress.slice(-4)}
          </strong>
        </p>
      )}

      {/* Email + OTP Section */}
      {walletAddress && (
        <div style={{ marginTop: "20px" }}>
          <p>Enter your Email ID:</p>

          <input
            type="email"
            placeholder="Enter Email ID"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <br />
          <br />

          <button onClick={sendOtp}>Send OTP</button>

          {otpSent && (
            <div style={{ marginTop: "15px" }}>
              <p>Enter OTP:</p>

              <input
                type="text"
                placeholder="Enter OTP"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
              />

              <br />
              <br />

              <button onClick={verifyOtp}>Verify OTP</button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default IssuerLogin;

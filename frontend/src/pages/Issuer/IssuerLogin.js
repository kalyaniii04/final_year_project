import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { connectWallet } from "../../utils/connectWallet";

const IssuerLogin = () => {
  const [walletAddress, setWalletAddress] = useState("");
  const [email, setEmail] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  // ==================================
  // 🔗 Wallet login + signature (Stage 2)
  // ==================================
  const handleWalletConnect = async () => {
    try {
      setLoading(true);

      // 1️⃣ Connect wallet
      const { signer } = await connectWallet();
      const address = await signer.getAddress();

      // 2️⃣ Sign message
      const message = "Login as Certificate Issuer";
      const signature = await signer.signMessage(message);

      // 3️⃣ Send to backend
      const res = await axios.post("http://localhost:5000/auth/login", {
        walletAddress: address,
        signature,
      });

      console.log("Wallet verified:", res.data);

      setWalletAddress(address);
      alert("Wallet verified. Please enter email to receive OTP.");

    } catch (error) {
      console.error("❌ Wallet authentication failed:", error);
      alert("Wallet authentication failed");
    } finally {
      setLoading(false);
    }
  };

  // ==================================
  // 📧 Request OTP from backend
  // ==================================
  const sendOtp = async () => {
    try {
      if (!email) {
        alert("Please enter email");
        return;
      }

      setLoading(true);

      await axios.post("http://localhost:5000/auth/send-otp", {
        walletAddress,
        email,
      });

      setOtpSent(true);
      alert("OTP sent to your email");

    } catch (error) {
      console.error("❌ OTP send failed:", error);
      alert("Failed to send OTP");
    } finally {
      setLoading(false);
    }
  };

  // ==================================
  // ✅ Verify OTP (Stage 3)
  // ==================================
  const verifyOtp = async () => {
    try {
      setLoading(true);

      const res = await axios.post(
        "http://localhost:5000/auth/verify-otp",
        {
          walletAddress,
          otp,
        }
      );

      const { token } = res.data;

      // Save MFA token
      localStorage.setItem("issuerToken", token);

      alert("✅ MFA verified successfully");
      navigate("/issuer-dashboard");

    } catch (error) {
      console.error("❌ OTP verification failed:", error);
      alert("Invalid or expired OTP");
    } finally {
      setLoading(false);
    }
  };

  // ==================================
  // 🧱 UI
  // ==================================
  return (
    <div style={{ textAlign: "center", marginTop: "50px" }}>
      <h1>Issuer Login (MFA)</h1>

      {/* Wallet Section */}
      {!walletAddress ? (
        <button onClick={handleWalletConnect} disabled={loading}>
          {loading ? "Connecting..." : "Login with MetaMask"}
        </button>
      ) : (
        <p>
          ✅ Wallet Connected:{" "}
          <strong>
            {walletAddress.slice(0, 6)}...{walletAddress.slice(-4)}
          </strong>
        </p>
      )}

      {/* Email + OTP */}
      {walletAddress && (
        <div style={{ marginTop: "20px" }}>
          <input
            type="email"
            placeholder="Enter registered email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <br />
          <br />

          <button onClick={sendOtp} disabled={loading}>
            Send OTP
          </button>

          {otpSent && (
            <div style={{ marginTop: "15px" }}>
              <input
                type="text"
                placeholder="Enter OTP"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
              />

              <br />
              <br />

              <button onClick={verifyOtp} disabled={loading}>
                Verify OTP
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default IssuerLogin;

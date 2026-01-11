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
  // 🔗 Wallet Login (Nonce-based, Secure)
  // ==================================
  const handleWalletConnect = async () => {
    try {
      setLoading(true);

      // 1️⃣ Connect wallet
      const { signer } = await connectWallet();
      const address = await signer.getAddress();

      // 2️⃣ Request nonce from backend
      const nonceRes = await axios.post(
        "http://localhost:5000/auth/request-nonce",
        { walletAddress: address }
      );

      const nonce = nonceRes.data.nonce;

      // 3️⃣ Sign nonce
      const message = `Login nonce: ${nonce}`;
      const signature = await signer.signMessage(message);

      // 4️⃣ Verify signature
      await axios.post("http://localhost:5000/auth/login", {
        walletAddress: address,
        signature,
      });

      setWalletAddress(address);
      alert("✅ Wallet verified. Enter email to receive OTP.");

    } catch (error) {
      console.error("❌ Wallet authentication failed:", error);
      alert(
        error?.response?.data?.error || "Wallet authentication failed"
      );
    } finally {
      setLoading(false);
    }
  };

  // ==================================
  // 📧 Send OTP
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
      alert("📧 OTP sent to your email");

    } catch (error) {
      console.error("❌ OTP send failed:", error);
      alert(error?.response?.data?.error || "Failed to send OTP");
    } finally {
      setLoading(false);
    }
  };

  // ==================================
  // ✅ Verify OTP
  // ==================================
  const verifyOtp = async () => {
    try {
      if (!otp) {
        alert("Please enter OTP");
        return;
      }

      setLoading(true);

      const res = await axios.post(
        "http://localhost:5000/auth/verify-otp",
        {
          walletAddress,
          otp,
        }
      );

      const { token } = res.data;

      // Save JWT
      localStorage.setItem("issuerToken", token);

      alert("✅ MFA verified successfully");
      navigate("/issuer-dashboard");

    } catch (error) {
      console.error("❌ OTP verification failed:", error);
      alert(error?.response?.data?.error || "Invalid or expired OTP");
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
            {loading ? "Sending..." : "Send OTP"}
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
                {loading ? "Verifying..." : "Verify OTP"}
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default IssuerLogin;

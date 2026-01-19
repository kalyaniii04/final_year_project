import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../api/axios";
import { connectWallet } from "../../utils/connectWallet";
import "./IssuerLogin.css";

const IssuerLogin = () => {
  const navigate = useNavigate();

  const [step, setStep] = useState(1);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [walletAddress, setWalletAddress] = useState("");
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);

  const loginWithPassword = async () => {
    try {
      setLoading(true);
      await api.post("/auth/login-password", { email, password });
      alert("✅ Email & password verified");
      setStep(2);
    } catch (err) {
      alert(err?.response?.data?.error || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  const handleWalletConnect = async () => {
    try {
      setLoading(true);
      const { signer } = await connectWallet();
      const address = await signer.getAddress();

      const nonceRes = await api.post("/auth/request-nonce", {
        walletAddress: address,
      });

      const message = `Login nonce: ${nonceRes.data.nonce}`;
      const signature = await signer.signMessage(message);

      await api.post("/auth/login", { walletAddress: address, signature });

      setWalletAddress(address);
      alert("✅ Wallet verified");
      setStep(3);
    } catch (err) {
      alert(err?.response?.data?.error || "Wallet verification failed");
    } finally {
      setLoading(false);
    }
  };

  const sendOtp = async () => {
    try {
      setLoading(true);
      await api.post("/auth/send-otp", { email, walletAddress });
      alert("📧 OTP sent to email");
    } catch (err) {
      alert(err?.response?.data?.error || "OTP failed");
    } finally {
      setLoading(false);
    }
  };

  const verifyOtp = async () => {
    try {
      setLoading(true);
      const res = await api.post("/auth/verify-otp", { walletAddress, otp });
      localStorage.setItem("issuerToken", res.data.token);
      navigate("/issuer-dashboard");
    } catch (err) {
      alert(err?.response?.data?.error || "Invalid OTP");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h2 className="auth-title">Issuer Login</h2>
        <p className="auth-subtitle">Multi-Factor Authentication</p>

        {step === 1 && (
          <>
            <input
              type="email"
              placeholder="Registered Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <button onClick={loginWithPassword} disabled={loading}>
              {loading ? "Verifying..." : "Login"}
            </button>
          </>
        )}

        {step === 2 && (
          <button onClick={handleWalletConnect} disabled={loading}>
            {loading ? "Connecting..." : "Connect MetaMask"}
          </button>
        )}

        {step === 3 && (
          <>
            <button onClick={sendOtp} disabled={loading}>
              Send OTP
            </button>
            <input
              placeholder="Enter OTP"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
            />
            <button onClick={verifyOtp} disabled={loading}>
              Verify OTP
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default IssuerLogin;

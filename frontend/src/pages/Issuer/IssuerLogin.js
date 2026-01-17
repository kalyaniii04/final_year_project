import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../api/axios";
import { connectWallet } from "../../utils/connectWallet";

const IssuerLogin = () => {
  const navigate = useNavigate();

  const [step, setStep] = useState(1); // 1=email, 2=wallet, 3=otp
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [walletAddress, setWalletAddress] = useState("");
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);

  /* ==================================
     1️⃣ EMAIL + PASSWORD LOGIN
  ================================== */
  const loginWithPassword = async () => {
    try {
      setLoading(true);

      await api.post("/auth/login-password", {
        email,
        password,
      });

      alert("✅ Email & password verified");
      setStep(2);

    } catch (err) {
      alert(
        err?.response?.data?.error ||
        "User not found. Please signup first."
      );
    } finally {
      setLoading(false);
    }
  };

  /* ==================================
     2️⃣ WALLET AUTH (NONCE)
  ================================== */
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

      await api.post("/auth/login", {
        walletAddress: address,
        signature,
      });

      setWalletAddress(address);
      alert("✅ Wallet verified");
      setStep(3);

    } catch (err) {
      alert(err?.response?.data?.error || "Wallet verification failed");
    } finally {
      setLoading(false);
    }
  };

  /* ==================================
     3️⃣ SEND OTP
  ================================== */
  const sendOtp = async () => {
    try {
      setLoading(true);

      await api.post("/auth/send-otp", {
        email,
        walletAddress,
      });

      alert("📧 OTP sent to registered email");

    } catch (err) {
      alert(err?.response?.data?.error || "OTP send failed");
    } finally {
      setLoading(false);
    }
  };

  /* ==================================
     4️⃣ VERIFY OTP
  ================================== */
  const verifyOtp = async () => {
    try {
      setLoading(true);

      const res = await api.post("/auth/verify-otp", {
        walletAddress,
        otp,
      });

      localStorage.setItem("issuerToken", res.data.token);
      alert("🎉 Login successful");

      navigate("/issuer-dashboard");

    } catch (err) {
      alert(err?.response?.data?.error || "Invalid OTP");
    } finally {
      setLoading(false);
    }
  };

  /* ==================================
     🧱 UI
  ================================== */
  return (
    <div style={{ textAlign: "center", marginTop: 50 }}>
      <h2>Issuer Login (MFA)</h2>

      {/* STEP 1 */}
      {step === 1 && (
        <>
          <input
            type="email"
            placeholder="Registered Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <br /><br />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <br /><br />
          <button onClick={loginWithPassword} disabled={loading}>
            {loading ? "Verifying..." : "Login"}
          </button>
        </>
      )}

      {/* STEP 2 */}
      {step === 2 && (
        <button onClick={handleWalletConnect} disabled={loading}>
          {loading ? "Connecting..." : "Connect MetaMask"}
        </button>
      )}

      {/* STEP 3 */}
      {step === 3 && (
        <>
          <button onClick={sendOtp} disabled={loading}>
            Send OTP
          </button>
          <br /><br />
          <input
            placeholder="Enter OTP"
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
          />
          <br /><br />
          <button onClick={verifyOtp} disabled={loading}>
            Verify OTP
          </button>
        </>
      )}
    </div>
  );
};

export default IssuerLogin;

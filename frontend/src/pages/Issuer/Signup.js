import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../api/axios";
import "./Signup.css";

const IssuerSignup = () => {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSignup = async () => {
    if (!email || !password || !confirmPassword) {
      alert("All fields are required");
      return;
    }

    if (password !== confirmPassword) {
      alert("Passwords do not match");
      return;
    }

    if (password.length < 6) {
      alert("Password must be at least 6 characters");
      return;
    }

    try {
      setLoading(true);

      await api.post("/auth/signup", { email, password });

      alert("✅ Signup successful. Please login.");
      navigate("/issuer-login");

    } catch (err) {
      alert(err?.response?.data?.error || "Signup failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h2 className="auth-title">Issuer Signup</h2>
        <p className="auth-subtitle">
          Register to issue blockchain-verified certificates
        </p>

        <input
          type="email"
          placeholder="Official Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="auth-input"
        />

        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="auth-input"
        />

        <input
          type="password"
          placeholder="Confirm Password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          className="auth-input"
        />

        <button
          onClick={handleSignup}
          disabled={loading}
          className="auth-button"
        >
          {loading ? "Creating Account..." : "Signup"}
        </button>

        <p className="auth-footer">
          Already registered?{" "}
          <span onClick={() => navigate("/issuer-login")}>
            Login
          </span>
        </p>
      </div>
    </div>
  );
};

export default IssuerSignup;

import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../api/axios";

const IssuerSignup = () => {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);

  /* ==================================
     SIGNUP HANDLER
  ================================== */
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

      await api.post("/auth/signup", {
        email,
        password,
      });

      alert("✅ Signup successful. Please login.");
      navigate("/issuer-login");

    } catch (err) {
      alert(
        err?.response?.data?.error ||
        "Signup failed. Email may already exist."
      );
    } finally {
      setLoading(false);
    }
  };

  /* ==================================
     UI
  ================================== */
  return (
    <div style={{ textAlign: "center", marginTop: 50 }}>
      <h2>Issuer Signup</h2>

      <input
        type="email"
        placeholder="Official Email"
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

      <input
        type="password"
        placeholder="Confirm Password"
        value={confirmPassword}
        onChange={(e) => setConfirmPassword(e.target.value)}
      />
      <br /><br />

      <button onClick={handleSignup} disabled={loading}>
        {loading ? "Creating account..." : "Signup"}
      </button>

      <p style={{ marginTop: 15 }}>
        Already registered?{" "}
        <span
          style={{ color: "blue", cursor: "pointer" }}
          onClick={() => navigate("/issuer-login")}
        >
          Login
        </span>
      </p>
    </div>
  );
};

export default IssuerSignup;

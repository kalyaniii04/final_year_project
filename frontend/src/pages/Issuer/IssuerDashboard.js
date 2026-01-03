import React from "react";
import { useNavigate } from "react-router-dom";
import "./IssuerDashboard.css"; // 👈 CSS file

const IssuerDashboard = () => {
  const navigate = useNavigate();

  return (
    <div className="dashboard-container">
      <h1>🏢 Issuer Dashboard</h1>
      <p>
        Welcome back! Manage your institute, issue or revoke certificates, and
        track your issued records — all from one place.
      </p>

      <div className="action-buttons">
        <button onClick={() => navigate("/register-institute")}>
          🏫 Register Institute
        </button>
        <button onClick={() => navigate("/issue-certificate")}>
          🎓 Issue Certificate
        </button>
        <button onClick={() => navigate("/revoke-certificate")}>
          ❌ Revoke Certificate
        </button>
        <button onClick={() => navigate("/issued-certificates")}>
          📜 My Issued Certificates
        </button>
      </div>
    </div>
  );
};

export default IssuerDashboard;

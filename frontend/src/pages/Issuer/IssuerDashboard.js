import React from "react";
import { useNavigate } from "react-router-dom";
import "./IssuerDashboard.css";

const IssuerDashboard = () => {
  const navigate = useNavigate();

  return (
    <div className="dashboard-container">
      <div className="dashboard-card">
        <h1 className="dashboard-title">
          Issuer <span>Dashboard</span>
        </h1>

        <p className="dashboard-subtitle">
          Manage your institute, issue or revoke certificates, and track all
          blockchain-verified records from one secure place.
        </p>

        <div className="action-grid">
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
            📜 Issued Certificates
          </button>
        </div>
      </div>
    </div>
  );
};

export default IssuerDashboard;

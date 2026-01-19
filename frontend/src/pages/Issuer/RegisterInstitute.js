import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { connectWallet } from "../../utils/connectWallet";
import "./RegisterInstitute.css";

const RegisterInstitute = () => {
  const [instituteName, setInstituteName] = useState("");
  const [instituteId, setInstituteId] = useState("");
  const [location, setLocation] = useState("");
  const [transactionHash, setTransactionHash] = useState("");

  const navigate = useNavigate();

  const registerInstitute = async () => {
    if (!instituteName || !instituteId || !location) {
      alert("Please fill all fields before submitting.");
      return;
    }

    try {
      const { contract } = await connectWallet();

      const tx = await contract.registerIssuer(
        instituteName,
        instituteId,
        location
      );

      await tx.wait();
      setTransactionHash(tx.hash);

      alert("✅ Institute registered successfully!");
      navigate("/issuer-dashboard");
    } catch (error) {
      alert("❌ Registration failed: " + error.message);
    }
  };

  return (
    <div className="register-container">
      <div className="register-card">
        <h1 className="register-title">
          Register <span>Institute</span>
        </h1>

        <p className="register-subtitle">
          Add your institute to the blockchain for secure and verifiable
          certificate issuance.
        </p>

        <input
          type="text"
          placeholder="Institute Name"
          value={instituteName}
          onChange={(e) => setInstituteName(e.target.value)}
        />

        <input
          type="text"
          placeholder="Institute ID"
          value={instituteId}
          onChange={(e) => setInstituteId(e.target.value)}
        />

        <input
          type="text"
          placeholder="Location"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
        />

        <button onClick={registerInstitute}>
          🚀 Submit & Register
        </button>

        {transactionHash && (
          <p className="tx-hash">
            ✅ Transaction:
            <br />
            <code>{transactionHash}</code>
          </p>
        )}
      </div>
    </div>
  );
};

export default RegisterInstitute;

// Importing required libraries and hooks from React and React Router
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

// Importing custom function to connect to blockchain wallet
import { connectWallet } from "../../utils/connectWallet";

// Importing CSS file for styling this component
import "./RegisterInstitute.css";

// Functional component for registering an institute
const RegisterInstitute = () => {
  // React state variables for form inputs and transaction hash
  const [instituteName, setInstituteName] = useState(""); // Holds institute name
  const [instituteId, setInstituteId] = useState("");     // Holds institute ID
  const [location, setLocation] = useState("");            // Holds institute location
  const [transactionHash, setTransactionHash] = useState(""); // Holds blockchain transaction hash

  // Hook to navigate between routes after successful registration
  const navigate = useNavigate();

  // Function to handle institute registration process
  const registerInstitute = async () => {
    // Validation: ensure all fields are filled before submitting
    if (!instituteName || !instituteId || !location) {
      alert("Please fill all fields before submitting.");
      return;
    }

    try {
      // Connect to wallet and get contract instance
      const { contract } = await connectWallet();

      // Call smart contract function 'registerIssuer' with form data
      const tx = await contract.registerIssuer(instituteName, instituteId, location);

      // Wait for transaction confirmation
      await tx.wait();

      // Store transaction hash to display later
      setTransactionHash(tx.hash);

      // Notify user of success
      alert("✅ Institute registered successfully!");

      // Redirect to issuer dashboard
      navigate("/issuer-dashboard");
    } catch (error) {
      // Handle any errors during registration
      alert("❌ Registration failed: " + error.message);
    }
  };

  // JSX layout for rendering the registration form
  return (
    <div className="register-container">
      <h1>🏫 Register Institute</h1>

      {/* Input field for institute name */}
      <input
        type="text"
        placeholder="Institute Name"
        value={instituteName}
        onChange={(e) => setInstituteName(e.target.value)}
      />

      {/* Input field for institute ID */}
      <input
        type="text"
        placeholder="Institute ID"
        value={instituteId}
        onChange={(e) => setInstituteId(e.target.value)}
      />

      {/* Input field for institute location */}
      <input
        type="text"
        placeholder="Location"
        value={location}
        onChange={(e) => setLocation(e.target.value)}
      />

      {/* Button to trigger registration */}
      <button onClick={registerInstitute}>🚀 Submit & Register</button>

      {/* Display transaction hash after successful registration */}
      {transactionHash && (
        <p>
          ✅ Registered! Tx Hash: <code>{transactionHash}</code>
        </p>
      )}
    </div>
  );
};

// Exporting the component for use in other parts of the app
export default RegisterInstitute;

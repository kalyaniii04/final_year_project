import { useNavigate } from "react-router-dom";
import "./Home.css";

export default function Home() {
  const navigate = useNavigate();

  return (
    <div className="home-container">
      <header>Blockchain Certificate Verification System</header>

      <main>
        <h1>Welcome to the Future of Academic Verification</h1>

        <p className="subtitle">
          Our blockchain-based platform ensures secure, transparent, and tamper-proof 
          issuance and verification of academic certificates for institutions, students, 
          and verifiers alike.
        </p>

        <div className="button-group">
          <button onClick={() => navigate("/issuer-login")}>I am an Issuer</button>
          <button onClick={() => navigate("/verify-certificate")}>I am a Verifier</button>
          <button>I am a Student</button>
        </div>
      </main>

      <footer>
        © 2025 Blockchain Certificate Verification System. All rights reserved..
      </footer>
    </div>
  );
}

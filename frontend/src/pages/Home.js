import { useNavigate } from "react-router-dom";

export default function Home() {
    const navigate = useNavigate();
    
    return (
    <div>
      <h1>Welcome to Blockchain-based Certificate Verification System</h1>

      <p>
        A decentralized platform for secure and transparent academic certificate
        issuance and verification.
      </p>

      <div>
        <button onClick={() => navigate("/issuer-login")}>I am an Issuer</button>
          <button onClick={() => navigate("/verify-certificate")}>I am a Verifier</button>
        <button>I am a Student</button>
      </div>

      <footer>
        <p>© 2025 Blockchain Certificate Verification System. All rights reserved.</p>
      </footer>
    </div>
  );
}

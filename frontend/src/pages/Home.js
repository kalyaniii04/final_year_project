import { useNavigate } from "react-router-dom";
import "./Home.css";

export default function Home() {
  const navigate = useNavigate();

  return (
    <div className="home-container">
      {/* ================= HERO SECTION ================= */}
      <div className="hero">
        <h1 className="hero-title">
          Blockchain-based Certificate <span>Verification System</span>
        </h1>

        <p className="hero-subtitle">
          A decentralized platform for secure, transparent, and tamper-proof
          academic certificate issuance and verification.
        </p>

        <div className="button-group">
          <button
            className="primary-btn"
            onClick={() => navigate("/issuer-signup")}
          >
            I am an Issuer
          </button>

          <button
            className="secondary-btn"
            onClick={() => navigate("/verify-certificate")}
          >
            I am a Verifier
          </button>

          <button
            className="secondary-btn"
            onClick={() => navigate("/student-page")}
          >
            I am a Student
          </button>
        </div>
      </div>

      {/* ================= HOW IT WORKS ================= */}
      <section className="section">
        <h2 className="section-title">How It Works</h2>

        <div className="card-grid">
          <div className="info-card">
            <h3>📄 Issue Certificate</h3>
            <p>
              Authorized institutions issue certificates which are securely
              recorded on the blockchain.
            </p>
          </div>

          <div className="info-card">
            <h3>⛓ Store on Blockchain</h3>
            <p>
              Certificate hash is stored on Ethereum ensuring immutability and
              tamper-proof records.
            </p>
          </div>

          <div className="info-card">
            <h3>✅ Verify Instantly</h3>
            <p>
              Anyone can verify certificate authenticity instantly without
              intermediaries.
            </p>
          </div>
        </div>
      </section>

      {/* ================= WHY BLOCKCHAIN ================= */}
      <section className="section dark-section">
        <h2 className="section-title">Why Blockchain?</h2>

        <div className="features">
          <span>✔ Tamper-proof Records</span>
          <span>✔ Decentralized Verification</span>
          <span>✔ Lifetime Validity</span>
          <span>✔ No Central Authority</span>
          <span>✔ Public & Transparent</span>
        </div>
      </section>

      {/* ================= TRUST SECTION ================= */}
      <section className="section">
        <h2 className="section-title">Built for Trust</h2>

        <div className="trust-grid">
          <div>
            <h3>🔐 Secure</h3>
            <p>Cryptographically secured using Ethereum blockchain.</p>
          </div>

          <div>
            <h3>🌍 Global</h3>
            <p>Accessible worldwide without dependency on institutions.</p>
          </div>

          <div>
            <h3>⚡ Fast Verification</h3>
            <p>Verify certificates in seconds using blockchain records.</p>
          </div>
        </div>
      </section>

      {/* ================= FOOTER ================= */}
      <footer className="footer">
        <p>© 2025 Blockchain Certificate Verification System</p>
        <p className="footer-muted">Powered by Ethereum • Sepolia Testnet</p>
      </footer>
    </div>
  );
}

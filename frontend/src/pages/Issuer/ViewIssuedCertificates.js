import React, { useEffect, useState } from "react";
import { connectWallet } from "../../utils/connectWallet";
import "./ViewIssuedCertificates.css";

export default function ViewIssuedCertificates() {
  const [certificates, setCertificates] = useState([]);
  const [loading, setLoading] = useState(false);
  const [issuerAddress, setIssuerAddress] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  // Fetch certificates from blockchain
  const fetchCertificates = async () => {
    try {
      setLoading(true);
      setErrorMsg("");

      const { contract, signer } = await connectWallet();
      const address = await signer.getAddress();
      setIssuerAddress(address);

      const ids = await contract.getCertificateIdsByIssuer(address);
      if (!Array.isArray(ids) || ids.length === 0) {
        setCertificates([]);
        return;
      }

      const certs = await Promise.all(
        ids.map(async (id) => {
          const cert = await contract.getCertificate(id);
          return {
            id,
            student: cert.student,
            revoked: cert.revoked,
            studentName: cert.studentName,
            courseName: cert.courseName,
            instituteName: cert.instituteName,
            issuedAt: cert.issuedAt
              ? new Date(Number(cert.issuedAt) * 1000).toLocaleString()
              : "N/A",
          };
        })
      );

      setCertificates(certs);
    } catch (error) {
      console.error("❌ Error fetching certificates:", error);
      setErrorMsg(error.reason || error.message || "Failed to fetch certificates.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCertificates();
  }, []);

  return (
    <div className="view-cert-page">
      <h1 className="page-title">🧾 Issued Certificates</h1>
      <p className="page-subtitle">
        Certificates issued by: <strong>{issuerAddress || "Connecting..."}</strong>
      </p>

      <button className="primary-btn" onClick={fetchCertificates} disabled={loading}>
        🔄 Refresh List
      </button>

      {loading ? (
        <p className="loading-text">⏳ Fetching certificates from blockchain...</p>
      ) : certificates.length === 0 ? (
        <p className="no-data">No certificates found for this issuer.</p>
      ) : (
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Certificate Hash</th>
                <th>Student Name</th>
                <th>Course</th>
                <th>Institute</th>
                <th>Student Address</th>
                <th>Issued At</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {certificates.map((cert, idx) => (
                <tr key={idx}>
                  <td>{cert.id ? cert.id.slice(0, 10) + "..." : "N/A"}</td>
                  <td>{cert.studentName}</td>
                  <td>{cert.courseName}</td>
                  <td>{cert.instituteName}</td>
                  <td>
                    {cert.student
                      ? `${cert.student.slice(0, 6)}...${cert.student.slice(-4)}`
                      : "N/A"}
                  </td>
                  <td>{cert.issuedAt}</td>
                  <td className={cert.revoked ? "revoked" : "active"}>
                    {cert.revoked ? "❌ Revoked" : "✅ Active"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {errorMsg && <p className="error-msg">{errorMsg}</p>}
    </div>
  );
}

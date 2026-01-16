import React, { useEffect, useState } from "react";
import axios from "axios";
import { useParams } from "react-router-dom";

const VerifyCertificate = () => {
  const { certificateId: qrCertificateId } = useParams();

  const [certificateId, setCertificateId] = useState("");
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);

  const isQRMode = !!qrCertificateId;

  // ===============================
  // Auto verify on QR scan
  // ===============================
  useEffect(() => {
    if (qrCertificateId) {
      setCertificateId(qrCertificateId);
      verifyCertificate(qrCertificateId);
    }
    // eslint-disable-next-line
  }, [qrCertificateId]);

  // ===============================
  // Verify certificate
  // ===============================
  const verifyCertificate = async (certId) => {
    try {
      setLoading(true);

      const res = await axios.get(
        `https://final-year-project-p0gs.onrender.com/verify/${certId.trim()}`
      );

      setData(res.data);
    } catch (err) {
      console.error("Verification failed:", err.response?.data || err.message);
      setData({
        verified: false,
        message: "Certificate not found on blockchain",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: "600px", margin: "auto", padding: "20px" }}>
      <h2>🎓 Certificate Verification</h2>

      {!isQRMode && (
        <>
          <input
            type="text"
            placeholder="Enter Certificate ID"
            value={certificateId}
            onChange={(e) => setCertificateId(e.target.value)}
            style={{ width: "100%", padding: "8px" }}
          />
          <br /><br />
          <button onClick={() => verifyCertificate(certificateId)}>
            Verify
          </button>
        </>
      )}

      {loading && <p>🔍 Verifying...</p>}

      <hr />

      {/* ❌ Failed */}
      {data && !data.verified && (
        <div style={{ color: "red" }}>
          <h3>❌ Verification Failed</h3>
          <p>{data.message}</p>
        </div>
      )}

      {/* ✅ Success */}
      {data && data.verified && (
        <div style={{ color: "green" }}>
          <h3>✅ Certificate Verified</h3>

          <p><strong>Certificate ID:</strong> {certificateId}</p>
          <p><strong>Student Name:</strong> {data.studentName}</p>
          <p><strong>Course:</strong> {data.course}</p>

          <p>
            <strong>Issued On:</strong>{" "}
            {new Date(data.issuedAt * 1000).toLocaleDateString()}
          </p>

          {data.revoked && (
            <p style={{ color: "red", fontWeight: "bold" }}>
              🚫 This certificate has been revoked
            </p>
          )}
        </div>
      )}
    </div>
  );
};

export default VerifyCertificate;

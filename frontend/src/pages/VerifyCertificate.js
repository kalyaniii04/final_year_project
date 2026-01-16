import React, { useEffect, useState } from "react";
import axios from "axios";
import { useParams } from "react-router-dom";

const VerifyCertificate = () => {
  const { certificateId: qrCertificateId } = useParams();

  const [certificateId, setCertificateId] = useState("");
  const [fileHash, setFileHash] = useState("");
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);

  const isQRMode = !!qrCertificateId;

  /* ===============================
     AUTO VERIFY WHEN QR IS SCANNED
  =============================== */
  useEffect(() => {
    if (qrCertificateId) {
      setCertificateId(qrCertificateId);
      verifyById(qrCertificateId);
    }
    // eslint-disable-next-line
  }, [qrCertificateId]);

  /* ===============================
     VERIFY BY CERTIFICATE ID (QR)
  =============================== */
  const verifyById = async (certId) => {
    try {
      setLoading(true);
      const res = await axios.get(
        `https://final-year-project-p0gs.onrender.com/verify/${certId.trim()}`
      );
      setData(res.data);
    } catch (err) {
      setData({
        verified: false,
        status: "NOT_FOUND",
        message: "Certificate not found on blockchain",
      });
    } finally {
      setLoading(false);
    }
  };

  /* ===============================
     VERIFY BY HASH (STRONG VERIFY)
  =============================== */
  const verifyByHash = async () => {
    if (!certificateId || !fileHash) {
      alert("Please enter Certificate ID and Hash");
      return;
    }

    const cleanCertId = certificateId.trim();
    const cleanHash = fileHash.replace(/\s+/g, "").toLowerCase();
    const normalizedHash = cleanHash.startsWith("0x")
      ? cleanHash
      : "0x" + cleanHash;

    try {
      setLoading(true);
      const res = await axios.post(
        "https://final-year-project-p0gs.onrender.com/verify",
        {
          certificateId: cleanCertId,
          fileHash: normalizedHash,
        }
      );
      setData(res.data);
    } catch (err) {
      setData({
        verified: false,
        status: "ERROR",
        message: err.response?.data?.message || "Verification failed",
      });
    } finally {
      setLoading(false);
    }
  };

  /* ===============================
     VERIFY BUTTON HANDLER
  =============================== */
  const handleVerify = () => {
    if (!fileHash) {
      verifyById(certificateId);
    } else {
      verifyByHash();
    }
  };

  /* ===============================
     UI
  =============================== */
  return (
    <div style={{ padding: "20px", maxWidth: "600px", margin: "auto" }}>
      <h2>🎓 Certificate Verification</h2>

      {!isQRMode && (
        <>
          <input
            type="text"
            placeholder="Certificate ID"
            value={certificateId}
            onChange={(e) => setCertificateId(e.target.value)}
            style={{ width: "100%", padding: "8px" }}
          />
          <br /><br />

          <textarea
            placeholder="Certificate Hash (SHA-256) — optional"
            value={fileHash}
            onChange={(e) => setFileHash(e.target.value)}
            rows={4}
            style={{ width: "100%", padding: "8px" }}
          />
          <br /><br />

          <button onClick={handleVerify} style={{ padding: "10px 20px" }}>
            {loading ? "Verifying..." : "Verify Certificate"}
          </button>
        </>
      )}

      {isQRMode && loading && <p>🔍 Verifying certificate...</p>}

      <hr />

      {/* RESULTS */}
      {data && !data.verified && (
        <div style={{ color: "red" }}>
          <h3>❌ Verification Failed</h3>
          <p>{data.message || data.status}</p>
        </div>
      )}

      {data && data.verified && (
        <div style={{ color: "green" }}>
          <h3>✅ Certificate {data.status}</h3>

          <p><strong>Certificate ID:</strong> {certificateId}</p>

          {data.issuedAt && (
            <p>
              <strong>Issued At:</strong>{" "}
              {new Date(data.issuedAt * 1000).toLocaleDateString()}
            </p>
          )}

          {data.revoked && (
            <p style={{ color: "red", fontWeight: "bold" }}>
              🚫 This certificate has been revoked
            </p>
          )}

          {data.ipfsLink && (
            <p>
              <a href={data.ipfsLink} target="_blank" rel="noreferrer">
                📄 View Certificate on IPFS
              </a>
            </p>
          )}
        </div>
      )}
    </div>
  );
};

export default VerifyCertificate;

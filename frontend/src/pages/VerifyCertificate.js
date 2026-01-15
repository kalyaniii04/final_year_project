import React, { useState } from "react";
import axios from "axios";

const VerifyCertificate = () => {
  const [certificateId, setCertificateId] = useState("");
  const [fileHash, setFileHash] = useState("");
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);

  const verifyCertificate = async () => {
    if (!certificateId || !fileHash) {
      alert("Please enter Certificate ID and Hash");
      return;
    }

    try {
      setLoading(true);
      const res = await axios.post(
        "https://final-year-project-p0gs.onrender.com/verify",
        { certificateId, fileHash }
      );
      setData(res.data);
    } catch (err) {
      setData({ verified: false, status: "ERROR", message: "Verification failed" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: "20px", maxWidth: "600px", margin: "auto" }}>
      <h2>🎓 Certificate Verification</h2>

      <input
        type="text"
        placeholder="Certificate ID"
        value={certificateId}
        onChange={(e) => setCertificateId(e.target.value)}
        style={{ width: "100%", padding: "8px" }}
      />
      <br /><br />

      <textarea
        placeholder="Certificate Hash (SHA-256)"
        value={fileHash}
        onChange={(e) => setFileHash(e.target.value)}
        rows={4}
        style={{ width: "100%", padding: "8px" }}
      />
      <br /><br />

      <button onClick={verifyCertificate} style={{ padding: "10px 20px" }}>
        {loading ? "Verifying..." : "Verify Certificate"}
      </button>

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
          <p><strong>Issued At:</strong> {new Date(data.issuedAt * 1000).toLocaleDateString()}</p>
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

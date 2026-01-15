import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";

const VerifyCertificate = () => {
  const { certificateId } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStatus = async () => {
      try {
        const res = await axios.get(
          `https://final-year-project-p0gs.onrender.com/verify/${certificateId}`
        );
        setData(res.data);
      } catch (err) {
        setData({
          verified: false,
          status: "ERROR",
          message: "Server error or certificate not found",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchStatus();
  }, [certificateId]);

  if (loading) return <p>⏳ Verifying certificate...</p>;

  return (
    <div style={{ padding: "20px", textAlign: "center" }}>
      <h2>🎓 Certificate Verification</h2>

      {/* ❌ Not issued */}
      {!data.verified && (
        <div style={{ color: "red" }}>
          <h3>❌ Certificate Not Found</h3>
          <p>{data.message}</p>
        </div>
      )}

      {/* 🔴 Revoked */}
      {data.verified && data.status === "REVOKED" && (
        <div style={{ color: "red" }}>
          <h3>🚫 Certificate Revoked</h3>
          <p><strong>Certificate ID:</strong> {certificateId}</p>
          <p>
            <strong>Revoked At:</strong>{" "}
            {data.revokedAt
              ? new Date(data.revokedAt * 1000).toLocaleString()
              : "Unknown"}
          </p>
        </div>
      )}

      {/* ✅ Valid */}
      {data.verified && data.status === "VALID" && (
        <div style={{ color: "green" }}>
          <h3>✅ Certificate Valid</h3>

          <p><strong>Certificate ID:</strong> {data.certificateId}</p>
          <p><strong>Student Name:</strong> {data.studentName}</p>
          <p><strong>Course:</strong> {data.courseName}</p>
          <p><strong>Student Wallet:</strong> {data.studentWallet}</p>
          <p><strong>Issuer Wallet:</strong> {data.issuerWallet}</p>
          <p>
            <strong>Issued At:</strong>{" "}
            {new Date(data.issuedAt * 1000).toLocaleDateString()}
          </p>

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

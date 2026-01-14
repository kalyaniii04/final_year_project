import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";

const VerifyCertificate = () => {
  const { certificateId } = useParams();
  const [status, setStatus] = useState(null);

  useEffect(() => {
    const fetchStatus = async () => {
      try {
        const res = await axios.get(`https://final-year-project-0dox.onrender.com/verify/${certificateId}`);
        setStatus(res.data);
      } catch (err) {
        setStatus({ verified: false, message: "Certificate not found or server error" });
      }
    };
    fetchStatus();
  }, [certificateId]);

  if (!status) return <p>⏳ Checking certificate...</p>;

  return (
    <div style={{ padding: "20px", textAlign: "center" }}>
      <h2>🎓 Certificate Verification</h2>
      {status.verified ? (
        <div style={{ color: "green" }}>
          <h3>✅ Verified</h3>
          <p><strong>Certificate ID:</strong> {status.certificateId}</p>
          <p><strong>Student Name:</strong> {status.studentName}</p>
          <p><strong>Course:</strong> {status.course}</p>
          <p><strong>Wallet:</strong> {status.issuedTo}</p>
          <p><a href={status.ipfsLink} target="_blank">📄 View Certificate on IPFS</a></p>
        </div>
      ) : (
        <div style={{ color: "red" }}>
          <h3>❌ Not Verified</h3>
          <p>{status.message}</p>
        </div>
      )}
    </div>
  );
};

export default VerifyCertificate;

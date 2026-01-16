import React, { useEffect, useState } from "react";
import axios from "axios";
import { useParams } from "react-router-dom";

const VerifyCertificate = () => {
  const { certificateId } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios
      .get(`https://final-year-project-p0gs.onrender.com/verify/${certificateId}`)
      .then((res) => setData(res.data))
      .catch((err) =>
        setData({
          verified: false,
          status: "NOT_FOUND",
          message: "Certificate not found"
        })
      )
      .finally(() => setLoading(false));
  }, [certificateId]);

  if (loading) return <p>🔍 Verifying certificate...</p>;

  if (!data?.verified) {
    return (
      <div style={{ color: "red" }}>
        <h2>❌ Verification Failed</h2>
        <p>{data.message}</p>
      </div>
    );
  }

  return (
    <div style={{ padding: "20px", maxWidth: "500px", margin: "auto" }}>
      <h2>
        {data.status === "VALID" ? "✅ Certificate Verified" : "🚫 Certificate Revoked"}
      </h2>

      <p><strong>Status:</strong> {data.status}</p>
      <p><strong>Student Name:</strong> {data.studentName}</p>
      <p><strong>Course:</strong> {data.courseName}</p>
      <p><strong>Institute:</strong> {data.instituteName}</p>
      <p><strong>Institute ID:</strong> {data.instituteId}</p>
      <p>
        <strong>Issued On:</strong>{" "}
        {new Date(data.issuedAt * 1000).toLocaleDateString()}
      </p>
    </div>
  );
};

export default VerifyCertificate;

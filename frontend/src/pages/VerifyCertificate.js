import React, { useEffect, useState } from "react";
import axios from "axios";
import { useParams } from "react-router-dom";
import "./VerifyCertificate.css";

const VerifyCertificate = () => {
  const { certificateId } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios
      .get(`https://final-year-project-p0gs.onrender.com/verify/${certificateId}`)
      .then((res) => {
        console.log("Raw validation result:", res.data);
        setData(res.data);
      })
      .catch(() =>
        setData({
          verified: false,
          status: "NOT_FOUND",
          message: "Certificate not found",
        })
      )
      .finally(() => setLoading(false));
  }, [certificateId]);

  if (loading)
    return <p className="loading-text">🔍 Verifying certificate...</p>;

  return (
    <div className="verify-container">
      {!data?.verified ? (
        <div className="status-box failed">
          <h2>❌ Verification Failed</h2>
          <p>{data.message}</p>
        </div>
      ) : (
        <div className={`status-box ${data.status === "VALID" ? "valid" : "revoked"}`}>
          <h2>
            {data.status === "VALID"
              ? "✅ Certificate Verified"
              : "🚫 Certificate Revoked"}
          </h2>

          <div className="info">
            <p>
              <strong>Status:</strong> {data.status}
            </p>
            <p>
              <strong>Student Name:</strong> {data.studentName}
            </p>
            <p>
              <strong>Course:</strong> {data.courseName}
            </p>
            <p>
              <strong>Institute:</strong> {data.instituteName}
            </p>
            <p>
              <strong>Institute ID:</strong> {data.instituteId}
            </p>
            <p>
              <strong>Issued On:</strong>{" "}
              {new Date(data.issuedAt * 1000).toLocaleDateString()}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default VerifyCertificate;

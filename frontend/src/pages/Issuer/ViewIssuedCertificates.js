import React, { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Button,
  CircularProgress,
  Divider,
  Snackbar,
  Alert,
} from "@mui/material";
import { connectWallet } from "../../utils/connectWallet";
import { ethers } from "ethers";

/**
 * ViewIssuedCertificates Component
 * --------------------------------
 * Displays all certificates issued by the connected issuer.
 */
export default function ViewIssuedCertificates() {
  const [certificates, setCertificates] = useState([]);
  const [loading, setLoading] = useState(false);
  const [issuerAddress, setIssuerAddress] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  // -------------------- Fetch Certificates --------------------
  const fetchCertificates = async () => {
  try {
    setLoading(true);
    setErrorMsg("");

    const { contract, signer } = await connectWallet();
    const address = await signer.getAddress();
    setIssuerAddress(address);

    // ✅ STEP 1: get IDs ONLY
    const ids = await contract.getCertificateIdsByIssuer(address);

    console.log("Fetched certificate IDs:", ids);

    // Safety guard
    if (!Array.isArray(ids) || ids.length === 0) {
      setCertificates([]);
      return;
    }

    // ✅ STEP 2: fetch certificates one-by-one
    const certs = await Promise.all(
      ids.map(async (id) => {
        const cert = await contract.getCertificate(id);
        return {
          id,
          student: cert.student,
          issuer: cert.issuer,
          issuedAt: cert.issuedAt
            ? new Date(Number(cert.issuedAt) * 1000).toLocaleString()
            : "N/A",
          revoked: cert.revoked,
          revokedAt: cert.revokedAt
            ? new Date(Number(cert.revokedAt) * 1000).toLocaleString()
            : "N/A",
          instituteName: cert.instituteName,
          instituteId: cert.instituteId,
          studentName: cert.studentName,
          courseName: cert.courseName,
        };
      })
    );

    setCertificates(certs);
  } catch (error) {
    console.error("❌ Error fetching certificates:", error);
    setErrorMsg(
      error.reason ||
        error.message ||
        "Failed to load certificates. Please check the console for details."
    );
  } finally {
    setLoading(false);
  }
};


  // -------------------- On Mount --------------------
  useEffect(() => {
    fetchCertificates();
  }, []);

  // -------------------- Render --------------------
  return (
    <div style={{ padding: "40px", maxWidth: "1000px", margin: "auto" }}>
      <Typography variant="h4" gutterBottom>
        🧾 Issued Certificates
      </Typography>

      <Card>
        <CardContent>
          <Typography variant="body1" sx={{ mb: 2 }}>
            Below is a list of all certificates issued by:
            <br />
            <strong>{issuerAddress || "Connecting..."}</strong>
          </Typography>

          <Divider sx={{ my: 2 }} />

          <Button
            variant="contained"
            color="primary"
            onClick={fetchCertificates}
            sx={{ mb: 2 }}
            disabled={loading}
          >
            🔄 Refresh List
          </Button>

          {loading ? (
            <div style={{ textAlign: "center", marginTop: "20px" }}>
              <CircularProgress />
              <Typography variant="body2" sx={{ mt: 1 }}>
                Fetching certificates from blockchain...
              </Typography>
            </div>
          ) : certificates.length === 0 ? (
            <Typography>No certificates found for this issuer.</Typography>
          ) : (
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>
                    <strong>Certificate Hash</strong>
                  </TableCell>
                  <TableCell>
                    <strong>Student Name</strong>
                  </TableCell>
                  <TableCell>
                    <strong>Course</strong>
                  </TableCell>
                  <TableCell>
                    <strong>Institute</strong>
                  </TableCell>
                  <TableCell>
                    <strong>Student Address</strong>
                  </TableCell>
                  <TableCell>
                    <strong>Issued At</strong>
                  </TableCell>
                  <TableCell>
                    <strong>Status</strong>
                  </TableCell>
                </TableRow>
              </TableHead>

              <TableBody>
                {certificates.map((cert, index) => (
                  <TableRow key={index}>
                    <TableCell>
                      {cert.id ? cert.id.slice(0, 10) + "..." : "N/A"}
                    </TableCell>
                    <TableCell>{cert.studentName}</TableCell>
                    <TableCell>{cert.courseName}</TableCell>
                    <TableCell>{cert.instituteName}</TableCell>
                    <TableCell>
                      {cert.student
                        ? `${cert.student.slice(0, 6)}...${cert.student.slice(-4)}`
                        : "N/A"}
                    </TableCell>
                    <TableCell>{cert.issuedAt}</TableCell>
                    <TableCell>
                      {cert.revoked ? "❌ Revoked" : "✅ Active"}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Snackbar for errors */}
      <Snackbar
        open={!!errorMsg}
        autoHideDuration={6000}
        onClose={() => setErrorMsg("")}
      >
        <Alert severity="error" onClose={() => setErrorMsg("")}>
          {errorMsg}
        </Alert>
      </Snackbar>
    </div>
  );
}

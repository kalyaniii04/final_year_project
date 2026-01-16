import React, { useState } from "react";
import { jsPDF } from "jspdf";
import QRCode from "qrcode";
import axios from "axios";
import { ethers } from "ethers";

import CertificateRegistry from "../../CertificateRegistry.json";
import { CONTRACT_ADDRESS } from "../../contractConfig";

const FRONTEND_URL = "https://final-year-project-khvy.vercel.app";

const IssueCertificate = () => {
  const [studentName, setStudentName] = useState("");
  const [certificateId, setCertificateId] = useState("");
  const [course, setCourse] = useState("");
  const [studentAddress, setStudentAddress] = useState("");
  const [issueDate, setIssueDate] = useState("");

  const [fileHash, setFileHash] = useState("");
  const [pdfBlob, setPdfBlob] = useState(null);

  const [contract, setContract] = useState(null);
  const [account, setAccount] = useState("");
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState("");

  /* ===============================
      CONNECT WALLET
  =============================== */
  const connectWallet = async () => {
    if (!window.ethereum) {
      alert("Install MetaMask");
      return;
    }

    const provider = new ethers.BrowserProvider(window.ethereum);
    const signer = await provider.getSigner();
    const accounts = await provider.send("eth_requestAccounts", []);

    const contractInstance = new ethers.Contract(
      CONTRACT_ADDRESS,
      CertificateRegistry.abi,
      signer
    );

    setAccount(accounts[0]);
    setContract(contractInstance);

    alert("Wallet connected");
  };

  /* ===============================
      SHA-256
  =============================== */
  const computeSHA256 = async (buffer) => {
    const hashBuffer = await crypto.subtle.digest("SHA-256", buffer);
    return (
      "0x" +
      Array.from(new Uint8Array(hashBuffer))
        .map((b) => b.toString(16).padStart(2, "0"))
        .join("")
    );
  };

  /* ===============================
      GENERATE PDF
  =============================== */
  const generatePDF = async () => {
    if (!studentName || !certificateId || !course || !studentAddress || !issueDate) {
      alert("Fill all fields");
      return;
    }

    const pdf = new jsPDF("p", "pt", "a4");
    const width = pdf.internal.pageSize.getWidth();
    const height = pdf.internal.pageSize.getHeight();

    // Border
    pdf.setLineWidth(2);
    pdf.rect(40, 40, width - 80, height - 80);

    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(28);
    pdf.text("CERTIFICATE OF COMPLETION", width / 2, 120, { align: "center" });

    pdf.setFontSize(24);
    pdf.setFont("times", "bolditalic");
    pdf.text(studentName, width / 2, 210, { align: "center" });

    pdf.setFont("helvetica", "normal");
    pdf.setFontSize(16);
    pdf.text("has successfully completed the course", width / 2, 250, {
      align: "center",
    });

    pdf.setFont("times", "italic");
    pdf.setFontSize(20);
    pdf.text(`"${course}"`, width / 2, 280, { align: "center" });

    pdf.setFontSize(12);
    pdf.text(`Certificate ID: ${certificateId}`, 80, 340);
    pdf.text(`Issued On: ${issueDate}`, 80, 360);
    pdf.text("Wallet Address:", 80, 380);
    pdf.text(studentAddress, 80, 400, { maxWidth: width - 160 });

    // QR
    const verifyURL = `${FRONTEND_URL}/verify/${certificateId}`;
    const qr = await QRCode.toDataURL(verifyURL);
    pdf.addImage(qr, "PNG", width / 2 - 70, height - 250, 140, 140);

    // Hash
    const blob = pdf.output("blob");
    const buffer = await blob.arrayBuffer();
    const hash = await computeSHA256(buffer);

    pdf.setFont("courier", "normal");
    pdf.setFontSize(10);
    pdf.text("Certificate Hash (SHA-256):", 80, height - 100);
    pdf.text(hash, 80, height - 80, { maxWidth: width - 160 });

    const finalBlob = pdf.output("blob");

    setPdfBlob(finalBlob);
    setFileHash(hash);

    alert("PDF Generated");
  };

  /* ===============================
      UPLOAD IPFS + BLOCKCHAIN
  =============================== */
  const uploadToBlockchain = async () => {
    if (!contract || !pdfBlob) {
      alert("Connect wallet & generate PDF");
      return;
    }

    try {
      setLoading(true);
      setStatus("Uploading...");

      const file = new File([pdfBlob], `${certificateId}.pdf`);
      const formData = new FormData();
      formData.append("file", file);

      const ipfsRes = await axios.post(
        "https://api.pinata.cloud/pinning/pinFileToIPFS",
        formData,
        {
          headers: {
            pinata_api_key: process.env.REACT_APP_PINATA_API_KEY,
            pinata_secret_api_key: process.env.REACT_APP_PINATA_SECRET_API_KEY,
          },
        }
      );

      const ipfsHash = `ipfs://${ipfsRes.data.IpfsHash}`;

      const tx = await contract.issueCertificate(
        ethers.id(certificateId.trim()),
        studentAddress,
        fileHash,
        ipfsHash,
        studentName,
        course
      );

      await tx.wait();
      setStatus("✅ Certificate stored on blockchain");
    } catch (err) {
      console.error(err);
      setStatus("❌ Error: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  /* ===============================
      UI
  =============================== */
  return (
    <div style={{ maxWidth: 600, margin: "auto", padding: 20 }}>
      <h2>🎓 Issue Certificate</h2>

      <button onClick={connectWallet}>🔗 Connect Wallet</button>
      {account && <p>{account}</p>}

      <br/>
      <hr />
      <br />
      <br/>
      <input placeholder="Student Name" onChange={(e) => setStudentName(e.target.value)} />
      <br />
      <br />
      <input placeholder="Certificate ID" onChange={(e) => setCertificateId(e.target.value)} />
      <br />
      <br />
      <input placeholder="Student Wallet" onChange={(e) => setStudentAddress(e.target.value)} />
      <br />
      <br />
      <input placeholder="Course Name" onChange={(e) => setCourse(e.target.value)} />
      <br />
      <br />
      <input type="date" onChange={(e) => setIssueDate(e.target.value)} />
      <br />
      <br />
      

      <button onClick={generatePDF}>📄 Generate Certificate</button>
      <br />
      <br />

      {pdfBlob && (
        <>
          <p><strong>Hash:</strong> {fileHash}</p>
          <button
            onClick={() => {
              const url = URL.createObjectURL(pdfBlob);
              const a = document.createElement("a");
              a.href = url;
              a.download = `${certificateId}.pdf`;
              a.click();
              URL.revokeObjectURL(url);
            }}
          >
            ⬇️ Download Certificate
          </button>
        </>
      )}

      <br />
      <br />
      
      <button disabled={loading} onClick={uploadToBlockchain}>
        🚀 Upload to Blockchain
      </button>

      <p>{status}</p>
    </div>
  );
};

export default IssueCertificate;

import React, { useState } from "react";
import { jsPDF } from "jspdf";
import QRCode from "qrcode";
import axios from "axios";
import { ethers } from "ethers";
import CertificateRegistry from "../../CertificateRegistry.json"; // ✅ ABI file
import { CONTRACT_ADDRESS } from "../../contractConfig"; // ✅ Contract address

const IssueCertificate = () => {
  const [studentName, setStudentName] = useState("");
  const [certificateId, setCertificateId] = useState("");
  const [course, setCourse] = useState("");
  const [studentAddress, setStudentAddress] = useState("");
  const [issueDate, setIssueDate] = useState("");
  const [fileHash, setFileHash] = useState("");
  const [pdfBlob, setPdfBlob] = useState(null);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState("");
  const [account, setAccount] = useState("");
  const [contract, setContract] = useState(null);

  // ==============================
  // 🔗 Connect Wallet
  // ==============================
  const connectWallet = async () => {
    if (!window.ethereum) {
      alert("Please install MetaMask first!");
      return;
    }

    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const accounts = await provider.send("eth_requestAccounts", []);
      const connectedAccount = accounts[0];

      // Log network info
      const network = await provider.getNetwork();
      console.log("✅ Connected to network:", network.name, "Chain ID:", network.chainId);

      // Debug ABI contents
      console.log("✅ Contract ABI Functions:");
      console.log(CertificateRegistry.abi.map((f) => f.name));

      // Create contract instance
      const contractInstance = new ethers.Contract(
        CONTRACT_ADDRESS,
        CertificateRegistry.abi,
        signer
      );

      console.log("✅ Contract Address:", CONTRACT_ADDRESS);
      console.log("✅ Contract Instance Methods:");
      console.log(contractInstance.interface.fragments.map((f) => f.name));

      setAccount(connectedAccount);
      setContract(contractInstance);
      alert("✅ Wallet connected: " + connectedAccount);
    } catch (err) {
      console.error("❌ Wallet connection failed:", err);
      alert("❌ Wallet connection failed: " + err.message);
    }
  };

  // ==============================
  // 🔐 SHA-256 Hash Helper
  // ==============================
  async function computeSHA256(buffer) {
    const hashBuffer = await crypto.subtle.digest("SHA-256", buffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
  }

  // ==============================
  // 🧾 Generate PDF + Compute Hash
  // ==============================
  const generatePDF = async () => {
    if (!studentName || !certificateId || !course || !studentAddress || !issueDate) {
      alert("🚨 Please fill all fields!");
      return;
    }

    const pdf = new jsPDF({ unit: "pt", format: "a4" });
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();

    pdf.setLineWidth(2);
    pdf.rect(40, 40, pageWidth - 80, pageHeight - 80);

    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(28);
    pdf.text("CERTIFICATE OF COMPLETION", pageWidth / 2, 120, { align: "center" });

    pdf.setFontSize(24);
    pdf.setFont("times", "bolditalic");
    pdf.text(studentName, pageWidth / 2, 210, { align: "center" });

    pdf.setFont("helvetica", "normal");
    pdf.setFontSize(16);
    pdf.text("has successfully completed the course", pageWidth / 2, 250, { align: "center" });

    pdf.setFont("times", "italic");
    pdf.setFontSize(20);
    pdf.text(`"${course}"`, pageWidth / 2, 280, { align: "center" });

    pdf.setFontSize(12);
    pdf.text(`Certificate ID: ${certificateId}`, 80, 340);
    pdf.text(`Issued On: ${issueDate}`, 80, 360);
    pdf.text(`Wallet Address:`, 80, 380);
    pdf.text(`${studentAddress}`, 80, 400, { maxWidth: pageWidth - 160 });

    const verifyURL = `https://final-year-project-p0gs.onrender.com/verify`;
    const qrCodeDataURL = await QRCode.toDataURL(verifyURL);
    pdf.addImage(qrCodeDataURL, "PNG", pageWidth / 2 - 70, pageHeight - 250, 140, 140);

    // Step 1: Compute Hash
    const blobPDF = pdf.output("blob");
    const arrayBuffer = await blobPDF.arrayBuffer();
    const hash = await computeSHA256(arrayBuffer);

    // Step 2: Print hash on PDF
    pdf.setFont("courier", "normal");
    pdf.setFontSize(10);
    pdf.text(`Certificate Hash (SHA-256):`, 80, pageHeight - 100);
    pdf.text(`${hash}`, 80, pageHeight - 80, { maxWidth: pageWidth - 160 });

    const finalBlob = pdf.output("blob");

    setFileHash(hash);
    setPdfBlob(finalBlob);

    console.log("✅ Generated Certificate Hash:", hash);
    alert("✅ PDF Created, Hash Generated & Printed on Certificate!");
  };

  // ==============================
  // 🚀 Upload to IPFS + Blockchain
  // ==============================
  const uploadToBlockchain = async () => {
    if (!pdfBlob) {
      alert("Please generate the certificate first!");
      return;
    }
    if (!contract || !account) {
      alert("Please connect your wallet first!");
      return;
    }

    try {
      setLoading(true);
      setStatus("⏳ Uploading to IPFS and Blockchain...");

      const file = new File([pdfBlob], `${certificateId}.pdf`, { type: "application/pdf" });
      const formData = new FormData();
      formData.append("file", file);

      // ✅ Upload to Pinata
      console.log("📤 Uploading file to Pinata...");
      const resFile = await axios.post(
        "https://api.pinata.cloud/pinning/pinFileToIPFS",
        formData,
        {
          headers: {
            pinata_api_key: process.env.REACT_APP_PINATA_API_KEY,
            pinata_secret_api_key: process.env.REACT_APP_PINATA_SECRET_API_KEY,
            "Content-Type": "multipart/form-data",
          },
        }
      );

      const ipfsHash = `ipfs://${resFile.data.IpfsHash}`;
      console.log("✅ Uploaded to IPFS:", ipfsHash);

      // ✅ Prepare blockchain arguments
      const certIdBytes = ethers.id(certificateId);
      const fileHashBytes = "0x" + fileHash;

      console.log("📊 Transaction Arguments:");
      console.log({
        certIdBytes,
        studentAddress,
        fileHashBytes,
        studentName,
        course,
      });

      console.log("📡 Calling contract.issueCertificate...");

      const tx = await contract.issueCertificate(
  certIdBytes,
  studentAddress,
  fileHashBytes,
  ipfsHash,           // ✅ PASS IT
  studentName,
  course
);


      console.log("⏳ Waiting for transaction confirmation...");
      await tx.wait();

      setStatus(`✅ Certificate stored on Blockchain! Tx Hash: ${tx.hash}`);
      console.log("🎉 Certificate successfully stored! Tx:", tx.hash);
      alert("🎉 Certificate successfully uploaded!");
    } catch (err) {
      console.error("❌ Upload failed:", err);
      setStatus("❌ Upload failed: " + (err.reason || err.message));
      alert("❌ Upload failed: " + (err.reason || err.message));
    } finally {
      setLoading(false);
    }
  };

  // ==============================
  // 🧱 UI
  // ==============================
  return (
    <div style={{ padding: "20px", maxWidth: "600px", margin: "auto" }}>
      <h2>🎓 Issue & Upload Certificate (Debug Build)</h2>

      <button onClick={connectWallet}>🔗 Connect Wallet</button>
      {account && <p><strong>Connected Account:</strong> {account}</p>}

      <hr />

      <input type="text" placeholder="Student Name" value={studentName} onChange={(e) => setStudentName(e.target.value)} /><br /><br />
      <input type="text" placeholder="Certificate ID" value={certificateId} onChange={(e) => setCertificateId(e.target.value)} /><br /><br />
      <input type="text" placeholder="Student Wallet Address" value={studentAddress} onChange={(e) => setStudentAddress(e.target.value)} /><br /><br />
      <input type="text" placeholder="Course Name" value={course} onChange={(e) => setCourse(e.target.value)} /><br /><br />
      <input type="date" value={issueDate} onChange={(e) => setIssueDate(e.target.value)} /><br /><br />

      <button onClick={generatePDF}>📄 Generate Certificate</button><br /><br />

      {fileHash && (
        <p><strong>SHA-256 Hash:</strong><br /><code>{fileHash}</code></p>
      )}

      {pdfBlob && (
        <button
          onClick={() => {
            const url = URL.createObjectURL(pdfBlob);
            const link = document.createElement("a");
            link.href = url;
            link.download = `${certificateId}.pdf`;
            link.click();
            URL.revokeObjectURL(url);
          }}
        >
          ⬇️ Download PDF
        </button>
      )}
      <br /><br />

      <button disabled={!pdfBlob || loading} onClick={uploadToBlockchain}>
        {loading ? "Uploading..." : "🚀 Upload to IPFS & Blockchain"}
      </button>

      {status && (
        <p style={{ marginTop: "20px", color: status.includes("✅") ? "green" : "red" }}>
          {status}
        </p>
      )}
    </div>
  );
};

export default IssueCertificate;

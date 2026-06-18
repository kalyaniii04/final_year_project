import { useState } from "react";
import { ethers } from "ethers";
import CertificateRegistry from "../CertificateRegistry.json";
import "./Student.css";

const CONTRACT_ADDRESS = "0x156dEED6F5774bD9fcF611582Cb50b4c110C5134";
const IPFS_GATEWAY = "https://gateway.pinata.cloud/ipfs/";

export default function Student() {
  const [wallet, setWallet] = useState("");
  const [certs, setCerts] = useState([]);
  const [loading, setLoading] = useState(false);

  const connectWallet = async () => {
    const provider = new ethers.BrowserProvider(window.ethereum);
    const signer = await provider.getSigner();
    const address = await signer.getAddress();
    setWallet(address);
    fetchCertificates(address);
  };

  const fetchCertificates = async (student) => {
    setLoading(true);
    const provider = new ethers.BrowserProvider(window.ethereum);
    const signer = await provider.getSigner();

    const contract = new ethers.Contract(
      CONTRACT_ADDRESS,
      CertificateRegistry.abi,
      signer
    );

    const ids = await contract.getCertificateIdsByStudent(student);

    const data = await Promise.all(
      ids.map(async (id) => {
        const c = await contract.getCertificate(id);
        return {
          id,
          studentName: c.studentName,
          courseName: c.courseName,
          instituteName: c.instituteName,
          issuedAt: new Date(Number(c.issuedAt) * 1000).toLocaleDateString(),
          revoked: c.revoked,
          ipfsHash: c.ipfsHash,
        };
      })
    );

    setCerts(data);
    setLoading(false);
  };

  const downloadPDF = (ipfsHash) => {
    const cid = ipfsHash.replace("ipfs://", "");
    window.open(IPFS_GATEWAY + cid, "_blank");
  };

  return (
    <div className="student-page">
      <div className="student-wrapper">
        <h1 className="student-title">🎓 My Certificates</h1>
        <p className="student-subtitle">
          View and download your blockchain-verified certificates
        </p>

        {!wallet ? (
          <button className="primary-btn" onClick={connectWallet}>
            🔗 Connect Wallet
          </button>
        ) : loading ? (
          <p className="loading-text">⏳ Loading certificates...</p>
        ) : (
          <div className="table-wrapper">
            <table className="cert-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Student</th>
                  <th>Course</th>
                  <th>Institute</th>
                  <th>Issued</th>
                  <th>Status</th>
                  <th>PDF</th>
                </tr>
              </thead>
              <tbody>
                {certs.map((c, i) => (
                  <tr key={i}>
                    <td>{c.id.slice(0, 8)}...</td>
                    <td>{c.studentName}</td>
                    <td>{c.courseName}</td>
                    <td>{c.instituteName}</td>
                    <td>{c.issuedAt}</td>
                    <td className={c.revoked ? "revoked" : "valid"}>
                      {c.revoked ? "❌ Revoked" : "✅ Valid"}
                    </td>
                    <td>
                      <button
                        className="secondary-btn"
                        onClick={() => downloadPDF(c.ipfsHash)}
                      >
                        ⬇ Download
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

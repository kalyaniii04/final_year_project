import { Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import IssuerLogin from "./pages/Issuer/IssuerLogin";
import IssuerSignup from "./pages/Issuer/Signup";
import IssuerDashboard from "./pages/Issuer/IssuerDashboard";
import RegisterInstitute from "./pages/Issuer/RegisterInstitute";
import IssueCertificate from "./pages/Issuer/IssueCertificate";
import RevokeCertificate from "./pages/Issuer/RevokeCertificate";
import VerifyCertificate from "./pages/Verifier";
import VerifyCertificateQR from "./pages/VerifyCertificate";
import ViewIssuedCertificates from "./pages/Issuer/ViewIssuedCertificates";
import Student from "./pages/Student";

function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/issuer-signup" element={<IssuerSignup/>}/>
      <Route path="/issuer-login" element={<IssuerLogin />} />
      <Route path="/issuer-dashboard" element={<IssuerDashboard />} />
      <Route path="/register-institute" element={<RegisterInstitute />} />
      <Route path="/issue-certificate" element={<IssueCertificate />} />
      <Route path="/revoke-certificate" element={<RevokeCertificate />} />
      <Route path="/verify-certificate" element={<VerifyCertificate />} />
      <Route path="/issued-certificates" element={<ViewIssuedCertificates />} />
      <Route path="/verify/:certificateId" element={<VerifyCertificateQR/>} />
      <Route path="/student-page" element={<Student />} />
    </Routes>
  );
}

export default App;

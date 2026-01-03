import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import IssuerLogin from "./pages/Issuer/IssuerLogin";
import IssuerDashboard from "./pages/Issuer/IssuerDashboard";
import RegisterInstitute from "./pages/Issuer/RegisterInstitute";
import IssueCertificate from "./pages/Issuer/IssueCertificate";
import RevokeCertificate from "./pages/Issuer/RevokeCertificate";
import VerifyCertificate from "./pages/Verifier";
import ViewIssuedCertificates from "./pages/Issuer/ViewIssuedCertificates";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/issuer-login" element={<IssuerLogin />} />
        <Route path="/issuer-dashboard" element={<IssuerDashboard />} />
        <Route path="/register-institute" element={<RegisterInstitute />} />
        <Route path="/issue-certificate" element={<IssueCertificate />} />
        <Route path="/revoke-certificate" element={<RevokeCertificate />} />
        <Route path="/verify-certificate" element={<VerifyCertificate />} />
        <Route path="/issued-certificates" element={ <ViewIssuedCertificates/> } />
      </Routes>
    </Router>
  );
}

export default App;

const express = require("express");
const router = express.Router();

const authIssuer = require("../middleware/authIssure");
const {
  issueCertificate,
  getIssuedCertificates,
} = require("../controller/certificateController");

router.post("/issue", authIssuer, issueCertificate);
router.get("/issued", authIssuer, getIssuedCertificates);

module.exports = router;

import express from "express";

import authIssuer from "../middleware/authIssure.js";
import {
  issueCertificate,
  getIssuedCertificates,
} from "../controller/certificateController.js";

const router = express.Router();

router.post("/issue", authIssuer, issueCertificate);
router.get("/issued", authIssuer, getIssuedCertificates);

export default router;

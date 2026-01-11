const issuedCertificates = []; // TEMP in-memory store

exports.issueCertificate = async (req, res) => {
  try {
    const { studentName, course } = req.body;

    if (!studentName || !course) {
      return res.status(400).json({ message: "Missing fields" });
    }

    const cert = {
      id: Date.now(),
      studentName,
      course,
      issuer: req.issuer.wallet,
    };

    issuedCertificates.push(cert);

    res.status(200).json({
      success: true,
      message: "Certificate issued",
      cert,
    });
  } catch (err) {
    res.status(500).json({ message: "Issue failed" });
  }
};

exports.getIssuedCertificates = async (req, res) => {
  try {
    const issuer = req.issuer.wallet;

    const myCerts = issuedCertificates.filter(
      (c) => c.issuer === issuer
    );

    res.status(200).json(myCerts);
  } catch (err) {
    res.status(500).json({ message: "Fetch failed" });
  }
};

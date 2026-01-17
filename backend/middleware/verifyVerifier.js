import jwt from "jsonwebtoken";

const verifyVerifier = (req, res, next) => {
  const auth = req.headers.authorization;
  if (!auth) return res.status(401).json({ message: "Unauthorized" });

  try {
    const token = auth.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.verifier = decoded.walletAddress;
    next();
  } catch {
    res.status(401).json({ message: "Invalid token" });
  }
};

export default verifyVerifier;

const jwt = require("jsonwebtoken");

module.exports = function authIssuer(req, res, next) {
  try {
    // 1️⃣ Read Authorization header
    const authHeader = req.headers.authorization;

    // 2️⃣ Header missing
    if (!authHeader) {
      return res.status(401).json({
        success: false,
        message: "Authorization header missing",
      });
    }

    // 3️⃣ Must start with Bearer
    if (!authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        success: false,
        message: "Invalid authorization format",
      });
    }

    // 4️⃣ Extract token
    const token = authHeader.split(" ")[1];

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Token missing",
      });
    }

    // 5️⃣ Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // 6️⃣ Attach issuer info to request
    req.issuer = {
      walletAddress: decoded.walletAddress,
      email: decoded.email,
      role: decoded.role,
    };

    // 7️⃣ Allow request to continue
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: "Token invalid or expired",
    });
  }
};

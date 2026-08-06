const jwt = require("jsonwebtoken");

const JWT_SECRET = process.env.JWT_SECRET || "bc_eval_jwt_secret_2026_benedicto_college";

/**
 * Middleware — verifies the Bearer JWT in the Authorization header.
 * Attaches decoded payload to req.user on success.
 */
function verifyToken(req, res, next) {
  const authHeader = req.headers["authorization"];

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ success: false, message: "Access denied. No token provided." });
  }

  const token = authHeader.slice(7); // strip "Bearer "

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    return next();
  } catch (err) {
    if (err.name === "TokenExpiredError") {
      return res.status(401).json({ success: false, message: "Token expired. Please log in again." });
    }
    return res.status(401).json({ success: false, message: "Invalid token." });
  }
}

/**
 * Role-based guard factory.
 * Usage: requireRole("admin")  or  requireRole("admin", "faculty")
 */
function requireRole(...roles) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ success: false, message: "Not authenticated." });
    }
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ success: false, message: "Forbidden. Insufficient permissions." });
    }
    return next();
  };
}

module.exports = { verifyToken, requireRole };

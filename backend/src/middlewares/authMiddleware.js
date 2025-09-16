// backend/src/middlewares/authMiddleware.js
const jwt = require("jsonwebtoken");
require("dotenv").config();

const JWT_SECRET = process.env.JWT_SECRET || "dev_jwt_secret_change_me";
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || "7d";

function generateToken(payload) {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
}

async function verifyTokenMiddleware(req, res, next) {
  try {
    // Accept token in Authorization header "Bearer <token>" or in cookie `token`
    const authHeader = req.headers.authorization || req.headers.Authorization;
    let token = null;
    if (authHeader && authHeader.startsWith("Bearer ")) {
      token = authHeader.split(" ")[1];
    } else if (req.cookies && req.cookies.token) {
      token = req.cookies.token;
    }

    if (!token) {
      return res.status(401).json({ message: "Unauthorized: token missing" });
    }

    const decoded = jwt.verify(token, JWT_SECRET);
    // attach small user info
    req.user = {
      id: decoded.id,
      phone: decoded.phone,
      email: decoded.email,
      role: decoded.role,
    };
    next();
  } catch (err) {
    console.error("verifyTokenMiddleware:", err.message || err);
    return res.status(401).json({ message: "Unauthorized: invalid token" });
  }
}

module.exports = {
  generateToken,
  verifyTokenMiddleware,
};

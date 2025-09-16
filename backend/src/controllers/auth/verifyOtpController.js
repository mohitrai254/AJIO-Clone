// backend/src/controllers/auth/verifyOtpController.js
const { verifyOtp } = require("../../services/authService");
const { generateToken } = require("../../middlewares/authMiddleware");

const verifyOtpController = async (req, res, next) => {
  try {
    const { phone, otp } = req.body;

    // Keep your existing logic in authService.verifyOtp
    // which should validate OTP and return the user object (or throw)
    const result = await verifyOtp(phone, otp);

    // result could be: { user: userDoc, ... } or userDoc directly depending on your service.
    // We'll attempt to normalize:
    const userDoc = result && result.user ? result.user : result;

    // If no user found, return 401 (preserve existing behavior if your service already handles it)
    if (!userDoc) {
      return res.status(401).json({ message: "Invalid OTP or user not found" });
    }

    // Build token payload (keep it small)
    const tokenPayload = {
      id: userDoc._id || userDoc.id,
      phone: userDoc.phone,
      email: userDoc.email,
      role: userDoc.role || "user",
    };

    const token = generateToken(tokenPayload);

    // Return original result and token so frontend can keep using existing response fields
    return res.json({
      ...(result && typeof result === "object" ? result : {}),
      token,
      user: userDoc,
    });
  } catch (err) {
    if (err.status) {
      return res.status(err.status).json({ message: err.message });
    }
    next(err);
  }
};

module.exports = verifyOtpController;

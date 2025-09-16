// src/routes/authRoutes.js
const express = require("express");
const registerController = require("../controllers/auth/registerController");
const loginController = require("../controllers/auth/loginController");
const verifyOtpController = require("../controllers/auth/verifyOtpController");

const router = express.Router();

// Small helper to forward async errors to Express error middleware
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

router.post(
  "/register",
  /* registerValidator, */ asyncHandler(registerController)
);
router.post("/login", /* loginValidator, */ asyncHandler(loginController));
router.post(
  "/verify-otp",
  /* verifyOtpValidator, */ asyncHandler(verifyOtpController)
);

module.exports = router;

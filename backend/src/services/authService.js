const User = require("../models/User");

function generateOtp(expiryMinutes = 5) {
  const otp = String(Math.floor(1000 + Math.random() * 9000));
  const expiry = new Date(Date.now() + expiryMinutes * 60 * 1000);
  return { otp, expiry };
}

async function loginWithPhone(phone) {
  if (!phone) {
    throw { status: 400, message: "Phone required" };
  }

  const user = await User.findOne({ phone });
  if (!user) {
    return { exists: false, phone, message: "User not found" };
  }

  const { otp, expiry } = generateOtp(2);
  user.otp = otp;
  user.otpExpires = expiry;
  await user.save();

  return {
    exists: true,
    phone,
    message: "OTP sent",
    otp, // ⚠️ for testing
  };
}

async function registerUser({ name, phone, email, role, inviteCode, gender }) {
  if (!phone) {
    throw { status: 400, message: "Phone is required" };
  }

  let user = await User.findOne({ phone });
  const { otp, expiry } = generateOtp(2);

  if (user) {
    user.otp = otp;
    user.otpExpires = expiry;
    await user.save();

    return {
      status: 200,
      message: "User already exists. OTP sent for login.",
      phone,
    };
  }

  user = await User.create({
    name,
    phone,
    email,
    role,
    inviteCode,
    gender,
    otp,
    otpExpires: expiry,
  });

  return {
    status: 201,
    message: "User registered. OTP sent.",
    user,
  };
}

async function sendOtp(phone) {
  if (!phone) {
    throw { status: 400, message: "Phone required" };
  }

  let user = await User.findOne({ phone });
  const { otp, expiry } = generateOtp(5);

  if (!user) {
    user = await User.create({ phone, otp, otpExpires: expiry });
  } else {
    user.otp = otp;
    user.otpExpires = expiry;
    await user.save();
  }

  return {
    message: "OTP sent successfully",
    phone,
    otp, // ⚠️ for testing
  };
}

// 🔹 Verify OTP
const MAX_OTP_ATTEMPTS = 3;
const LOCK_DURATION_HOURS = 2;

async function verifyOtp(phone, otp) {
  if (!phone || !otp) {
    throw { status: 400, message: "Phone & OTP required" };
  }

  const user = await User.findOne({ phone });
  if (!user) throw { status: 404, message: "User not found" };

  // Account locked?
  if (user.otpLockedUntil && user.otpLockedUntil > new Date()) {
    const remainingMinutes = Math.ceil(
      (user.otpLockedUntil - new Date()) / 60000
    );
    throw {
      status: 403,
      message: `Account locked due to 3 failed OTP attempts. Try again in ${remainingMinutes} minutes`,
    };
  }

  const incomingOtp = String(otp).trim();
  const storedOtp = String(user.otp || "").trim();

  // Wrong OTP
  if (incomingOtp !== storedOtp) {
    user.otpAttempts = (user.otpAttempts || 0) + 1;

    if (user.otpAttempts >= MAX_OTP_ATTEMPTS) {
      user.otpLockedUntil = new Date(
        Date.now() + LOCK_DURATION_HOURS * 60 * 60 * 1000
      );
      user.otpAttempts = 0;
      await user.save();
      throw {
        status: 403,
        message: `Account locked due to 3 failed OTP attempts. Try again after 2 hours`,
      };
    }

    await user.save();
    throw {
      status: 400,
      message: `Invalid OTP. ${
        MAX_OTP_ATTEMPTS - user.otpAttempts
      } attempts left`,
    };
  }

  // Expired OTP
  if (user.otpExpires && user.otpExpires < new Date()) {
    throw { status: 400, message: "OTP expired" };
  }

  // Success → clear OTP
  user.otp = null;
  user.otpExpires = null;
  user.otpAttempts = 0;
  user.otpLockedUntil = null;
  await user.save();

  return { message: "Login successful", user };
}

module.exports = {
  loginWithPhone,
  registerUser,
  sendOtp,
  verifyOtp,
};

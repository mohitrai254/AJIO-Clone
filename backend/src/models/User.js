// models/User.js
const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  phone: { type: String, required: true, unique: true },
  name: { type: String },
  email: { type: String },
  // role: { type: String },
  inviteCode: { type: String },
  gender: { type: String },
  otp: { type: String },
  otpExpires: { type: Date },
  otpAttempts: { type: Number, default: 0 },
  otpLockedUntil: { type: Date, default: null },
});

module.exports = mongoose.model("User", userSchema);

import api from "./api";

// Login (OTP generation)
export const loginUser = (payload) => api.post("/auth/login", payload);

// Register user
export const registerUser = (payload) => api.post("/auth/register", payload);

// Verify OTP
export const verifyOtp = (payload) => api.post("/auth/verify-otp", payload);

// Resend OTP (reuses login endpoint)
export const resendOtp = (payload) => api.post("/auth/login", payload);

// src/pages/RegisterPage.jsx
import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { registerUser } from "../api/authApi";

function RegisterPage() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    gender: "",
    role: "",
    inviteCode: "",
    agree: false,
  });
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const { state } = useLocation();
  const phone = state?.phone;

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const validateEmail = (email) => {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
  };

  const validateName = (name) => {
    const regex = /^[A-Za-z\s]+$/;
    return regex.test(name);
  };

  const handleSubmit = async () => {
    // Ensure phone is present (came from login)
    if (!phone) {
      setError("Phone number missing. Please go back and enter your phone.");
      return;
    }

    if (!form.name || !form.email || !form.gender || !form.agree) {
      setError("Please fill all required fields and agree to terms");
      return;
    }

    if (!validateName(form.name)) {
      setError("Please enter a valid name (letters and spaces only)");
      return;
    }

    if (!validateEmail(form.email)) {
      setError("Please enter a valid email address");
      return;
    }

    try {
      setError("");
      await registerUser({ ...form, phone });
      navigate("/otp", { state: { phone } });
    } catch (err) {
      console.error("Registration error:", err.response?.data || err.message);
      setError(
        err.response?.data?.message || "Registration failed. Please try again."
      );
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <div className="relative w-full max-w-sm min-h-[560px] bg-white border border-gray-200 rounded-sm shadow-lg p-8 flex flex-col">
        <button
          type="button"
          onClick={() => navigate("/")}
          className="absolute top-4 right-4 text-gray-500 hover:text-black text-lg"
        >
          ✕
        </button>

        <button
          onClick={() => navigate("/login")}
          className="text-sm text-gray-600 mb-4 flex items-center hover:underline"
        >
          ← Back
        </button>

        <h2 className="text-lg font-medium text-gray-800 mb-1">
          Welcome to AJIO
        </h2>
        <p className="text-sm text-gray-600 mb-6">Please set up your account</p>

        <div className="flex items-center justify-between mb-1">
          <span className="text-base font-medium">{phone || "—"}</span>
          <button
            onClick={() => navigate("/")}
            className="text-sm text-blue-600 hover:underline"
          >
            Edit
          </button>
        </div>
        <p className="text-xs text-gray-500 mb-4">
          OTP will be sent to your number for verification.
        </p>

        {/* Gender */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Gender:
          </label>
          <div className="flex items-center space-x-6">
            <label className="flex items-center">
              <input
                type="radio"
                name="gender"
                value="male"
                checked={form.gender === "male"}
                onChange={handleChange}
                className="mr-2"
              />
              Male
            </label>
            <label className="flex items-center">
              <input
                type="radio"
                name="gender"
                value="female"
                checked={form.gender === "female"}
                onChange={handleChange}
                className="mr-2"
              />
              Female
            </label>
          </div>
        </div>

        {/* Role
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Role:
          </label>
          <div className="flex items-center space-x-6">
            <label className="flex items-center">
              <input
                type="radio"
                name="role"
                value="customer"
                checked={form.role === "customer"}
                onChange={handleChange}
                className="mr-2"
              />
              Customer
            </label>
            <label className="flex items-center">
              <input
                type="radio"
                name="role"
                value="vendor"
                checked={form.role === "vendor"}
                onChange={handleChange}
                className="mr-2"
              />
              Vendor
            </label>
            <label className="flex items-center">
              <input
                type="radio"
                name="role"
                value="admin"
                checked={form.role === "admin"}
                onChange={handleChange}
                className="mr-2"
              />
              Admin
            </label>
          </div>
        </div> */}

        {/* Name */}
        <div className="mb-4">
          <input
            type="text"
            name="name"
            value={form.name}
            onChange={handleChange}
            placeholder="Name"
            className="w-full border-b py-2 text-gray-900 focus:outline-none border-gray-300 focus:border-gray-600"
          />
        </div>

        {/* Email */}
        <div className="mb-4">
          <input
            type="email"
            name="email"
            value={form.email}
            onChange={handleChange}
            placeholder="Email"
            className="w-full border-b py-2 text-gray-900 focus:outline-none border-gray-300 focus:border-gray-600"
          />
        </div>

        {/* Invite code */}
        <div className="mb-4">
          <input
            type="text"
            name="inviteCode"
            value={form.inviteCode}
            onChange={handleChange}
            placeholder="Invite code (optional)"
            className="w-full border-b py-2 text-gray-900 focus:outline-none border-gray-300 focus:border-gray-600"
          />
        </div>

        {/* Terms */}
        <div className="flex items-start mb-6">
          <input
            type="checkbox"
            name="agree"
            checked={form.agree}
            onChange={handleChange}
            className="mr-2 mt-1"
          />
          <span className="text-xs text-gray-600">
            By Signing Up, I agree to{" "}
            <a href="#" className="text-blue-600 hover:underline">
              Terms and Conditions
            </a>
            .
          </span>
        </div>

        {/* Error */}
        {error && (
          <p className="text-red-500 text-xs mb-4 text-center">{error}</p>
        )}

        {/* Button */}
        <button
          onClick={handleSubmit}
          className="w-full bg-yellow-700 text-white py-2 text-sm font-medium tracking-wide hover:bg-yellow-800 transition"
        >
          SEND OTP
        </button>
      </div>
    </div>
  );
}

export default RegisterPage;

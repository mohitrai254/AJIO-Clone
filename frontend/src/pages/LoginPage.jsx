// frontend/src/pages/LoginPage.jsx
import { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { loginUser } from "../api/authApi";

function LoginPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const inputRef = useRef(null);

  const [phone, setPhone] = useState(location.state?.phone || "");
  const [error, setError] = useState("");

  // forward 'from' if present
  const fromState = location.state?.from || null;

  useEffect(() => {
    if (location.state?.phone) {
      setPhone(location.state.phone);
    }
  }, [location.state]);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const validatePhone = (num) => {
    if (!/^\d{10}$/.test(num)) {
      return "Number must be exactly 10 digits";
    }
    if (!/^[6-9]/.test(num)) {
      return "Number must start with 9, 8, 7, or 6";
    }
    return "";
  };

  const handleSubmit = async () => {
    const validationError = validatePhone(phone);
    if (validationError) {
      setError(validationError);
      return;
    }
    setError("");

    try {
      const res = await loginUser({ phone });
      if (res.data.exists) {
        navigate("/otp", { state: { phone, from: fromState } });
      } else {
        navigate("/register", { state: { phone, from: fromState } });
      }
    } catch (err) {
      console.error("Login error:", err);
      setError("Something went wrong. Please try again.");
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <div className="relative w-full max-w-sm min-h-[520px] bg-white border border-gray-200 rounded-sm shadow-lg p-8 flex flex-col">
        <button
          type="button"
          className="absolute top-4 right-4 text-gray-500 hover:text-black text-lg"
          onClick={() => navigate("/")}
        >
          ✕
        </button>

        <h2 className="text-lg font-medium text-gray-800 mb-8">
          Welcome to AJIO
        </h2>

        <label className="block text-sm text-gray-800 mb-2">
          Enter Mobile Number <span className="text-red-500">*</span>
        </label>
        <div className="mb-4">
          <input
            ref={inputRef}
            type="text"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className={`w-full border-b py-2 text-gray-900 focus:outline-none ${
              error
                ? "border-red-500 focus:border-red-600"
                : "border-gray-300 focus:border-gray-600"
            }`}
            placeholder="Enter Mobile Number"
          />
          {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
        </div>

        <div className="space-y-3">
          <button
            type="button"
            onClick={handleSubmit}
            className="w-full bg-yellow-700 text-white py-2 text-sm font-medium tracking-wide hover:bg-yellow-800 transition"
          >
            CONTINUE
          </button>

          <p className="text-xs text-gray-600 text-center">
            By Signing In, I agree to{" "}
            <a href="#" className="text-blue-600 hover:underline">
              Terms & Conditions
            </a>{" "}
            and{" "}
            <a href="#" className="text-blue-600 hover:underline">
              Privacy Policy
            </a>
          </p>
        </div>

        <div className="mt-auto p-3 text-xs text-gray-700 bg-yellow-50 border border-yellow-200 rounded-sm">
          📩 Email based login is no longer available. Please{" "}
          <a href="#" className="text-blue-600 hover:underline">
            click here
          </a>{" "}
          to restore your mobile number.
        </div>
      </div>
    </div>
  );
}

export default LoginPage;

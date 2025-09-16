// frontend/src/pages/OtpPage.jsx
import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { verifyOtp, resendOtp } from "../api/authApi";
import { useAuth } from "../context/authContext";

function OtpPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const auth = useAuth();

  const { phone } = location.state || {};
  const fromLocation = location.state?.from;

  const [otp, setOtp] = useState("");
  const [error, setError] = useState("");
  const [timer, setTimer] = useState(60);
  const [resending, setResending] = useState(false);
  const [verifying, setVerifying] = useState(false);

  useEffect(() => {
    if (timer > 0) {
      const countdown = setInterval(() => setTimer((p) => p - 1), 1000);
      return () => clearInterval(countdown);
    }
  }, [timer]);

  const handleVerify = async () => {
    if (otp.length < 4) {
      setError("Please enter a valid OTP");
      return;
    }
    setError("");
    setVerifying(true);

    try {
      const res = await verifyOtp({ phone, otp });
      const data = res?.data ?? res;
      const token = data?.token;
      const user = data?.user ?? data?.userDoc ?? null;

      if (token) {
        auth.login({ user, token });
        const dest = fromLocation?.pathname || "/";
        navigate(dest, { replace: true });
        return;
      }

      if (
        user &&
        (data?.message?.toLowerCase()?.includes("success") ||
          data?.message === "Login successful")
      ) {
        auth.login({ user });
        const dest = fromLocation?.pathname || "/";
        navigate(dest, { replace: true });
        return;
      }

      setError(data?.message || "Invalid OTP, please try again");
    } catch (err) {
      console.error("Error verifying OTP:", err);
      setError(
        err?.response?.data?.message ||
          "Something went wrong. Please try again."
      );
    } finally {
      setVerifying(false);
    }
  };

  const handleResend = async () => {
    if (!phone) {
      setError("Phone number missing. Please go back and enter your phone.");
      return;
    }
    try {
      setResending(true);
      await resendOtp({ phone });
      setTimer(60);
    } catch (err) {
      console.error("Resend OTP error:", err);
      setError("Failed to resend OTP");
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <div className="relative w-full max-w-sm min-h-[400px] bg-white border border-gray-200 rounded-sm shadow-lg p-8 flex flex-col">
        <button
          type="button"
          className="absolute top-4 right-4 text-gray-500 hover:text-black text-lg"
          onClick={() => navigate("/")}
        >
          ✕
        </button>

        <button
          onClick={() => navigate("/login")}
          className="text-sm text-gray-600 mb-4 flex items-center hover:underline"
        >
          ← Back
        </button>

        <h2 className="text-lg font-medium text-gray-800 mb-2">
          Sign In with OTP
        </h2>

        <p className="text-sm text-gray-600 mb-6">
          Please enter OTP sent to <br />
          <span className="font-medium">+91 {phone}</span>
        </p>

        <div className="mb-4">
          <input
            type="text"
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
            className={`w-full border-b py-2 text-gray-900 focus:outline-none ${
              error
                ? "border-red-500 focus:border-red-600"
                : "border-gray-300 focus:border-gray-600"
            }`}
            placeholder="Enter OTP"
            inputMode="numeric"
            autoFocus
          />
          {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
        </div>

        <button
          onClick={handleVerify}
          className="w-full bg-yellow-700 text-white py-2 text-sm font-medium tracking-wide hover:bg-yellow-800 transition disabled:opacity-60"
          disabled={verifying}
        >
          {verifying ? "Verifying..." : "START SHOPPING"}
        </button>

        <div className="mt-3 text-sm text-right">
          {timer > 0 ? (
            <span className="text-gray-500">Resend OTP in {timer}s</span>
          ) : (
            <button
              onClick={handleResend}
              disabled={resending}
              className="text-blue-600 hover:underline disabled:opacity-50"
            >
              Resend OTP
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default OtpPage;

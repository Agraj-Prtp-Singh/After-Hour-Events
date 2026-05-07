import { useRef, useState, useEffect } from "react";
import { sendOtp, verifyOtp } from "../api/auth";
import { useNavigate } from "react-router-dom";
import { useLocation } from "react-router-dom";
import { getHomeRouteForRole, persistAuthSession } from "../utils/auth";

export default function OTPCard() {
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const inputsRef = useRef([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const location = useLocation();
  const email = location.state?.email || "";

  useEffect(() => {
    if (otp.every((digit) => digit !== "")) {
      handleVerify();
    }
  }, [otp]);

  const handleChange = (value, index) => {
    if (!/^[0-9]?$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    if (value && index < 5) {
      inputsRef.current[index + 1].focus();
    }
  };

  const handleKeyDown = (e, index) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputsRef.current[index - 1].focus();
    }
  };

  const handleVerify = async () => {
    const code = otp.join("");

    if (!email) {
      setError("Missing email for OTP verification. Please register again.");
      return;
    }

    if (code.length < 6) {
      setError("Enter full OTP");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const res = await verifyOtp({ email, otp: code });
      persistAuthSession(res, true);

      alert("OTP Verified!!!");
      navigate(getHomeRouteForRole(res.user?.role), { replace: true });
    } catch (err) {
      setError(err.message || "Invalid OTP");
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (!email) {
      setError("Missing email for OTP resend. Please register again.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      await sendOtp(email);
      setOtp(["", "", "", "", "", ""]);
      inputsRef.current[0]?.focus();
      alert("OTP sent again");
    } catch (err) {
      setError(err.message || "Failed to resend OTP");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card-bg">
      <h2 className="text-2xl font-bold mb-2">OTP Verification</h2>

      <p className="text-sm text-gray-500 mb-6">
        We sent a 6 digit code to{" "}
        <span className="text-blue-500">{email || "your email"}</span>
      </p>

      <div className="flex justify-center gap-3 mb-6">
        {otp.map((digit, index) => (
          <input
            key={index}
            ref={(el) => (inputsRef.current[index] = el)}
            type="text"
            maxLength="1"
            value={digit}
            onChange={(e) => handleChange(e.target.value, index)}
            onKeyDown={(e) => handleKeyDown(e, index)}
            className="w-12 h-12 text-center rounded-xl bg-gray-200 text-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
        ))}
      </div>

      <button
        onClick={handleVerify}
        disabled={loading}
        className="w-full bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600 transition"
      >
        {loading ? "Verifying..." : "Verify code"}
      </button>
      {error && <p className="text-red-500 mt-2">{error}</p>}

      <button
        className="w-full mt-3 bg-gray-200 py-2 rounded-lg text-sm hover:bg-gray-300"
        onClick={handleResend}
        disabled={loading}
      >
        Didn&apos;t receive the OTP? Resend code
      </button>

      <p
        className="mt-4 text-sm text-gray-500 cursor-pointer hover:underline"
        onClick={() => navigate("/register")}
      >
        Wrong email? Go back
      </p>
    </div>
  );
}

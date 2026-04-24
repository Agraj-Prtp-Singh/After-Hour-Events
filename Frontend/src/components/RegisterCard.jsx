import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Eye, EyeOff } from "lucide-react";
import { registerUser, sendOtp } from "../api/auth";

export default function RegisterCard() {
  const [fullName, setFullName] = useState("");
  const [role, setRole] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [phone, setPhone] = useState("+977 ");
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    if (confirmPassword && password !== confirmPassword) {
      setError("Passwords do not match!");
    } else if (password && (password.length < 6 || password.length > 12)) {
      setError("Password must be 6-12 characters long!");
    } else {
      setError("");
    }
  }, [password, confirmPassword]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    const phoneDigits = phone.replace("+977", "").trim();

    if (password.length < 6 || password.length > 12) {
      setError("Password must be 6-12 characters long!");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match!");
      return;
    }

    if (phoneDigits.length !== 10) {
      setError("Phone number must be 10 digits long!");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await registerUser({
        fullName,
        role,
        email,
        password,
        phone: phoneDigits,
      });

      console.log("Success:", response);

      await sendOtp(email);

      navigate("/otp", {
        state: { email },
      });
    } catch (err) {
      setError(err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const handlePhoneChange = (e) => {
    const value = e.target.value;
    if (value.startsWith("+977") && /^\+977\s?\d*$/.test(value)) {
      setPhone(value);
    }
  };

  return (
    <div className="flex ">
      <form onSubmit={handleSubmit} className="card-bg">
        <h2 className="text-2xl font-bold text-center mb-6">
          Create your account
        </h2>

        <div className="space-y-4">
          <div className="flex flex-col">
            <label className="font-bold mb-1">Full Name</label>
            <input
              type="text"
              placeholder="Full Name"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              name="full-name"
              className="input"
              required
            />
          </div>

          <div className="flex flex-col">
            <label className="font-bold mb-1">Email address</label>
            <input
              type="email"
              placeholder="Email Address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="input"
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex flex-col">
              <label className="font-bold mb-1">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter password"
                  name="password"
                  className="input pr-10"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/3 text-gray-500"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <div className="flex flex-col">
              <label className="font-bold mb-1">Confirm Password</label>
              <div className="relative">
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="Confirm password"
                  name="confirm-password"
                  className="input pr-10"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/3 text-gray-500"
                >
                  {showConfirmPassword ? (
                    <EyeOff size={16} />
                  ) : (
                    <Eye size={16} />
                  )}
                </button>
              </div>
            </div>
          </div>

          <div className="flex flex-col">
            <label className="font-bold mb-1">Phone Number</label>
            <input
              type="tel"
              value={phone}
              onChange={handlePhoneChange}
              placeholder="9812345678"
              name="phone-number"
              className="input"
              maxLength={15}
              required
            />
          </div>

          <div className="flex flex-col">
            <label htmlFor="role" className="font-bold mb-1">
              Role
            </label>
            <select
              id="role"
              name="role"
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="input"
              required
              defaultValue=""
            >
              <option value="" disabled>
                Select your role
              </option>
              <option value="student">Student</option>
              <option value="event-planner">Event Planner</option>
              <option value="organizer">Organizer</option>
              <option value="vendor">Vendor</option>
            </select>
          </div>

          <div className="flex items-center mt-2">
            <input
              type="checkbox"
              name="agreement"
              id="agreement"
              className="mr-2"
              defaultChecked
              required
            />
            <label htmlFor="agreement" className="text-sm">
              I agree to the{" "}
              <span className="font-bold">Terms & Conditions</span>
            </label>
          </div>

          {error && <p className="text-red-500 mt-1">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="btn w-full mt-4 bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600 cursor-pointer"
          >
            {loading ? "Creating..." : "Create Account"}
          </button>

          <p className="text-center text-sm">
            Already have an account?{" "}
            <span className="text-blue-500 font-bold cursor-pointer">
              Login
            </span>
          </p>
        </div>
      </form>
    </div>
  );
}

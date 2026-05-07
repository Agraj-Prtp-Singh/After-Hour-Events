import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { loginUser } from "../api/auth";
import { getHomeRouteForRole, persistAuthSession } from "../utils/auth";

export default function LoginCard() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!email || !password) {
      setError("Please fill in all fields.");
      return;
    }

    setError("");
    setLoading(true);

    try {
      const data = await loginUser({ email, password });

      persistAuthSession(data, rememberMe);
      navigate(getHomeRouteForRole(data.user?.role), { replace: true });
    } catch (err) {
      setError(err.message || "Login failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex relative">
      <form
        onSubmit={handleSubmit}
        className="bg-[#F8FAFC] rounded-3xl border border-slate-900/10 shadow-lg p-8 w-full"
      >
        <h2 className="text-3xl font-bold text-center mb-1">Welcome back!</h2>
        <p className="text-center text-sm text-gray-500 mb-6">
          Sign in to your account
        </p>

        <div className="space-y-4">
          <div className="flex flex-col">
            <label className="font-semibold mb-1 text-sm">
              Email address<span className="text-red-500">*</span>
            </label>
            <input
              type="email"
              placeholder="Enter your email"
              name="email-address"
              className="input px-4 py-2 border rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="flex flex-col">
            <label className="font-semibold mb-1 text-sm">
              Password<span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                placeholder="**********"
                name="password"
                className="input pr-10 px-4 py-2 border rounded-lg w-full outline-none focus:ring-2 focus:ring-blue-500"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between mt-1">
            <label className="flex items-center gap-2 text-sm cursor-pointer">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="accent-blue-500"
              />
              Remember me
            </label>
            <span className="text-blue-500 text-sm font-medium cursor-pointer hover:underline">
              Forgot password?
            </span>
          </div>

          {error && <p className="text-red-500 text-sm font-medium">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-2 bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600 transition-colors cursor-pointer font-semibold shadow-md disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {loading && <Loader2 size={16} className="animate-spin" />}
            {loading ? "Signing in..." : "Log in"}
          </button>

          <div className="flex items-center gap-3 my-1">
            <hr className="flex-1 border-gray-300" />
            <span className="text-xs text-gray-400 font-medium uppercase tracking-wider">
              or
            </span>
            <hr className="flex-1 border-gray-300" />
          </div>

          <button
            type="button"
            className="w-full flex items-center justify-center gap-2 border border-gray-300 bg-white hover:bg-gray-50 text-gray-700 text-sm font-semibold py-2 rounded-lg cursor-pointer transition-all shadow-sm"
          >
            <svg width="18" height="18" viewBox="0 0 48 48">
              <path
                fill="#FFC107"
                d="M43.6 20.1H42V20H24v8h11.3C33.6 32.7 29.2 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.9 1.2 8 3.1l5.7-5.7C34.5 6.5 29.5 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.6-.4-3.9z"
              />
              <path
                fill="#FF3D00"
                d="M6.3 14.7l6.6 4.8C14.7 16 19 13 24 13c3.1 0 5.9 1.2 8 3.1l5.7-5.7C34.5 6.5 29.5 4 24 4 16.3 4 9.7 8.3 6.3 14.7z"
              />
              <path
                fill="#4CAF50"
                d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2C29.3 35.5 26.7 36 24 36c-5.2 0-9.6-3.3-11.2-7.9l-6.5 5C9.5 39.5 16.2 44 24 44z"
              />
              <path
                fill="#1976D2"
                d="M43.6 20.1H42V20H24v8h11.3c-.8 2.3-2.4 4.2-4.4 5.5l6.2 5.2C36.9 36.2 44 31 44 24c0-1.3-.1-2.6-.4-3.9z"
              />
            </svg>
            Continue with Google
          </button>

          <p className="text-center text-sm text-gray-600">
            No account?{" "}
            <span
              className="text-blue-600 font-bold cursor-pointer hover:underline"
              onClick={() => navigate("/register")}
            >
              Register here
            </span>
          </p>
        </div>
      </form>
    </div>
  );
}

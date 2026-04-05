import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import logo from "../assets/logo.png";

export default function Navbar({ variant = "default" }) {
  const navigate = useNavigate();

  return (
    <div className="bg-[#0b0220] text-gray-300 flex justify-between items-center px-4 py-2 w-full h-16">
      {/* Logo */}
      <div onClick={() => navigate("/")} className="cursor-pointer">
        <img
          src={"../assets/logo.png"}
          alt="after-hour-events"
          className="h-16 w-16 sm:-ml-3 sm:h-30 sm:w-30"
        />
      </div>

      {/* Right Side Button */}
      {variant === "back" && (
        <button
          onClick={() => navigate("/")}
          className="flex items-center px-5 py-2 font-semibold rounded-full bg-white text-black hover:bg-[#19024d] hover:text-white transition-all"
        >
          <ArrowLeft className="w-5 h-5 mr-2" />
          Back to home
        </button>
      )}

      {variant === "getStarted" && (
        <button
          onClick={() => navigate("/signin")}
          className="px-5 py-2 rounded-full bg-white text-black font-semibold hover:bg-gray-200 transition"
        >
          Get started
        </button>
      )}
    </div>
  );
}

import React from "react";
import { UserPlus } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function LandingPageCard() {
  const navigate = useNavigate();
  return (
    <div className="flex flex-col gap-6 max-w-2xl">
      {/* Heading */}
      <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold leading-tight">
        <span className="text-gradient-premium">
          Discover & <br />
          book
        </span>
        <br />
        <span className="text-gradient-blue">events effortlessly.</span>
      </h1>

      {/* Subtext */}
      <p className="text-xl font-semibold text-gray-700">Student</p>

      {/* Button */}
      <button
        className=" flex items-center w-fit px-6 py-3 rounded-full font-semibold text-white 
        button-gradient-blue"
        onClick={() => navigate("/register")}
      >
        <UserPlus className="mr-2" />
        Sign Up
      </button>
    </div>
  );
}

import React from "react";
import Navbar from "../components/NavBar";
import LandingPageCard from "../components/LandingPageCard";
import RolesSection from "../components/RolesSection";
import Footer from "../components/Footer";
import bg from "../video/bg1.mp4";

export default function Landing() {
  return (
    <div className="relative flex flex-col min-h-screen">
      {/* VIDEO BACKGROUND */}
      <video
        className="pointer-events-none absolute top-0 left-0 w-full h-full object-cover"
        src={bg}
        autoPlay
        loop
        muted
        playsInline
      />

      {/* Light overlay for readability */}
      <div className="pointer-events-none absolute top-0 left-0 w-full h-full bg-white/30 backdrop-blur-sm"></div>

      {/* Page content */}
      <div className="relative z-10 flex flex-col min-h-screen bg-transparent">
        {/* Navbar */}
        <Navbar variant="getStarted" />

        {/* Hero Section */}
        <div className="flex flex-1 items-center justify-center px-6 py-10">
          <div className="w-full max-w-7xl grid grid-cols-1 md:grid-cols-2 gap-10 items-center">
            {/* LEFT SIDE (Text) */}
            <div className="flex justify-center md:justify-start">
              <LandingPageCard />
            </div>

            {/* RIGHT SIDE (Roles Card) */}
            <div className="flex justify-center md:justify-end">
              <RolesSection />
            </div>
          </div>
        </div>

        {/* Footer */}
        <Footer />
      </div>
    </div>
  );
}

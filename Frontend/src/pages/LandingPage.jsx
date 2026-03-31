import React from "react";
import Navbar from "../components/NavBar";
import LandingPageCard from "../components/LandingPageCard";
import RolesSection from "../components/RolesSection";
import Footer from "../components/Footer";

export default function Landing() {
  return (
    <div className="flex flex-col min-h-screen bg-[#e5e5e5]">
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
  );
}

import Navbar from "../components/NavBar";
import Footer from "../components/Footer";
import OTPCard from "../components/OTPCard";
import bg from "../video/bg1.mp4";

export default function OTPPage() {
  return (
    <div className="relative flex flex-col min-h-screen">
      {/* VIDEO BACKGROUND */}
      <video
        className="absolute top-0 left-0 w-full h-full object-cover"
        src={bg}
        autoPlay
        loop
        muted
        playsInline
      />

      {/* Light overlay for readability */}
      <div className="absolute top-0 left-0 w-full h-full bg-white/30 backdrop-blur-sm"></div>

      {/* Page content */}
      <div className="relative z-10 flex flex-col min-h-screen">
        {/* Navbar */}
        <Navbar />

        {/* OTP Card */}
        <div className="flex-grow flex justify-center items-center p-4">
          <div className="w-full max-w-md">
            <OTPCard />
          </div>
        </div>

        {/* Footer */}
        <Footer />
      </div>
    </div>
  );
}

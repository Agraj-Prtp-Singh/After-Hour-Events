import { Routes, Route } from "react-router-dom";
import Register from "./pages/Register";
import OTPPage from "./pages/OTPPage";
import LandingPage from "./pages/LandingPage";

function App() {
  return (
    <div className="bg-[#F8FAFC] min-h-screen text-black overflow-hidden">
      <Routes>
        <Route path="/" element={<Register />} />
        <Route path="/otp" element={<OTPPage />} />
        <Route path="/landingPage" element={<LandingPage />} />
      </Routes>
    </div>
  );
}

export default App;

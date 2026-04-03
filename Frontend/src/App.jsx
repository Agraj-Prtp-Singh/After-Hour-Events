import { Routes, Route } from "react-router-dom";
import Register from "./pages/RegisterPage";
import OTPPage from "./pages/OTPPage";
import LandingPage from "./pages/LandingPage";
import AdminSidebar from "./components/AdminSidebar";

function App() {
  return (
    <div className="bg-[#F8FAFC] relative flex flex-col min-h-screen text-black overflow-hidden">
      {/* <Routes>
        <Route path="/register" element={<Register />} />
        <Route path="/otp" element={<OTPPage />} />
        <Route path="/" element={<LandingPage />} />
      </Routes> */}
      <AdminSidebar />
    </div>
  );
}

export default App;

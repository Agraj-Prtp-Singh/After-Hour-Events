import { Navigate, Route, Routes } from "react-router-dom";
import Register from "./pages/RegisterPage";
import OTPPage from "./pages/OTPPage";
import LandingPage from "./pages/LandingPage";
import AdminSidebar from "./components/AdminSidebar";
import AdminDashboardPage from "./pages/AdminDashboard";
import AdminEvents from "./pages/AdminEvents";
import AdminSettings from "./pages/AdminSettings";
import Footer from "./components/Footer";

function AdminLayout({ children }) {
  return (
    <div className="flex min-h-screen bg-[#F8FAFC] text-black">
      <AdminSidebar />
      <div className="flex min-h-screen flex-1 flex-col">
        <main className="flex-1 overflow-y-auto">{children}</main>
        <Footer />
      </div>
    </div>
  );
}

function App() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/register" element={<Register />} />
      <Route path="/otp" element={<OTPPage />} />

      <Route
        path="/admin/dashboard"
        element={
          <AdminLayout>
            <AdminDashboardPage />
          </AdminLayout>
        }
      />
      <Route
        path="/admin/events"
        element={
          <AdminLayout>
            <AdminEvents />
          </AdminLayout>
        }
      />
      <Route
        path="/admin/settings"
        element={
          <AdminLayout>
            <AdminSettings />
          </AdminLayout>
        }
      />
      <Route path="/admin" element={<Navigate to="/admin/dashboard" replace />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;

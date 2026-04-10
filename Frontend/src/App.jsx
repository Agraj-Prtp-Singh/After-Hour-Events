import { Navigate, Route, Routes } from "react-router-dom";
import Register from "./pages/RegisterPage";
import OTPPage from "./pages/OTPPage";
import LandingPage from "./pages/LandingPage";
import AdminSidebar from "./components/AdminSidebar";
import AdminDashboardPage from "./pages/AdminDashboard";
import AdminEvents from "./pages/Admin.jsx";
import Footer from "./components/Footer";

import StudentDashboard from "./pages/Studentdashboard"; 
import BrowseStudentEvents from "./pages/BrowseStudentEvents";
import StudentBookings from "./pages/StudentBookings";
import StudentEventDetail from "./pages/StudentEventDetail";

// RENAMED THIS FROM AdminLayout TO DashboardLayout
function DashboardLayout({ children }) {
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

      {/* Admin Routes now use the renamed DashboardLayout */}
      <Route
        path="/admin/dashboard"
        element={
          <DashboardLayout>
            <AdminDashboardPage />
          </DashboardLayout>
        }
      />
      <Route
        path="/admin/events"
        element={
          <DashboardLayout>
            <AdminEvents />
          </DashboardLayout>
        }
      />

      {/* Student Routes */}
      <Route
        path="/student-dashboard"
        element={
          <DashboardLayout>
            <StudentDashboard />
          </DashboardLayout>
        }
      />
      <Route
        path="/student/browse"
        element={
          <DashboardLayout>
            <BrowseStudentEvents />
          </DashboardLayout>
        }
      />
      <Route
        path="/student/bookings"
        element={
          <DashboardLayout>
            <StudentBookings />
          </DashboardLayout>
        }
      />
      <Route
        path="/student/event/:id"
        element={
          <DashboardLayout>
            <StudentEventDetail />
          </DashboardLayout>
        }
      />

      <Route path="/admin" element={<Navigate to="/admin/dashboard" replace />} />
      <Route path="/student" element={<Navigate to="/student-dashboard" replace />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;

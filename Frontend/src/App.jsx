import { Navigate, Route, Routes } from "react-router-dom";
import Register from "./pages/RegisterPage";
import OTPPage from "./pages/OTPPage";
import LandingPage from "./pages/LandingPage";
import AdminSidebar from "./components/AdminSidebar";
import StudentSidebar from "./components/StudentSidebar";
import PlannerSidebar from "./components/PlannerSidebar";
import VendorSidebar from "./components/VendorSidebar";
import AdminDashboardPage from "./pages/AdminDashboard";
import AdminEvents from "./pages/AdminEvents";
import AdminSettings from "./pages/AdminSettings";
import Footer from "./components/Footer";
import Login from "./pages/LoginPage";
import AskAI from "./components/AskAI";
import StudentDashboard from "./pages/Studentdashboard";
import BrowseStudentEvents from "./pages/BrowseStudentEvents";
import StudentBookings from "./pages/StudentBookings";
import StudentEventDetail from "./pages/StudentEventDetail";
import PlannerDashboard from "./pages/Plannerdashboard";
import CreateEvent from "./pages/Createevent";
import Attendees from "./pages/Attendees";
import PlannerVendorApplications from "./pages/PlannerVendorApplications";
import PlannerScanner from "./pages/PlannerScanner";
import VendorDashboard from "./pages/VendorDashboard";
import VendorApplyEvents from "./pages/VendorApplyEvents";
import VendorSettings from "./pages/VendorSettings";
import {
  clearAuthSession,
  getHomeRouteForRole,
  getStoredUser,
  isAuthenticated,
  normalizeRole,
} from "./utils/auth";

function AdminLayout({ children }) {
  return (
    <div className="flex min-h-screen bg-[#F8FAFC] text-black">
      <AdminSidebar />
      <div className="flex flex-1 flex-col">
        <main className="flex-1 overflow-y-auto">{children}</main>
        <Footer />
      </div>
    </div>
  );
}

function PlannerLayout({ children }) {
  return (
    <div className="flex min-h-screen bg-[#F8FAFC] text-black">
      <PlannerSidebar />
      <div className="flex flex-1 flex-col">
        <main className="flex-1 overflow-y-auto">{children}</main>
        <Footer />
      </div>
      <AskAI />
    </div>
  );
}

function StudentLayout({ children }) {
  return (
    <div className="flex min-h-screen bg-[#F8FAFC] text-black">
      <StudentSidebar />
      <div className="flex flex-1 flex-col">
        <main className="flex-1 overflow-y-auto">{children}</main>
        <Footer />
      </div>
      <AskAI />
    </div>
  );
}

function VendorLayout({ children }) {
  return (
    <div className="flex min-h-screen bg-[#F8FAFC] text-black">
      <VendorSidebar />
      <div className="flex min-h-screen flex-1 flex-col">
        <main className="flex-1 overflow-y-auto">{children}</main>
        <Footer />
      </div>
    </div>
  );
}

function ProtectedRoute({ allowedRoles, children }) {
  const authenticated = isAuthenticated();
  const user = getStoredUser();
  const role = normalizeRole(user?.role);

  if (!authenticated) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles?.length && !allowedRoles.includes(role)) {
    return <Navigate to={getHomeRouteForRole(role)} replace />;
  }

  return children;
}

function PublicOnlyRoute({ children }) {
  const user = getStoredUser();
  const role = normalizeRole(user?.role);

  if (isAuthenticated() && role) {
    return <Navigate to={getHomeRouteForRole(role)} replace />;
  }

  if (isAuthenticated() && !role) {
    clearAuthSession();
  }

  return children;
}

function App() {
  const fallbackRoute = getHomeRouteForRole(getStoredUser()?.role);

  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route
        path="/register"
        element={
          <PublicOnlyRoute>
            <Register />
          </PublicOnlyRoute>
        }
      />
      <Route
        path="/otp"
        element={
          <PublicOnlyRoute>
            <OTPPage />
          </PublicOnlyRoute>
        }
      />
      <Route
        path="/login"
        element={
          <PublicOnlyRoute>
            <>
              <Login />
              <AskAI />
            </>
          </PublicOnlyRoute>
        }
      />

      <Route
        path="/admin/dashboard"
        element={
          <ProtectedRoute allowedRoles={["admin"]}>
            <AdminLayout>
              <AdminDashboardPage />
            </AdminLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/events"
        element={
          <ProtectedRoute allowedRoles={["admin"]}>
            <AdminLayout>
              <AdminEvents />
            </AdminLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/settings"
        element={
          <ProtectedRoute allowedRoles={["admin"]}>
            <AdminLayout>
              <AdminSettings />
            </AdminLayout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/student-dashboard"
        element={
          <ProtectedRoute allowedRoles={["student"]}>
            <StudentLayout>
              <StudentDashboard />
            </StudentLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/student/dashboard"
        element={<Navigate to="/student-dashboard" replace />}
      />
      <Route
        path="/student/browse"
        element={
          <ProtectedRoute allowedRoles={["student"]}>
            <StudentLayout>
              <BrowseStudentEvents />
            </StudentLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/student/bookings"
        element={
          <ProtectedRoute allowedRoles={["student"]}>
            <StudentLayout>
              <StudentBookings />
            </StudentLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/student/event/:id"
        element={
          <ProtectedRoute allowedRoles={["student"]}>
            <StudentLayout>
              <StudentEventDetail />
            </StudentLayout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/planner/dashboard"
        element={
          <ProtectedRoute allowedRoles={["admin", "event_planner"]}>
            <PlannerLayout>
              <PlannerDashboard />
            </PlannerLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/planner/events"
        element={
          <ProtectedRoute allowedRoles={["admin", "event_planner"]}>
            <PlannerLayout>
              <CreateEvent />
            </PlannerLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/planner/attendees"
        element={
          <ProtectedRoute allowedRoles={["admin", "event_planner"]}>
            <PlannerLayout>
              <Attendees />
            </PlannerLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/planner/scanner"
        element={
          <ProtectedRoute allowedRoles={["admin", "event_planner"]}>
            <PlannerLayout>
              <PlannerScanner />
            </PlannerLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/planner/apps"
        element={
          <ProtectedRoute allowedRoles={["admin", "event_planner"]}>
            <PlannerLayout>
              <PlannerVendorApplications />
            </PlannerLayout>
          </ProtectedRoute>
        }
      />

      <Route path="/admin" element={<Navigate to="/admin/dashboard" replace />} />
      <Route path="/student" element={<Navigate to="/student-dashboard" replace />} />
      <Route
        path="/vendor/dashboard"
        element={
          <ProtectedRoute allowedRoles={["vendor", "admin"]}>
            <VendorLayout>
              <VendorDashboard />
            </VendorLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/vendor/apply-events"
        element={
          <ProtectedRoute allowedRoles={["vendor", "admin"]}>
            <VendorLayout>
              <VendorApplyEvents />
            </VendorLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/vendor/settings"
        element={
          <ProtectedRoute allowedRoles={["vendor", "admin"]}>
            <VendorLayout>
              <VendorSettings />
            </VendorLayout>
          </ProtectedRoute>
        }
      />
      <Route path="/vendor" element={<Navigate to="/vendor/dashboard" replace />} />

      <Route path="/planner" element={<Navigate to="/planner/dashboard" replace />} />
      <Route path="*" element={<Navigate to={fallbackRoute} replace />} />
    </Routes>
  );
}

export default App;

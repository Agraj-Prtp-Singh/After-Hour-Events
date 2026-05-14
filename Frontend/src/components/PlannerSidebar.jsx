import { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import {
  ChevronLeft,
  ChevronRight,
  LayoutDashboard,
  CalendarDays,
  ScanQrCode,
  Users,
  PuzzleIcon,
  LogOut,
} from "lucide-react";
import logo from "../assets/logo.png";
import { clearAuthSession } from "../utils/auth";

const navItems = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard, to: "/planner/dashboard" },
  { id: "events",    label: "My Events",  icon: CalendarDays,   to: "/planner/events"    },
  { id: "attendees", label: "Attendees",  icon: Users,          to: "/planner/attendees" },
  { id: "scanner",   label: "Scanner",    icon: ScanQrCode,     to: "/planner/scanner"   },
  { id: "apps",      label: "Vendor Apps",icon: PuzzleIcon,     to: "/planner/apps"      },
];

export default function PlannerSidebar() {
  const [isOpen, setIsOpen] = useState(true);
  const navigate = useNavigate();

  const handleLogout = () => {
    clearAuthSession();
    navigate("/");
  };

  return (
    <aside
      className={`relative flex min-h-screen flex-col bg-[#08041A] text-white transition-all duration-300 ${
        isOpen ? "w-64 px-4 py-6" : "w-24 px-3 py-6"
      }`}
    >
      {/* Toggle Button */}
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className="absolute -right-4 top-8 flex h-8 w-8 items-center justify-center rounded-full border border-[#2A5BFF]/40 bg-[#101935] text-[#8FB1FF] shadow-lg transition hover:scale-105 hover:bg-[#16244A] z-50"
        aria-label={isOpen ? "Hide sidebar" : "Show sidebar"}
      >
        {isOpen ? <ChevronLeft size={18} /> : <ChevronRight size={18} />}
      </button>

      {/* Logo & Branding */}
      <div className="mt-6 flex flex-col items-center">
        <img
          src={logo}
          alt="AfterHour Events logo"
          className={`${isOpen ? "h-28 w-28" : "h-14 w-14"} object-contain transition-all duration-300`}
        />
        {isOpen && (
          <div className="mt-3 text-center">
            <p className="text-2xl font-extrabold tracking-[0.28em] text-white/90 leading-tight">
              AFTERHOUR
            </p>
            <p className="mt-1 text-sm font-semibold tracking-[0.45em] text-white/85">
              EVENTS
            </p>
          </div>
        )}
      </div>

      {/* Nav Items */}
      <nav className="mt-10 flex flex-1 flex-col gap-3">
        {navItems.map(({ id, label, icon: Icon, to }) => (
          <NavLink
            key={id}
            to={to}
            className={({ isActive }) =>
              `group flex items-center rounded-2xl transition-all duration-200 ${
                isOpen ? "gap-3 px-4 py-3" : "justify-center px-2 py-3"
              } ${
                isActive
                  ? "bg-[#4E7BFF] text-white shadow-[0_10px_30px_rgba(78,123,255,0.35)]"
                  : "text-white/80 hover:bg-white/10 hover:text-white"
              }`
            }
          >
            <Icon size={20} className="shrink-0" />
            {isOpen && <span className="text-sm font-semibold">{label}</span>}
          </NavLink>
        ))}
      </nav>

      {/* Logout */}
      <button
        type="button"
        onClick={handleLogout}
        className={`group mt-4 flex items-center rounded-2xl text-white/60 transition-all duration-200 hover:bg-red-500/20 hover:text-red-400 ${
          isOpen ? "gap-3 px-4 py-3" : "justify-center px-2 py-3"
        }`}
      >
        <LogOut size={20} className="shrink-0" />
        {isOpen && <span className="text-sm font-semibold">Logout</span>}
      </button>
    </aside>
  );
}

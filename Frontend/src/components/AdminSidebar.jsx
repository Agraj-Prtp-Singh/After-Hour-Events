import { useState } from "react";
import { NavLink } from "react-router-dom";
import {
  ChevronLeft,
  ChevronRight,
  LayoutDashboard,
  CalendarDays,
  Settings,
} from "lucide-react";
import logo from "../assets/logo.png";

const navItems = [
  {
    id: "dashboard",
    label: "Dashboard",
    icon: LayoutDashboard,
    to: "/admin/dashboard",
  },
  { id: "events", label: "Events", icon: CalendarDays, to: "/admin/events" },
  { id: "settings", label: "Settings", icon: Settings, to: "/admin/settings" },
];

export default function AdminSidebar() {
  const [isOpen, setIsOpen] = useState(true);

  return (
    <aside
      className={`relative flex min-h-screen flex-col bg-[#08041A] text-white transition-all duration-300 ${
        isOpen ? "w-full md:w-64 px-4 py-6" : "w-full md:w-24 px-3 py-6"
      }`}
    >
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className="absolute top-8 right-4 md:-right-4 flex h-8 w-8 items-center justify-center rounded-full border border-[#2A5BFF]/40 bg-[#101935] text-[#8FB1FF] shadow-lg transition hover:scale-105 hover:bg-[#16244A]"
        aria-label={isOpen ? "Hide sidebar" : "Show sidebar"}
      >
        {isOpen ? <ChevronLeft size={18} /> : <ChevronRight size={18} />}
      </button>

      <div className="mt-6 flex flex-col items-center">
        <img
          src={logo}
          alt="AfterHour Events logo"
          className={`${isOpen ? "h-28 w-28" : "h-14 w-14"} object-contain transition-all duration-300`}
        />

        {isOpen && (
          <div className="mt-3 text-center">
            <p className="text-2xl font-extrabold tracking-[0.28em] text-white/90">
              AFTERHOUR
            </p>
            <p className="mt-1 text-sm font-semibold tracking-[0.45em] text-white/85">
              EVENTS
            </p>
          </div>
        )}
      </div>

      <nav className="mt-10 flex flex-1 flex-col gap-3">
        {navItems.map(({ id, label, icon: Icon, to }) => {
          return (
            <NavLink
              key={id}
              to={to}
              className={({ isActive }) =>
                `group flex items-center rounded-2xl transition-all duration-200 ${
                  isOpen ? "gap-3 px-4 py-3" : "justify-center px-2 py-3"
                } ${
                  isActive
                    ? "bg-[#4E7BFF] text-white shadow-[0_10px_30px_rgba(78,123,255,0.35)]"
                    : "text-white/80 hover:bg-white/8 hover:text-white"
                }`
              }
            >
              <Icon size={20} className="shrink-0" />
              {isOpen && <span className="text-sm font-semibold">{label}</span>}
            </NavLink>
          );
        })}
      </nav>
    </aside>
  );
}

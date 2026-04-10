import { useNavigate } from "react-router-dom";
import {
  Globe,
  Ticket,
  CalendarDays,
  ChevronRight,
  MapPin,
  Clock,
  Star,
} from "lucide-react";

const upcomingEvents = [
  {
    id: 1,
    title: "Tech Summit 2026",
    date: "Apr 12, 2026",
    time: "10:00 AM",
    location: "Main Hall, Block A",
    status: "Confirmed",
  },
  {
    id: 2,
    title: "Campus Music Fest",
    date: "Apr 18, 2026",
    time: "6:00 PM",
    location: "Outdoor Stage",
    status: "Confirmed",
  },
  {
    id: 3,
    title: "AI & Future Workshop",
    date: "Apr 25, 2026",
    time: "2:00 PM",
    location: "Lab 3B",
    status: "Pending",
  },
];

const quickActions = [
  {
    label: "Browse Events",
    icon: Globe,
    desc: "Discover upcoming events",
    path: "/student/browse",
  },
  {
    label: "My Bookings",
    icon: Ticket,
    desc: "View your tickets & QR codes",
    path: "/student/bookings",
  },
];

export default function StudentDashboard() {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col items-center px-4 md:px-8 py-8 bg-[#F8FAFC]">
      <div className="w-full max-w-4xl space-y-8">
        
        {/* Page Title */}
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-bold text-gray-900">Student Dashboard</h1>
          <p className="text-gray-500 text-sm">Welcome back! Here is what's happening.</p>
        </div>

        {/* Quick Action Cards */}
        <section>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {quickActions.map(({ label, icon: Icon, desc, path }) => (
              <button
                key={label}
                onClick={() => navigate(path)}
                className="bg-white border border-black/10 rounded-2xl shadow-md px-6 py-8 flex flex-col items-center justify-center gap-4 hover:shadow-lg hover:-translate-y-0.5 transition-all cursor-pointer text-center group"
              >
                <div className="bg-[#0b0220] text-white rounded-full p-4 group-hover:bg-[#19024d] transition-colors">
                  <Icon size={28} />
                </div>
                <div>
                  <p className="text-lg font-bold text-gray-900">{label}</p>
                  <p className="text-xs text-gray-400 mt-0.5">{desc}</p>
                </div>
              </button>
            ))}
          </div>
        </section>

        {/* Stats Row */}
        <section className="grid grid-cols-3 gap-3 md:gap-4">
          {[
            { label: "Events Attended", value: "12", icon: Star },
            { label: "Upcoming Events", value: "3", icon: CalendarDays },
            { label: "Total Bookings", value: "15", icon: Ticket },
          ].map(({ label, value, icon: Icon }) => (
            <div
              key={label}
              className="bg-white border border-black/10 rounded-2xl shadow-sm px-3 md:px-5 py-4 flex flex-col sm:flex-row items-center sm:items-start gap-2 md:gap-4"
            >
              <div className="bg-[#F0F4FF] rounded-xl p-2 md:p-2.5 text-[#0b0220] shrink-0">
                <Icon size={18} />
              </div>
              <div className="text-center sm:text-left">
                <p className="text-xl md:text-2xl font-bold text-gray-900">{value}</p>
                <p className="text-[10px] md:text-xs text-gray-400 leading-tight">{label}</p>
              </div>
            </div>
          ))}
        </section>

        {/* Upcoming Bookings */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-gray-800">Upcoming Bookings</h2>
            <button
              onClick={() => navigate("/student/bookings")}
              className="text-blue-500 text-sm font-medium flex items-center gap-1 hover:underline cursor-pointer"
            >
              View all <ChevronRight size={14} />
            </button>
          </div>

          <div className="space-y-3">
            {upcomingEvents.map((event) => (
              <div
                key={event.id}
                className="bg-white border border-black/10 rounded-2xl shadow-sm px-4 md:px-6 py-4 flex items-center justify-between hover:shadow-md transition-shadow gap-3"
              >
                <div className="flex items-center gap-3 md:gap-4 min-w-0">
                  <div className="bg-[#0b0220] text-white rounded-xl px-2.5 md:px-3 py-2 text-center shrink-0 min-w-[46px] md:min-w-[52px]">
                    <p className="text-[9px] md:text-[10px] font-medium opacity-60">
                      {event.date.split(" ")[0]}
                    </p>
                    <p className="text-lg md:text-xl font-bold leading-tight">
                      {event.date.split(" ")[1].replace(",", "")}
                    </p>
                  </div>
                  <div className="min-w-0">
                    <p className="font-semibold text-gray-900 text-sm truncate">{event.title}</p>
                    <div className="flex flex-wrap items-center gap-2 md:gap-3 mt-1 text-gray-400 text-xs">
                      <span className="flex items-center gap-1 shrink-0">
                        <Clock size={10} /> {event.time}
                      </span>
                      <span className="flex items-center gap-1 truncate">
                        <MapPin size={10} /> {event.location}
                      </span>
                    </div>
                  </div>
                </div>

                <span className={`text-xs font-semibold px-2.5 md:px-3 py-1 rounded-full shrink-0 ${
                  event.status === "Confirmed"
                    ? "bg-green-100 text-green-700"
                    : "bg-yellow-100 text-yellow-700"
                }`}>
                  {event.status}
                </span>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
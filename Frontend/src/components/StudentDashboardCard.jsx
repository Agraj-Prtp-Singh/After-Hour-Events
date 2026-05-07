import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Globe,
  Ticket,
  CalendarDays,
  ChevronRight,
  MapPin,
  Clock,
  Star,
  Loader2,
} from "lucide-react";
import { getStudentStats, getStudentBookings } from "../api/student";

const EMPTY_STATS = {
  eventsAttended: 0,
  upcomingEvents: 0,
  totalBookings: 0,
};

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
    desc: "View your tickets and QR codes",
    path: "/student/bookings",
  },
];

function normalizeBooking(registration) {
  const event = registration.eventId || registration.event || {};
  const startDate = event.startDate ? new Date(event.startDate) : null;

  return {
    id: registration._id || registration.id,
    eventId: event._id || event.id,
    title: event.title || "Untitled Event",
    date: startDate
      ? startDate.toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
          year: "numeric",
        })
      : "Date not set",
    time: startDate
      ? startDate.toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        })
      : "Time not set",
    location: event.location || "Location not set",
    status: registration.status === "cancelled" ? "Cancelled" : "Confirmed",
  };
}

function StatCard({ label, value, icon: Icon, loading }) {
  return (
    <div className="flex flex-col sm:flex-row items-center sm:items-start gap-2 md:gap-4 rounded-[1.5rem] bg-[#F4F7FB] px-3 md:px-5 py-4 border border-black/5">
      <div className="bg-[#F0F4FF] rounded-xl p-2 md:p-2.5 text-[#0b0220] shrink-0">
        <Icon size={18} />
      </div>
      <div className="text-center sm:text-left">
        {loading ? (
          <div className="h-7 w-10 rounded-md bg-slate-100 animate-pulse mb-1" />
        ) : (
          <p className="text-xl md:text-2xl font-bold text-gray-900">{value}</p>
        )}
        <p className="text-[10px] md:text-xs text-gray-400 leading-tight">{label}</p>
      </div>
    </div>
  );
}

function BookingRow({ event }) {
  const parts = event.date.split(" ");
  const month = parts[0];
  const day = parts[1]?.replace(",", "");

  return (
    <div className="flex items-center justify-between gap-3 rounded-[1.5rem] bg-[#F4F7FB] border border-black/5 px-4 md:px-6 py-4 hover:shadow-md transition-shadow">
      <div className="flex items-center gap-3 md:gap-4 min-w-0">
        <div className="bg-[#0b0220] text-white rounded-xl px-2.5 md:px-3 py-2 text-center shrink-0 min-w-[46px] md:min-w-[52px]">
          <p className="text-[9px] md:text-[10px] font-medium opacity-60">{month}</p>
          <p className="text-lg md:text-xl font-bold leading-tight">{day}</p>
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
      <span
        className={`text-xs font-semibold px-2.5 md:px-3 py-1 rounded-full shrink-0 ${
          event.status === "Confirmed"
            ? "bg-green-100 text-green-700"
            : event.status === "Cancelled"
            ? "bg-red-100 text-red-500"
            : "bg-yellow-100 text-yellow-700"
        }`}
      >
        {event.status}
      </span>
    </div>
  );
}

export default function StudentDashboardCard() {
  const navigate = useNavigate();

  const [stats, setStats] = useState(EMPTY_STATS);
  const [bookings, setBookings] = useState([]);
  const [loadingStats, setLoadingStats] = useState(true);
  const [loadingBookings, setLoadingBookings] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    getStudentStats()
      .then((data) => {
        setStats({
          eventsAttended: data.eventsAttended ?? 0,
          upcomingEvents: data.upcomingEvents ?? 0,
          totalBookings: data.totalBookings ?? 0,
        });
      })
      .catch((err) => {
        setError(err.message || "Failed to load student stats.");
      })
      .finally(() => setLoadingStats(false));

    getStudentBookings()
      .then((data) => {
        const list = Array.isArray(data) ? data : [];
        setBookings(list.map(normalizeBooking).slice(0, 3));
      })
      .catch((err) => {
        setError((current) => current || err.message || "Failed to load bookings.");
      })
      .finally(() => setLoadingBookings(false));
  }, []);

  const statItems = [
    { label: "Events Attended", value: stats.eventsAttended, icon: Star },
    { label: "Upcoming Events", value: stats.upcomingEvents, icon: CalendarDays },
    { label: "Total Bookings", value: stats.totalBookings, icon: Ticket },
  ];

  return (
    <div className="flex min-h-full flex-col gap-6">
      {error && (
        <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
          {error}
        </div>
      )}

      <section className="flex flex-col gap-3 rounded-[2rem] bg-white px-5 py-5 shadow-[0_24px_60px_rgba(15,23,42,0.08)] md:flex-row md:items-end md:justify-between md:px-6">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
            Navigation
          </p>
          <h2 className="mt-2 text-2xl font-semibold text-slate-900">
            Quick Actions
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            Jump straight to where you need to go.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-4 w-full md:w-auto">
          {quickActions.map(({ label, icon: Icon, desc, path }) => (
            <button
              key={label}
              onClick={() => navigate(path)}
              className="bg-[#F4F7FB] border border-black/10 rounded-2xl px-4 py-5 flex flex-col items-center justify-center gap-3 hover:shadow-lg hover:-translate-y-0.5 transition-all cursor-pointer text-center group"
            >
              <div className="bg-[#0b0220] text-white rounded-full p-3 group-hover:bg-[#19024d] transition-colors">
                <Icon size={22} />
              </div>
              <div>
                <p className="text-sm font-bold text-gray-900">{label}</p>
                <p className="text-xs text-gray-400 mt-0.5">{desc}</p>
              </div>
            </button>
          ))}
        </div>
      </section>

      <section className="rounded-[2rem] bg-white p-6 shadow-[0_24px_60px_rgba(15,23,42,0.08)] md:p-8">
        <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between mb-5">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
              Overview
            </p>
            <h2 className="mt-2 text-2xl font-semibold text-slate-900">
              Your Activity
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              A snapshot of your event history.
            </p>
          </div>
        </div>
        <div className="grid grid-cols-3 gap-3 md:gap-4">
          {statItems.map(({ label, value, icon }) => (
            <StatCard
              key={label}
              label={label}
              value={value}
              icon={icon}
              loading={loadingStats}
            />
          ))}
        </div>
      </section>

      <section className="rounded-[2rem] bg-white p-6 shadow-[0_24px_60px_rgba(15,23,42,0.08)] md:p-8">
        <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between mb-5">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
              Snapshot
            </p>
            <h2 className="mt-2 text-2xl font-semibold text-slate-900">
              Upcoming Bookings
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              Your registered events at a glance.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <span className="inline-flex w-fit rounded-full bg-slate-100 px-3 py-1 text-sm font-medium text-slate-600">
              {loadingBookings ? "Loading..." : `${bookings.length} bookings`}
            </span>
            <button
              onClick={() => navigate("/student/bookings")}
              className="inline-flex items-center gap-1 text-blue-500 text-sm font-medium hover:underline cursor-pointer"
            >
              View all <ChevronRight size={14} />
            </button>
          </div>
        </div>

        {loadingBookings ? (
          <div className="flex items-center justify-center py-16 text-slate-400 gap-2">
            <Loader2 size={20} className="animate-spin" />
            <span className="text-sm">Loading bookings...</span>
          </div>
        ) : bookings.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-200 px-4 py-12 text-center text-sm text-slate-400">
            No bookings found in the database yet.
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {bookings.map((event) => (
              <BookingRow key={event.id} event={event} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

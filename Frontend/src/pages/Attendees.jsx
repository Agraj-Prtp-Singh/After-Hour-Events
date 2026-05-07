import { useState, useEffect } from "react";
import { Search, Download, Loader2 } from "lucide-react";
import { getAllAttendees, getPlannerStats } from "../api/planner";

const EMPTY_STATS = [
  { value: "0", label: "Registered" },
  { value: "0", label: "Capacity" },
  { value: "0%", label: "Fill rate" },
  { value: "0", label: "Remaining" },
];

const statusColors = {
  registered: "bg-green-100 text-green-700",
  cancelled: "bg-red-100 text-red-500",
  Registered: "bg-green-100 text-green-700",
  Cancelled: "bg-red-100 text-red-500",
};

const normalizeAttendee = (registration) => ({
  id: registration._id || registration.id,
  name: registration.userId?.fullName || registration.fullName || "Unknown attendee",
  email: registration.userId?.email || registration.email || "No email",
  booked: registration.createdAt
    ? new Date(registration.createdAt).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      })
    : "Unknown",
  status: registration.status || "registered",
  eventTitle: registration.eventId?.title || "",
});

export default function Attendees() {
  const [search, setSearch] = useState("");
  const [showAll, setShowAll] = useState(false);
  const [allAttendees, setAllAttendees] = useState([]);
  const [stats, setStats] = useState(EMPTY_STATS);
  const [loadingAttendees, setLoadingAttendees] = useState(true);
  const [loadingStats, setLoadingStats] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    getAllAttendees()
      .then((data) => {
        const list = Array.isArray(data) ? data : [];
        setAllAttendees(list.map(normalizeAttendee));
      })
      .catch((err) => {
        setError(err.message || "Could not load attendees from server.");
      })
      .finally(() => setLoadingAttendees(false));

    getPlannerStats()
      .then((data) => {
        const registered = data.totalAttendees ?? 0;
        const capacity = data.totalCapacity ?? 0;
        const remaining = Math.max(capacity - registered, 0);
        const fillRate =
          capacity > 0 ? Math.round((registered / capacity) * 100) : 0;

        setStats([
          { value: String(registered), label: "Registered" },
          { value: String(capacity), label: "Capacity" },
          { value: `${fillRate}%`, label: "Fill rate" },
          { value: String(remaining), label: "Remaining" },
        ]);
      })
      .catch(() => {})
      .finally(() => setLoadingStats(false));
  }, []);

  const filtered = allAttendees.filter((attendee) => {
    const haystack = `${attendee.name} ${attendee.email} ${attendee.eventTitle}`.toLowerCase();
    return haystack.includes(search.toLowerCase());
  });

  const displayed = showAll ? filtered : filtered.slice(0, 3);

  const handleExportCSV = () => {
    const headers = ["Name", "Email", "Booked", "Status", "Event"];
    const rows = allAttendees.map((attendee) => [
      attendee.name,
      attendee.email,
      attendee.booked,
      attendee.status,
      attendee.eventTitle,
    ]);
    const csv = [headers, ...rows].map((row) => row.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "attendees.csv";
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="p-4 md:p-8 w-full">
      <div className="max-w-5xl mx-auto space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">Attendees</h1>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 text-sm rounded-xl px-4 py-3">
            {error}
          </div>
        )}

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {loadingStats
            ? Array.from({ length: 4 }).map((_, i) => (
                <div
                  key={i}
                  className="bg-white border border-black/10 rounded-2xl shadow-sm flex flex-col items-center py-6 px-3"
                >
                  <div className="h-8 w-12 rounded-md bg-slate-100 animate-pulse mb-2" />
                  <div className="h-3 w-16 rounded bg-slate-100 animate-pulse" />
                </div>
              ))
            : stats.map((stat) => (
                <div
                  key={stat.label}
                  className="bg-white border border-black/10 rounded-2xl shadow-sm flex flex-col items-center py-6 px-3"
                >
                  <span className="text-2xl font-bold text-gray-900">{stat.value}</span>
                  <span className="text-xs text-gray-500 mt-1">{stat.label}</span>
                </div>
              ))}
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search
              size={15}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            />
            <input
              className="w-full pl-9 pr-4 py-2.5 bg-white border border-black/10 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-400 shadow-sm"
              placeholder="Search attendees..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <button
            onClick={handleExportCSV}
            disabled={allAttendees.length === 0}
            className="flex items-center justify-center gap-2 bg-white border border-black/10 rounded-xl px-5 py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-50 shadow-sm transition cursor-pointer whitespace-nowrap disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Download size={14} /> Export CSV
          </button>
        </div>

        <div className="bg-white border border-black/10 rounded-2xl shadow-sm overflow-hidden">
          <div className="grid grid-cols-4 px-6 py-3 text-xs text-gray-400 font-medium border-b border-black/10 bg-gray-50">
            <span>Name</span>
            <span>Email</span>
            <span className="text-center">Booked</span>
            <span className="text-center">Status</span>
          </div>

          {loadingAttendees ? (
            <div className="flex items-center justify-center py-16 text-slate-400 gap-2">
              <Loader2 size={20} className="animate-spin" />
              <span className="text-sm">Loading attendees...</span>
            </div>
          ) : displayed.length === 0 ? (
            <div className="text-center text-gray-400 text-sm py-12">
              {search ? `No attendees found matching "${search}"` : "No attendees yet."}
            </div>
          ) : (
            displayed.map((attendee) => (
              <div
                key={attendee.id}
                className="grid grid-cols-4 items-center px-6 py-4 border-b border-black/5 last:border-b-0 hover:bg-gray-50 transition"
              >
                <span className="font-semibold text-gray-900 text-sm truncate">
                  {attendee.name}
                </span>
                <span className="text-xs text-gray-500 truncate">{attendee.email}</span>
                <span className="text-xs text-gray-500 text-center">{attendee.booked}</span>
                <div className="flex justify-center">
                  <span
                    className={`text-xs font-semibold px-3 py-1 rounded-full ${
                      statusColors[attendee.status] || "bg-gray-100 text-gray-600"
                    }`}
                  >
                    {attendee.status}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>

        {!loadingAttendees && filtered.length > 3 && (
          <div className="text-center">
            <button
              onClick={() => setShowAll((value) => !value)}
              className="text-sm text-blue-500 font-medium hover:underline cursor-pointer"
            >
              {showAll ? "Show less" : `More... (${filtered.length - 3} more)`}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

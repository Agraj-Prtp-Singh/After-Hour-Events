import { useEffect, useMemo, useState } from "react";
import { ArrowLeft, Download, Loader2, Search, Users } from "lucide-react";
import { getAllAttendees, getPlannerEvents, getPlannerStats } from "../api/planner";

const EMPTY_STATS = [
  { value: "0", label: "Registered" },
  { value: "0", label: "Capacity" },
  { value: "0%", label: "Fill rate" },
  { value: "0", label: "Remaining" },
];

const formatDate = (value) =>
  value
    ? new Date(value).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      })
    : "Date not set";

const normalizeAttendee = (registration) => {
  const event = registration.eventId || registration.event || {};
  const user = registration.userId || {};

  return {
    id: registration._id || registration.id,
    eventId: event._id || event.id || registration.eventId,
    name: user.fullName || registration.fullName || "Unknown attendee",
    email: user.email || registration.email || "No email",
    booked: formatDate(registration.createdAt),
    checkedInAt: registration.checkedInAt || null,
    checkInStatus: registration.checkedInAt ? "Checked in" : "Not checked in",
    eventTitle: event.title || registration.eventTitle || "Unknown event",
  };
};

const normalizeEvent = (event) => ({
  id: event._id || event.id,
  title: event.title || "Untitled Event",
  location: event.location || "Location not set",
  startDate: event.startDate,
  capacity: Number(event.capacity ?? 0),
});

const escapeCsvCell = (value) => `"${String(value ?? "").replace(/"/g, '""')}"`;

export default function Attendees() {
  const [search, setSearch] = useState("");
  const [events, setEvents] = useState([]);
  const [attendees, setAttendees] = useState([]);
  const [selectedEventId, setSelectedEventId] = useState("");
  const [stats, setStats] = useState(EMPTY_STATS);
  const [loadingEvents, setLoadingEvents] = useState(true);
  const [loadingAttendees, setLoadingAttendees] = useState(true);
  const [loadingStats, setLoadingStats] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    getPlannerEvents()
      .then((data) => {
        const list = Array.isArray(data) ? data : [];
        setEvents(list.map(normalizeEvent));
      })
      .catch((err) => {
        setError(err.message || "Could not load planner events.");
      })
      .finally(() => setLoadingEvents(false));

    getAllAttendees()
      .then((data) => {
        const list = Array.isArray(data) ? data : [];
        setAttendees(list.map(normalizeAttendee));
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
        const fillRate = data.fillRate ?? (capacity > 0 ? Math.round((registered / capacity) * 100) : 0);

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

  const attendeeCounts = useMemo(
    () =>
      attendees.reduce((counts, attendee) => {
        counts[attendee.eventId] = (counts[attendee.eventId] || 0) + 1;
        return counts;
      }, {}),
    [attendees]
  );

  const selectedEvent = events.find((event) => event.id === selectedEventId);
  const selectedAttendees = attendees.filter((attendee) => attendee.eventId === selectedEventId);

  const filteredEvents = events.filter((event) => {
    const haystack = `${event.title} ${event.location}`.toLowerCase();
    return haystack.includes(search.toLowerCase());
  });

  const filteredAttendees = selectedAttendees.filter((attendee) => {
    const haystack = `${attendee.name} ${attendee.email} ${attendee.checkInStatus}`.toLowerCase();
    return haystack.includes(search.toLowerCase());
  });

  const handleExportCSV = () => {
    const headers = ["Name", "Email", "Event", "Booked", "Check-in status"];
    const rows = filteredAttendees.map((attendee) => [
      attendee.name,
      attendee.email,
      attendee.eventTitle,
      attendee.booked,
      attendee.checkInStatus,
    ]);
    const csv = [headers, ...rows].map((row) => row.map(escapeCsvCell).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${selectedEvent?.title || "event"}-attendees.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const loading = loadingEvents || loadingAttendees;

  return (
    <div className="p-4 md:p-8 w-full">
      <div className="max-w-5xl mx-auto space-y-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Attendees</h1>
            <p className="text-sm text-gray-500 mt-1">
              {selectedEvent ? selectedEvent.title : "Choose an event to view its attendee list."}
            </p>
          </div>

          {selectedEvent && (
            <button
              type="button"
              onClick={() => {
                setSelectedEventId("");
                setSearch("");
              }}
              className="inline-flex items-center gap-2 rounded-xl border border-black/10 bg-white px-4 py-2 text-sm font-semibold text-gray-700 shadow-sm hover:bg-gray-50 transition cursor-pointer"
            >
              <ArrowLeft size={15} />
              Events
            </button>
          )}
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 text-sm rounded-xl px-4 py-3">
            {error}
          </div>
        )}

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {loadingStats
            ? Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="bg-white border border-black/10 rounded-2xl shadow-sm flex flex-col items-center py-6 px-3">
                  <div className="h-8 w-12 rounded-md bg-slate-100 animate-pulse mb-2" />
                  <div className="h-3 w-16 rounded bg-slate-100 animate-pulse" />
                </div>
              ))
            : stats.map((stat) => (
                <div key={stat.label} className="bg-white border border-black/10 rounded-2xl shadow-sm flex flex-col items-center py-6 px-3">
                  <span className="text-2xl font-bold text-gray-900">{stat.value}</span>
                  <span className="text-xs text-gray-500 mt-1">{stat.label}</span>
                </div>
              ))}
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              className="w-full pl-9 pr-4 py-2.5 bg-white border border-black/10 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-400 shadow-sm"
              placeholder={selectedEvent ? "Search attendees..." : "Search events..."}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          {selectedEvent && (
            <button
              onClick={handleExportCSV}
              disabled={filteredAttendees.length === 0}
              className="flex items-center justify-center gap-2 bg-white border border-black/10 rounded-xl px-5 py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-50 shadow-sm transition cursor-pointer whitespace-nowrap disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Download size={14} /> Export CSV
            </button>
          )}
        </div>

        {!selectedEvent ? (
          <div className="grid sm:grid-cols-2 gap-4">
            {loading ? (
              <div className="sm:col-span-2 flex items-center justify-center py-16 text-slate-400 gap-2 bg-white border border-black/10 rounded-2xl">
                <Loader2 size={20} className="animate-spin" />
                <span className="text-sm">Loading events...</span>
              </div>
            ) : filteredEvents.length === 0 ? (
              <div className="sm:col-span-2 text-center text-gray-400 text-sm py-12 bg-white border border-black/10 rounded-2xl">
                No events found.
              </div>
            ) : (
              filteredEvents.map((event) => {
                const registered = attendeeCounts[event.id] || 0;
                const fillRate = event.capacity > 0 ? Math.round((registered / event.capacity) * 100) : 0;

                return (
                  <button
                    type="button"
                    key={event.id}
                    onClick={() => {
                      setSelectedEventId(event.id);
                      setSearch("");
                    }}
                    className="text-left bg-white border border-black/10 rounded-2xl shadow-sm p-5 hover:border-blue-200 hover:shadow-md transition cursor-pointer"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <h2 className="text-base font-bold text-gray-900">{event.title}</h2>
                        <p className="text-xs text-gray-500 mt-1">{event.location}</p>
                      </div>
                      <Users size={18} className="text-blue-500 shrink-0" />
                    </div>
                    <div className="mt-5 flex items-end justify-between gap-4">
                      <div>
                        <p className="text-2xl font-bold text-gray-900">
                          {registered}/{event.capacity}
                        </p>
                        <p className="text-xs text-gray-500">registered capacity</p>
                      </div>
                      <p className="text-xs font-semibold text-blue-600">{fillRate}% full</p>
                    </div>
                    <div className="mt-4 h-2 rounded-full bg-slate-100 overflow-hidden">
                      <div className="h-full bg-blue-600" style={{ width: `${Math.min(fillRate, 100)}%` }} />
                    </div>
                    <p className="text-xs text-gray-400 mt-4">{formatDate(event.startDate)}</p>
                  </button>
                );
              })
            )}
          </div>
        ) : (
          <div className="bg-white border border-black/10 rounded-2xl shadow-sm overflow-x-auto">
            <div className="min-w-[720px] grid grid-cols-[1.2fr_1.4fr_0.8fr_0.9fr] gap-4 px-6 py-3 text-xs text-gray-400 font-medium border-b border-black/10 bg-gray-50">
              <span>Name</span>
              <span>Email</span>
              <span className="text-center">Booked</span>
              <span className="text-center">Status</span>
            </div>

            {filteredAttendees.length === 0 ? (
              <div className="text-center text-gray-400 text-sm py-12">
                {search ? `No attendees found matching "${search}"` : "No attendees registered for this event yet."}
              </div>
            ) : (
              filteredAttendees.map((attendee) => (
                <div key={attendee.id} className="min-w-[720px] grid grid-cols-[1.2fr_1.4fr_0.8fr_0.9fr] gap-4 items-center px-6 py-4 border-b border-black/5 last:border-b-0 hover:bg-gray-50 transition">
                  <span className="font-semibold text-gray-900 text-sm truncate">{attendee.name}</span>
                  <span className="text-xs text-gray-500 truncate">{attendee.email}</span>
                  <span className="text-xs text-gray-500 text-center">{attendee.booked}</span>
                  <div className="flex justify-center">
                    <span
                      className={`text-xs font-semibold px-3 py-1 rounded-full ${
                        attendee.checkedInAt ? "bg-green-100 text-green-700" : "bg-amber-100 text-amber-700"
                      }`}
                    >
                      {attendee.checkInStatus}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
}

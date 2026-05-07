import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, Pencil, Trash2, Loader2 } from "lucide-react";
import { getPlannerStats, getPlannerEvents, deleteEvent } from "../api/planner";

const EMPTY_STATS = [
  { value: "0", label: "Events" },
  { value: "0", label: "Attendees" },
  { value: "0%", label: "Fill rate" },
  { value: "0", label: "Capacity" },
];

export default function VendorDashboard() {
  const navigate = useNavigate();
  const [stats, setStats] = useState(EMPTY_STATS);
  const [events, setEvents] = useState([]);
  const [loadingStats, setLoadingStats] = useState(true);
  const [loadingEvents, setLoadingEvents] = useState(true);
  const [deletingId, setDeletingId] = useState(null);
  const [error, setError] = useState("");

  const fetchEvents = () => {
    setLoadingEvents(true);

    getPlannerEvents()
      .then((data) => {
        const list = Array.isArray(data) ? data : [];
        setEvents(list);
      })
      .catch((err) => {
        setError(err.message || "Could not load planner events.");
      })
      .finally(() => setLoadingEvents(false));
  };

  useEffect(() => {
    getPlannerStats()
      .then((data) => {
        setStats([
          { value: String(data.totalEvents ?? 0), label: "Events" },
          { value: String(data.totalAttendees ?? 0), label: "Attendees" },
          { value: `${data.fillRate ?? 0}%`, label: "Fill rate" },
          { value: String(data.totalCapacity ?? 0), label: "Capacity" },
        ]);
      })
      .catch((err) => {
        setError(err.message || "Could not load planner stats.");
      })
      .finally(() => setLoadingStats(false));

    fetchEvents();
  }, []);

  const handleDelete = async (eventId) => {
    if (!window.confirm("Are you sure you want to delete this event?")) {
      return;
    }

    setDeletingId(eventId);
    setError("");

    try {
      await deleteEvent(eventId);
      setEvents((prev) => prev.filter((event) => (event._id || event.id) !== eventId));
    } catch (err) {
      setError(err.message || "Failed to delete event.");
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="p-4 md:p-8 w-full">
      <div className="max-w-5xl mx-auto space-y-7">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <button
            onClick={() => navigate("/planner/events")}
            className="flex items-center gap-2 bg-white border-2 border-gray-900 rounded-full px-5 py-2 text-sm font-semibold hover:bg-gray-900 hover:text-white transition-all cursor-pointer shadow-sm"
          >
            <Plus size={16} /> Create Event
          </button>
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

        <section>
          <h2 className="text-lg font-bold text-gray-800 mb-3">My Events</h2>
          <div className="bg-white border border-black/10 rounded-2xl shadow-sm overflow-hidden">
            <div className="grid grid-cols-3 px-6 py-3 text-xs text-gray-400 font-medium border-b border-black/10 bg-gray-50">
              <span>Event name</span>
              <span className="text-center">Date</span>
              <span className="text-center">Capacity</span>
            </div>

            {loadingEvents ? (
              <div className="flex items-center justify-center py-16 text-slate-400 gap-2">
                <Loader2 size={20} className="animate-spin" />
                <span className="text-sm">Loading events...</span>
              </div>
            ) : events.length === 0 ? (
              <div className="text-center text-gray-400 text-sm py-12">
                No events yet. Create your first event.
              </div>
            ) : (
              events.map((event) => {
                const eventId = event._id || event.id;
                return (
                  <div
                    key={eventId}
                    className="grid grid-cols-3 items-center px-6 py-4 border-b border-black/5 last:border-b-0 hover:bg-gray-50 transition"
                  >
                    <div>
                      <div className="font-semibold text-gray-900 text-sm">
                        {event.title || "Untitled Event"}
                      </div>
                      <div className="text-xs text-gray-400 mt-0.5">
                        {event.location || "Location not set"}
                      </div>
                    </div>
                    <div className="text-center text-xs text-gray-500">
                      {event.startDate
                        ? new Date(event.startDate).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          })
                        : "Date not set"}
                    </div>
                    <div className="flex items-center justify-center gap-2 flex-wrap">
                      <span className="text-xs border rounded-full px-3 py-1 font-medium bg-slate-100 text-slate-700 border-slate-200">
                        {event.capacity ?? 0} seats
                      </span>
                      <div className="flex gap-1">
                        <button
                          onClick={() => navigate(`/planner/events?edit=${eventId}`)}
                          className="p-1.5 hover:bg-gray-100 rounded-lg text-gray-500 transition cursor-pointer"
                          title="Edit event"
                        >
                          <Pencil size={13} />
                        </button>
                        <button
                          onClick={() => handleDelete(eventId)}
                          disabled={deletingId === eventId}
                          className="p-1.5 hover:bg-red-50 rounded-lg text-red-400 transition cursor-pointer disabled:opacity-50"
                          title="Delete event"
                        >
                          {deletingId === eventId ? (
                            <Loader2 size={13} className="animate-spin" />
                          ) : (
                            <Trash2 size={13} />
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </section>

        <section>
          <h2 className="text-lg font-bold text-gray-800 mb-3">Vendors</h2>
          <div className="bg-white border border-black/10 rounded-2xl shadow-sm p-8 text-center text-gray-400 text-sm">
            No vendors assigned yet.
          </div>
        </section>
      </div>
    </div>
  );
}

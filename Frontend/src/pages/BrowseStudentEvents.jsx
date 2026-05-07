import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Search,
  SlidersHorizontal,
  MapPin,
  CalendarDays,
  Loader2,
} from "lucide-react";
import { getEvents } from "../api/student";

const categories = ["All", "Tech", "Social", "Career", "Arts", "Business", "Other"];

const CATEGORY_COLORS = {
  Tech: "bg-blue-100 text-blue-700",
  Social: "bg-purple-100 text-purple-700",
  Career: "bg-orange-100 text-orange-700",
  Arts: "bg-pink-100 text-pink-700",
  Business: "bg-yellow-100 text-yellow-700",
  Other: "bg-gray-100 text-gray-600",
};

const normalizeEvent = (ev) => ({
  id: ev._id || ev.id,
  title: ev.title || ev.name || "Untitled Event",
  date: ev.startDate
    ? new Date(ev.startDate).toLocaleDateString("en-US", {
        month: "long",
        day: "numeric",
        year: "numeric",
      })
    : "Date not set",
  category: ev.category || "Other",
  location: ev.location || "Location not set",
});

export default function BrowseEvents() {
  const [activeCategory, setActiveCategory] = useState("All");
  const [search, setSearch] = useState("");
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    getEvents()
      .then((data) => {
        const list = Array.isArray(data) ? data : [];
        setEvents(list.map(normalizeEvent));
      })
      .catch((err) => {
        setError(err.message || "Failed to load events.");
      })
      .finally(() => setLoading(false));
  }, []);

  const filtered = events.filter((event) => {
    const matchCat =
      activeCategory === "All" || event.category === activeCategory;
    const term = search.toLowerCase();
    const matchSearch =
      event.title.toLowerCase().includes(term) ||
      event.location.toLowerCase().includes(term);
    return matchCat && matchSearch;
  });

  return (
    <div className="flex flex-col items-center px-4 md:px-8 py-8 bg-[#F8FAFC]">
      <div className="w-full max-w-5xl space-y-6">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 text-sm rounded-xl px-4 py-3">
            {error}
          </div>
        )}

        <div className="flex flex-col sm:flex-row items-center gap-3">
          <div className="relative flex-1 w-full">
            <Search
              size={16}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            />
            <input
              type="text"
              placeholder="Search events..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-black/10 bg-white shadow-sm text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
          </div>
          <button className="flex items-center gap-2 border border-black/10 bg-white rounded-xl px-4 py-2.5 text-sm font-medium text-gray-600 shadow-sm hover:bg-gray-50 cursor-pointer shrink-0 w-full sm:w-auto justify-center">
            <SlidersHorizontal size={15} />
            <span>Filter</span>
          </button>
        </div>

        <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-5 py-1.5 rounded-full text-sm font-medium border transition-all cursor-pointer whitespace-nowrap ${
                activeCategory === cat
                  ? "bg-[#0b0220] text-white border-[#0b0220]"
                  : "bg-white text-gray-600 border-gray-200 hover:border-gray-400"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-24 text-slate-400 gap-2">
            <Loader2 size={24} className="animate-spin" />
            <span className="text-sm">Loading events...</span>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {filtered.map((event) => (
              <div
                key={event.id}
                className="bg-white border border-black/10 rounded-2xl shadow-sm overflow-hidden hover:shadow-md hover:-translate-y-0.5 transition-all group"
              >
                <div className="h-36 md:h-40 bg-[#0b0220] flex items-center justify-center">
                  <CalendarDays size={40} className="text-white/20" />
                </div>
                <div className="p-4 space-y-3">
                  <span
                    className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full ${
                      CATEGORY_COLORS[event.category] || CATEGORY_COLORS.Other
                    }`}
                  >
                    {event.category}
                  </span>
                  <p className="font-bold text-gray-900 text-sm md:text-base leading-tight">
                    {event.title}
                  </p>
                  <p className="text-xs text-gray-400 flex items-center gap-1">
                    <CalendarDays size={11} /> {event.date}
                  </p>
                  <p className="text-xs text-gray-400 flex items-center gap-1">
                    <MapPin size={11} /> {event.location}
                  </p>
                  <button
                    onClick={() => navigate(`/student/event/${event.id}`)}
                    className="w-full mt-1 border border-black/10 text-gray-700 text-xs font-bold py-2.5 rounded-lg hover:bg-[#0b0220] hover:text-white transition-colors cursor-pointer"
                  >
                    View Details
                  </button>
                </div>
              </div>
            ))}

            {filtered.length === 0 && (
              <div className="col-span-full text-center py-20 bg-white rounded-2xl border border-dashed border-gray-200">
                <p className="text-gray-400 text-sm italic">
                  {events.length === 0
                    ? "No events found in the database."
                    : `No events found${search ? ` matching "${search}"` : ""}.`}
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

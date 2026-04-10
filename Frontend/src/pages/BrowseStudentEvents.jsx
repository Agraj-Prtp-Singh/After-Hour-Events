import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Search,
  SlidersHorizontal,
  MapPin,
  CalendarDays,
} from "lucide-react";

const categories = ["All", "Tech", "Social", "Career", "Arts"];

const events = [
  { id: 1, title: "Tech Summit 2026", date: "March 28 · Kathmandu", category: "Tech", categoryColor: "bg-blue-100 text-blue-700" },
  { id: 2, title: "Design Workshop", date: "April 23 · Kathmandu", category: "Design", categoryColor: "bg-green-100 text-green-700" },
  { id: 3, title: "Startup Night", date: "April 18 · Lalitpur", category: "Business", categoryColor: "bg-yellow-100 text-yellow-700" },
  { id: 4, title: "Campus Music Fest", date: "April 18 · Outdoor Stage", category: "Social", categoryColor: "bg-purple-100 text-purple-700" },
  { id: 5, title: "Career Fair 2026", date: "May 5 · Kathmandu", category: "Career", categoryColor: "bg-orange-100 text-orange-700" },
  { id: 6, title: "AI & Future Workshop", date: "April 25 · Lab 3B", category: "Tech", categoryColor: "bg-blue-100 text-blue-700" },
];

export default function BrowseEvents() {
  const [activeCategory, setActiveCategory] = useState("All");
  const [search, setSearch] = useState("");
  const navigate = useNavigate();

  const filtered = events.filter((e) => {
    const matchCat = activeCategory === "All" || e.category === activeCategory;
    const matchSearch = e.title.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSearch;
  });

  return (
    <div className="flex flex-col items-center px-4 md:px-8 py-8 bg-[#F8FAFC]">
      <div className="w-full max-w-5xl space-y-6">

        {/* Search + Filter */}
        <div className="flex flex-col sm:flex-row items-center gap-3">
          <div className="relative flex-1 w-full">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search Events..."
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

        {/* Category Pills */}
        <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-5 py-1.5 rounded-full text-sm font-medium border transition-all cursor-pointer whitespace-nowrap
                ${activeCategory === cat
                  ? "bg-[#0b0220] text-white border-[#0b0220]"
                  : "bg-white text-gray-600 border-gray-200 hover:border-gray-400"
                }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Event Cards Grid */}
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
                <span className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full ${event.categoryColor}`}>
                  {event.category}
                </span>
                <p className="font-bold text-gray-900 text-sm md:text-base leading-tight">{event.title}</p>
                <p className="text-xs text-gray-400 flex items-center gap-1">
                  <MapPin size={11} /> {event.date}
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
              <p className="text-gray-400 text-sm italic">No events found matching "{search}"</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
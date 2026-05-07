import { useEffect, useMemo, useState } from "react";
import { getEvents } from "../api/event";

const categoryStyles = [
  {
    chip: "bg-blue-100 text-blue-700",
    button: "bg-blue-200 text-blue-800",
  },
  {
    chip: "bg-green-100 text-green-700",
    button: "bg-green-200 text-green-800",
  },
  {
    chip: "bg-amber-100 text-amber-700",
    button: "bg-amber-200 text-amber-800",
  },
  {
    chip: "bg-rose-100 text-rose-700",
    button: "bg-rose-200 text-rose-800",
  },
];

const formatDate = (value) => {
  if (!value) return "TBD";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "TBD";

  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
};

function EventCard({ event, styleIndex }) {
  const style = categoryStyles[styleIndex % categoryStyles.length];
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <article className="w-72 flex-1 overflow-hidden rounded-3xl bg-white shadow-md transition hover:-translate-y-1 hover:shadow-lg">
      <div className="h-36 rounded-b-3xl bg-[#0b0220]" />

      <div className="space-y-2 p-4">
        <span className={`rounded-full px-3 py-1 text-sm ${style.chip}`}>
          {event.category}
        </span>
        <h2 className="text-lg font-semibold text-slate-900">{event.title}</h2>

        <p className="text-sm text-slate-600">
          {event.date} | {event.location}
        </p>

        <button
          type="button"
          onClick={() => setIsExpanded((current) => !current)}
          aria-expanded={isExpanded}
          className={`mt-2 rounded-full px-4 py-1 text-sm ${style.button}`}
        >
          {isExpanded ? "Hide Details" : "View Details"}
        </button>

        <div
          className={`mt-2 grid transition-all duration-300 ease-out ${
            isExpanded ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
          }`}
        >
          <div className="overflow-hidden">
            <p className="rounded-2xl bg-slate-100 px-3 py-2 text-sm text-slate-700">
              {event.description || "No description available for this event."}
            </p>
          </div>
        </div>
      </div>
    </article>
  );
}

export default function AdminDashboard() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let isMounted = true;

    const loadEvents = async () => {
      setLoading(true);
      setError("");

      try {
        const response = await getEvents({ page: 1, limit: 12 });
        const items = response?.data?.items || [];

        if (!isMounted) return;

        const mappedEvents = items.map((event) => ({
          id: event._id,
          category: event.tags?.[0] || "General",
          title: event.title || "Untitled Event",
          date: formatDate(event.startDate),
          location: event.location || "TBD",
          description: event.description || "",
        }));

        setEvents(mappedEvents);
      } catch (err) {
        if (!isMounted) return;
        setError(err.message || "Could not load events");
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    loadEvents();

    return () => {
      isMounted = false;
    };
  }, []);

  const summaryText = useMemo(() => {
    if (loading) return "Loading events...";
    if (error) return "Unable to load live events.";
    return `${events.length} events listed`;
  }, [events.length, loading, error]);

  return (
    <div className="flex min-h-full flex-col gap-6">
      <section className="flex flex-col gap-3 rounded-[2rem] bg-white px-5 py-5 shadow-[0_24px_60px_rgba(15,23,42,0.08)] md:flex-row md:items-end md:justify-between md:px-6">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
            Snapshot
          </p>
          <h2 className="mt-2 text-2xl font-semibold text-slate-900">
            Upcoming Events
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            Quick view of curated events for admin tracking.
          </p>
        </div>

        <span className="inline-flex w-fit rounded-full bg-slate-100 px-3 py-1 text-sm font-medium text-slate-600">
          {summaryText}
        </span>
      </section>

      <section className="rounded-[2rem] bg-white p-6 shadow-[0_24px_60px_rgba(15,23,42,0.08)] md:p-8">
        {loading ? (
          <p className="text-sm text-slate-500">Fetching latest events...</p>
        ) : null}

        {!loading && error ? (
          <p className="text-sm font-medium text-red-600">{error}</p>
        ) : null}

        {!loading && !error && events.length === 0 ? (
          <p className="text-sm text-slate-500">No published events available yet.</p>
        ) : null}

        {!loading && !error && events.length > 0 ? (
          <div className="flex flex-wrap gap-6">
            {events.map((event, index) => (
              <EventCard key={event.id} event={event} styleIndex={index} />
            ))}
          </div>
        ) : null}
      </section>
    </div>
  );
}

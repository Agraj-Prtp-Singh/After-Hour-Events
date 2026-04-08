// Dummy dynamic data
const events = [
  {
    id: 1,
    category: "Tech",
    title: "Tech Summit 2026",
    date: "March 28",
    location: "Kathmandu",
    color: "bg-blue-100 text-blue-600",
    buttonColor: "bg-blue-200",
  },
  {
    id: 2,
    category: "Design",
    title: "Design Workshop",
    date: "April 23",
    location: "Kathmandu",
    color: "bg-green-100 text-green-600",
    buttonColor: "bg-green-200",
  },
  {
    id: 3,
    category: "Business",
    title: "Startup Night",
    date: "April 18",
    location: "Lalitpur",
    color: "bg-yellow-100 text-yellow-700",
    buttonColor: "bg-yellow-200",
  },
];

function EventCard({ event }) {
  return (
    <article className="w-72 flex-1 overflow-hidden rounded-3xl bg-white shadow-md transition hover:-translate-y-1 hover:shadow-lg">
      <div className="h-36 rounded-b-3xl bg-[#0b0220]" />

      <div className="space-y-2 p-4">
        <span className={`rounded-full px-3 py-1 text-sm ${event.color}`}>
          {event.category}
        </span>

        <h2 className="text-lg font-semibold text-slate-900">{event.title}</h2>

        <p className="text-sm text-slate-600">
          {event.date} | {event.location}
        </p>

        <button
          type="button"
          className={`mt-2 rounded-full px-4 py-1 text-sm ${event.buttonColor}`}
        >
          View Details
        </button>
      </div>
    </article>
  );
}

export default function AdminDashboard() {
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
          {events.length} events listed
        </span>
      </section>

      <section className="rounded-[2rem] bg-white p-6 shadow-[0_24px_60px_rgba(15,23,42,0.08)] md:p-8">
        <div className="flex flex-wrap gap-6">
          {events.map((event) => (
            <EventCard key={event.id} event={event} />
          ))}
        </div>
      </section>
    </div>
  );
}

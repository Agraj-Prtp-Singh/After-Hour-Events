import AdminPageHeader from "./AdminPageHeader";

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
    <div className="w-72 rounded-3xl shadow-md bg-white overflow-hidden transition hover:scale-105 flex-1">
      {/* Top image */}
      <div className="h-36 bg-[#0b0220] rounded-b-3xl"></div>

      <div className="p-4 space-y-2">
        <span className={`px-3 py-1 text-sm rounded-full ${event.color}`}>
          {event.category}
        </span>

        <h2 className="font-semibold text-lg">{event.title}</h2>

        <p className="text-sm text-gray-600">
          {event.date} • {event.location}
        </p>

        <button
          className={`mt-2 px-4 py-1 rounded-full text-sm ${event.buttonColor}`}
        >
          View Details
        </button>
      </div>
    </div>
  );
}

export default function AdminDashboard() {
  return (
    <div className="flex min-h-full flex-col gap-6">
      <AdminPageHeader
        title="Events"
        userName="Aragon Sama"
        userRole="Admin User"
      />

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

function StatCard({ label, value }) {
  return (
    <div className="rounded-[1.75rem] bg-white p-5 shadow-[0_18px_40px_rgba(15,23,42,0.06)]">
      <p className="text-sm font-medium text-slate-500">{label}</p>
      <p className="mt-3 text-3xl font-semibold text-slate-900">{value}</p>
    </div>
  );
}

export default function AdminEventsStats({
  totalEvents,
  approvedEvents,
  rejectedEvents,
  loading,
}) {
  return (
    <div className="grid gap-4 md:grid-cols-3">
      <StatCard label="Total Events" value={loading ? "..." : totalEvents} />
      <StatCard label="Approved Events" value={loading ? "..." : approvedEvents} />
      <StatCard label="Rejected Events" value={loading ? "..." : rejectedEvents} />
    </div>
  );
}
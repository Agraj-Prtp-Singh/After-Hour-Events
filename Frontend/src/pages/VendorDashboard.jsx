import { useMemo } from "react";

const VENDOR_APPLICATIONS_STORAGE_KEY = "vendorApplicationsDummy";

const defaultApplications = [
  {
    id: "app-1",
    status: "Approved",
    appliedDate: "2026-04-10",
    eventDate: "2026-05-18",
    eventName: "Kathmandu Food Carnival",
    stallName: "Himalayan Organic Bites",
  },
  {
    id: "app-2",
    status: "Approved",
    appliedDate: "2026-04-15",
    eventDate: "2026-06-01",
    eventName: "Summer Music Fest",
    stallName: "Fresh Sip Bar",
  },
];

const formatDate = (value) => {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";
  return date.toLocaleDateString();
};

export default function VendorDashboard() {
  const rows = useMemo(() => {
    const saved = JSON.parse(
      localStorage.getItem(VENDOR_APPLICATIONS_STORAGE_KEY) || "[]",
    );
    return saved.length > 0 ? saved : defaultApplications;
  }, []);

  return (
    <div className="w-full bg-[#F4F7FB] p-6 md:p-8">
      <section className="mb-6 rounded-[2rem] bg-[#0F172A] px-6 py-6 text-white shadow-[0_24px_60px_rgba(15,23,42,0.24)] md:px-8">
        <p className="inline-flex rounded-full bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-slate-200">
          Dashboard
        </p>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight">
          Vendor Application Status
        </h1>
        <p className="mt-2 max-w-3xl text-sm text-slate-300 sm:text-base">
          Track your applied events and current approval status.
        </p>
      </section>

      <section className="rounded-[2rem] bg-white p-6 shadow-[0_24px_60px_rgba(15,23,42,0.08)] md:p-8">
        {rows.length === 0 ? (
          <p className="text-sm text-slate-500">
            No event applications found yet.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead>
                <tr className="border-b border-slate-200 text-slate-600">
                  <th className="px-3 py-3 font-semibold">Status</th>
                  <th className="px-3 py-3 font-semibold">Applied Date</th>
                  <th className="px-3 py-3 font-semibold">Event Date</th>
                  <th className="px-3 py-3 font-semibold">Event Name</th>
                  <th className="px-3 py-3 font-semibold">Stall Name</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row) => (
                  <tr key={row.id} className="border-b border-slate-100">
                    <td className="px-3 py-3">
                      <span className="inline-flex rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-semibold text-emerald-700">
                        {row.status}
                      </span>
                    </td>
                    <td className="px-3 py-3 text-slate-700">
                      {formatDate(row.appliedDate)}
                    </td>
                    <td className="px-3 py-3 text-slate-700">
                      {formatDate(row.eventDate)}
                    </td>
                    <td className="px-3 py-3 font-medium text-slate-900">
                      {row.eventName}
                    </td>
                    <td className="px-3 py-3 text-slate-700">
                      {row.stallName}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}

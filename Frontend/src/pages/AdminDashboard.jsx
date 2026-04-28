import AdminDashboard from "../components/AdminDashboardCard";

const AdminDashboardPage = () => {
  return (
    <div className="w-full bg-[#F4F7FB] p-6 md:p-8">
      <section className="mb-6 rounded-[2rem] bg-[#0F172A] px-6 py-6 text-white shadow-[0_24px_60px_rgba(15,23,42,0.24)] md:px-8">
        <p className="inline-flex rounded-full bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-slate-200">
          Dashboard
        </p>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight">
          Admin Control Center
        </h1>
        <p className="mt-2 max-w-3xl text-sm text-slate-300 sm:text-base">
          Monitor ongoing events and quickly access the latest activity from
          your admin panel.
        </p>
      </section>

      <AdminDashboard />
    </div>
  );
};

export default AdminDashboardPage;

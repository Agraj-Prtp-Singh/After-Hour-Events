export default function AdminEventsHero({ totalEvents, loading }) {
  return (
    <div className="rounded-[2rem] bg-[#0F172A] px-6 py-7 text-white shadow-[0_24px_60px_rgba(15,23,42,0.24)] md:px-8">
      <div className="space-y-3 md:flex md:items-start md:justify-between md:gap-4">
        <div>
          <span className="inline-flex w-fit rounded-full bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.24em] text-slate-200">
          Admin Overview
          </span>

          <h1 className="text-3xl font-semibold tracking-tight">
            Event Moderation Panel
          </h1>
          <p className="mt-2 max-w-2xl text-sm text-slate-300 sm:text-base">
            Review incoming events and manage their lifecycle through update,
            approval, rejection, and deletion workflows.
          </p>
        </div>

        <span className="inline-flex h-fit w-fit rounded-full bg-white/10 px-3 py-1 text-sm font-semibold text-slate-200">
          {loading ? "Syncing events..." : `${totalEvents} live events`}
        </span>
      </div>
    </div>
  );
}

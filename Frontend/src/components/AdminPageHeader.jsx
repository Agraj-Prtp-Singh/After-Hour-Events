import { CircleUserRound } from "lucide-react";

export default function AdminPageHeader({
  title,
  userName,
  userRole = "Admin User",
}) {
  return (
    <section className="flex flex-col gap-4 rounded-[18px] bg-white px-4 py-2 shadow-[0_24px_60px_rgba(15,23,42,0.08)] sm:flex-row sm:items-center sm:justify-between">
      <p className="text-5xl font-semibold text-slate-900 md:text-3xl">
        {title}
      </p>

      <div className="flex items-center gap-4 self-start rounded-2xl px-2 py-2 sm:self-auto">
        <div className="flex items-center gap-3">
          <CircleUserRound size={32} className="text-slate-600" />
          <div className="leading-tight">
            <p className="text-lg font-semibold text-slate-900">{userName}</p>
            <p className="text-sm text-slate-500">{userRole}</p>
          </div>
        </div>
      </div>
    </section>
  );
}

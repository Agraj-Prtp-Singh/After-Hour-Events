import { useState } from "react";
import {
  CalendarDays,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  MapPin,
  Pencil,
  Save,
  Trash2,
  Users,
  X,
} from "lucide-react";

function InfoPill({ icon: Icon, label, value }) {
  return (
    <div className="rounded-2xl bg-white px-4 py-3 shadow-sm">
      <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
        <Icon size={14} />
        <span>{label}</span>
      </div>
      <p className="mt-2 text-sm font-medium text-slate-700">{value}</p>
    </div>
  );
}

function FieldInput({ label, type = "text", value, onChange }) {
  return (
    <label>
      <span className="mb-1.5 block text-sm font-medium text-slate-600">
        {label}
      </span>
      <input
        type={type}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-[#4E7BFF] focus:ring-4 focus:ring-[#4E7BFF]/15"
      />
    </label>
  );
}

function ActionButton({
  label,
  icon: Icon,
  onClick,
  variant = "neutral",
  disabled = false,
}) {
  const variants = {
    primary: "bg-[#4E7BFF] text-white hover:bg-[#3E68E5]",
    neutral:
      "border border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50",
    danger: "bg-red-50 text-red-600 hover:bg-red-100",
  };

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`inline-flex items-center gap-2 rounded-full px-4 py-2.5 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-60 ${variants[variant]}`}
    >
      <Icon size={16} />
      {label}
    </button>
  );
}

export default function AdminEventEditCard({
  event,
  isEditing,
  isBusy,
  editForm,
  onEditStart,
  onEditCancel,
  onFieldChange,
  onSave,
  onDelete,
}) {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <article className="rounded-[1.5rem] border border-slate-200 bg-slate-50/80 p-5 transition hover:border-slate-300 hover:shadow-[0_20px_45px_rgba(15,23,42,0.08)]">
      <div className="flex flex-col gap-5 xl:flex-row xl:items-start xl:justify-between">
        <div className="flex-1">
          {isEditing ? (
            <div className="grid gap-3 md:grid-cols-2">
              <label className="md:col-span-2">
                <span className="mb-1.5 block text-sm font-medium text-slate-600">
                  Event title
                </span>
                <input
                  type="text"
                  value={editForm.title}
                  onChange={(eventTarget) =>
                    onFieldChange("title", eventTarget.target.value)
                  }
                  className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-[#4E7BFF] focus:ring-4 focus:ring-[#4E7BFF]/15"
                />
              </label>

              <FieldInput
                label="Date"
                type="date"
                value={editForm.date}
                onChange={(value) => onFieldChange("date", value)}
                label="Start Date"
                type="datetime-local"
                value={editForm.startDate}
                onChange={(value) => onFieldChange("startDate", value)}
              />

              <FieldInput
                label="Location"
                value={editForm.location}
                onChange={(value) => onFieldChange("location", value)}
              />

              <FieldInput
                label="Category"
                value={editForm.category}
                onChange={(value) => onFieldChange("category", value)}
              />

              <FieldInput
                label="Capacity"
                type="number"
                value={editForm.capacity}
                onChange={(value) => onFieldChange("capacity", value)}
              />
            </div>
          ) : (
            <>
              <div className="flex flex-wrap items-center gap-3">
                <h3 className="text-xl font-semibold text-slate-900">
                  {event.title}
                </h3>

                <span className="inline-flex rounded-full bg-slate-200 px-3 py-1 text-xs font-semibold text-slate-700">
                  {event.category || "General"}
                </span>
              </div>

              <div className="mt-4 grid gap-3 text-sm text-slate-600 sm:grid-cols-2 lg:grid-cols-4">
                <InfoPill icon={CalendarDays} label="Date" value={event.date} />
                <InfoPill icon={MapPin} label="Location" value={event.location} />
                <InfoPill icon={Users} label="Capacity" value={event.capacity} />
                <InfoPill icon={CalendarDays} label="Created" value={event.created} />
              </div>

              <div
                className={`mt-3 grid transition-all duration-300 ease-out ${
                  isExpanded
                    ? "grid-rows-[1fr] opacity-100"
                    : "grid-rows-[0fr] opacity-0"
                }`}
              >
                <div className="overflow-hidden">
                  <p className="rounded-2xl bg-white px-4 py-3 text-sm text-slate-700 shadow-sm">
                    {event.description ||
                      "No description available for this event."}
                  </p>
                </div>
              </div>
            </>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-3 xl:justify-end">
          {isEditing ? (
            <>
              <ActionButton
                label="Cancel"
                icon={X}
                onClick={onEditCancel}
                variant="neutral"
                disabled={isBusy}
              />
              <ActionButton
                label={isBusy ? "Saving..." : "Save"}
                icon={Save}
                onClick={onSave}
                variant="primary"
                disabled={isBusy}
              />
            </>
          ) : (
            <>
              <ActionButton
                label={isExpanded ? "Hide Details" : "View Details"}
                icon={isExpanded ? ChevronUp : ChevronDown}
                onClick={() => setIsExpanded((current) => !current)}
                variant="neutral"
                disabled={isBusy}
              />
              <ActionButton
                label="Edit"
                icon={Pencil}
                onClick={onEditStart}
                variant="neutral"
                disabled={isBusy}
              />
              <ActionButton
                label={isBusy ? "Approving..." : "Approve"}
                icon={CheckCircle2}
                onClick={onApprove}
                variant="success"
                disabled={isBusy}
              />
              <ActionButton
                label={isBusy ? "Rejecting..." : "Reject"}
                icon={X}
                onClick={onReject}
                variant="warning"
                disabled={isBusy}
              />
              <ActionButton
                label={isBusy ? "Deleting..." : "Delete"}
                icon={Trash2}
                onClick={onDelete}
                variant="danger"
                disabled={isBusy}
              />
            </>
          )}
        </div>
      </div>
    </article>
  );
}

import { useEffect, useMemo, useState } from "react";
import {
  deleteAdminEvent,
  getAdminEvents,
  reviewAdminEvent,
  updateAdminEvent,
} from "../api/admin";
import AdminEventsHero from "./AdminEventsHero";
import AdminEventsStats from "./AdminEventsStats";
import AdminEventEditCard from "./AdminEventEditCard";

const emptyEditState = {
  title: "",
  startDate: "",
  location: "",
  category: "",
  capacity: "",
};

const formatDisplayDate = (value) => {
  if (!value) return "TBD";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "TBD";
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
};

const formatDateTimeLocal = (value) => {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  const offset = date.getTimezoneOffset();
  const normalized = new Date(date.getTime() - offset * 60000);
  return normalized.toISOString().slice(0, 16);
};

const normalizeEvent = (event) => ({
  id: event._id || event.id,
  title: event.title || "Untitled Event",
  startDate: event.startDate || "",
  date: formatDisplayDate(event.startDate),
  location: event.location || "Location not set",
  category: event.category || "General",
  capacity: String(event.capacity ?? 0),
  created: formatDisplayDate(event.createdAt),
  verified: Boolean(event.isPublished),
  status:
    event.approvalStatus === "approved"
      ? "Approved"
      : event.approvalStatus === "denied"
      ? "Rejected"
      : "Pending",
  raw: event,
});

export default function AdminEventCards() {
  const [events, setEvents] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState(emptyEditState);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [activeActionId, setActiveActionId] = useState(null);
  const [rejectedEventsCount, setRejectedEventsCount] = useState(0);

  const fetchEvents = () => {
    setLoading(true);
    setError("");

    getAdminEvents({ limit: 100 })
      .then((data) => {
        const list = Array.isArray(data) ? data : [];
        setEvents(list.map(normalizeEvent));
      })
      .catch((err) => {
        setError(err.message || "Failed to load events.");
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  const now = Date.now();

  const approvedEvents = useMemo(
    () => events.filter((event) => event.status === "Approved").length,
    [events]
  );

  const totalEvents = useMemo(
    () => events.length + rejectedEventsCount,
    [events.length, rejectedEventsCount]
  );

  const handleEditStart = (event) => {
    setEditingId(event.id);
    setEditForm({
      title: event.title,
      startDate: formatDateTimeLocal(event.startDate),
      location: event.location,
      category: event.category,
      capacity: event.capacity,
    });
  };

  const handleEditCancel = () => {
    setEditingId(null);
    setEditForm(emptyEditState);
  };

  const handleFieldChange = (field, value) => {
    setEditForm((currentForm) => ({ ...currentForm, [field]: value }));
  };

  const handleSave = async (id) => {
    setSaving(true);
    setError("");

    try {
      const updated = await updateAdminEvent(id, {
        title: editForm.title,
        startDate: editForm.startDate || undefined,
        location: editForm.location,
        category: editForm.category || undefined,
        capacity: editForm.capacity ? Number(editForm.capacity) : 0,
      });

      setEvents((currentEvents) =>
        currentEvents.map((event) =>
          event.id === id ? normalizeEvent(updated) : event
        )
      );
      setEditingId(null);
      setEditForm(emptyEditState);
    } catch (err) {
      setError(err.message || "Failed to update event.");
    } finally {
      setSaving(false);
    }
  };

  const handleApprove = async (id) => {
    setActiveActionId(id);
    setError("");

    try {
      await reviewAdminEvent(id, "approved");
      setEvents((currentEvents) =>
        currentEvents.map((event) =>
          event.id === id ? { ...event, status: "Approved" } : event
        )
      );
    } catch (err) {
      setError(err.message || "Failed to approve event.");
    } finally {
      setActiveActionId(null);
    }
  };

  const handleReject = async (id) => {
    setActiveActionId(id);
    setError("");

    try {
      await reviewAdminEvent(id, "denied", "Rejected by admin");
      setEvents((currentEvents) => currentEvents.filter((event) => event.id !== id));
      setRejectedEventsCount((currentCount) => currentCount + 1);

      if (editingId === id) {
        setEditingId(null);
        setEditForm(emptyEditState);
      }
    } catch (err) {
      setError(err.message || "Failed to reject event.");
    } finally {
      setActiveActionId(null);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this event?")) return;

    setDeletingId(id);
    setError("");

    try {
      await deleteAdminEvent(id);
      setEvents((currentEvents) =>
        currentEvents.filter((event) => event.id !== id)
      );

      if (editingId === id) {
        setEditingId(null);
        setEditForm(emptyEditState);
      }
    } catch (err) {
      setError(err.message || "Failed to delete event.");
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <section className="w-full">
      <div className="mx-auto max-w-7xl space-y-6">
        <AdminEventsHero totalEvents={events.length} loading={loading} />

        <AdminEventsStats
          totalEvents={totalEvents}
          approvedEvents={approvedEvents}
          rejectedEvents={rejectedEventsCount}
          loading={loading}
        />

        {error && (
          <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
            {error}
          </div>
        )}

        <div className="rounded-[2rem] bg-white p-4 shadow-[0_24px_60px_rgba(15,23,42,0.08)] sm:p-6">
          <div className="mb-6 flex flex-col gap-2 border-b border-slate-100 pb-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-xl font-semibold text-slate-900">
                Active Events
              </h2>
              <p className="text-sm text-slate-500">
                Track publishing status and organizer-facing updates.
              </p>
            </div>

            <span className="inline-flex w-fit rounded-full bg-slate-100 px-3 py-1 text-sm font-medium text-slate-600">
              {loading ? "Syncing..." : `${events.length} managed events`}
            </span>
          </div>

          {loading ? (
            <p className="text-sm text-slate-500">Loading event list...</p>
          ) : null}

          {!loading && events.length === 0 ? (
            <p className="text-sm text-slate-500">No published events found.</p>
          ) : null}

          {!loading && events.length > 0 ? (
            <div className="space-y-4">
              {events.map((event) => {
                const isEditing = editingId === event.id;
                const isBusy =
                  activeActionId === event.id ||
                  deletingId === event.id ||
                  saving;

                return (
                  <div key={event.id} className={isBusy ? "opacity-70" : ""}>
                    <AdminEventEditCard
                      event={event}
                      isEditing={isEditing}
                      isBusy={isBusy}
                      editForm={editForm}
                      onEditStart={() => handleEditStart(event)}
                      onEditCancel={handleEditCancel}
                      onFieldChange={handleFieldChange}
                      onSave={() => handleSave(event.id)}
                      onDelete={() => handleDelete(event.id)}
                      onApprove={() => handleApprove(event.id)}
                      onReject={() => handleReject(event.id)}
                    />
                  </div>
                );
              })}
            </div>
          ) : null}
        </div>
      </div>
    </section>
  );
}

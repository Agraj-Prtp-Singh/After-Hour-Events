import { useEffect, useMemo, useState } from "react";
import {
  deleteEvent,
  getEvents,
  updateEvent,
} from "../api/event";
import AdminEventsHero from "./AdminEventsHero";
import AdminEventsStats from "./AdminEventsStats";
import AdminEventEditCard from "./AdminEventEditCard";

const emptyEditState = {
  title: "",
  date: "",
  location: "",
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

const toDateInputValue = (value) => {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return date.toISOString().slice(0, 10);
};

export default function AdminEventCards() {
  const [events, setEvents] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState(emptyEditState);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeActionId, setActiveActionId] = useState(null);
  const [rejectedEventsCount, setRejectedEventsCount] = useState(0);

  const loadEvents = async () => {
    setLoading(true);
    setError("");

    try {
      const response = await getEvents({ page: 1, limit: 100 });
      const items = response?.data?.items || [];

      const mappedEvents = items.map((event) => ({
        id: event._id,
        title: event.title || "Untitled Event",
        location: event.location || "TBD",
        date: formatDisplayDate(event.startDate),
        dateInput: toDateInputValue(event.startDate),
        startDate: event.startDate,
        endDate: event.endDate,
        description: event.description || "",
        verified: Boolean(event.isPublished),
        status: event.isPublished ? "Approved" : "Rejected",
      }));

      setEvents(mappedEvents);
    } catch (err) {
      setError(err.message || "Failed to load events");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadEvents();
  }, []);

  const approvedEvents = useMemo(
    () => events.filter((event) => event.status === "Approved").length,
    [events],
  );

  const totalEvents = useMemo(
    () => events.length + rejectedEventsCount,
    [events.length, rejectedEventsCount],
  );

  const handleEditStart = (event) => {
    setEditingId(event.id);
    setEditForm({
      title: event.title,
      date: event.dateInput,
      location: event.location,
    });
  };

  const handleEditCancel = () => {
    setEditingId(null);
    setEditForm(emptyEditState);
  };

  const handleFieldChange = (field, value) => {
    setEditForm((currentForm) => ({
      ...currentForm,
      [field]: value,
    }));
  };

  const handleSave = async (id) => {
    const targetEvent = events.find((event) => event.id === id);
    if (!targetEvent) return;

    setActiveActionId(id);
    setError("");

    const payload = {
      title: editForm.title.trim(),
      location: editForm.location.trim(),
    };

    if (editForm.date) {
      payload.startDate = new Date(editForm.date).toISOString();
    }

    try {
      await updateEvent(id, payload);
      await loadEvents();
      setEditingId(null);
      setEditForm(emptyEditState);
    } catch (err) {
      setError(err.message || "Failed to update event");
    } finally {
      setActiveActionId(null);
    }
  };

  const handleApprove = async (id) => {
    setActiveActionId(id);
    setError("");

    try {
      await updateEvent(id, { isPublished: true });
      await loadEvents();
    } catch (err) {
      setError(err.message || "Failed to approve event");
    } finally {
      setActiveActionId(null);
    }
  };

  const handleReject = async (id) => {
    setActiveActionId(id);
    setError("");

    try {
      await updateEvent(id, { isPublished: false });
      setEvents((currentEvents) =>
        currentEvents.filter((event) => event.id !== id),
      );
      setRejectedEventsCount((currentCount) => currentCount + 1);

      if (editingId === id) {
        setEditingId(null);
        setEditForm(emptyEditState);
      }
    } catch (err) {
      setError(err.message || "Failed to reject event");
    } finally {
      setActiveActionId(null);
    }
  };

  const handleDelete = async (id) => {
    setActiveActionId(id);
    setError("");

    try {
      await deleteEvent(id);
      setEvents((currentEvents) =>
        currentEvents.filter((event) => event.id !== id),
      );

      if (editingId === id) {
        setEditingId(null);
        setEditForm(emptyEditState);
      }
    } catch (err) {
      setError(err.message || "Failed to delete event");
    } finally {
      setActiveActionId(null);
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

          {error ? (
            <p className="mb-4 rounded-xl bg-red-50 px-4 py-2 text-sm font-medium text-red-600">
              {error}
            </p>
          ) : null}

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
                const isBusy = activeActionId === event.id;

                return (
                  <AdminEventEditCard
                    key={event.id}
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
                );
              })}
            </div>
          ) : null}
        </div>
      </div>
    </section>
  );
}

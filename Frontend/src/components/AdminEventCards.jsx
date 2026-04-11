import { useMemo, useState } from "react";
import AdminEventsHero from "./AdminEventsHero";
import AdminEventsStats from "./AdminEventsStats";
import AdminEventEditCard from "./AdminEventEditCard";

const initialEvents = [
  {
    id: 1,
    title: "AI Leadership Forum",
    date: "Mar 30, 2026",
    location: "Kathmandu",
    verified: true,
    status: "Approved",
  },
  {
    id: 2,
    title: "Tech Meetup",
    date: "Apr 10, 2026",
    location: "Lalitpur",
    verified: false,
    status: "Pending Review",
  },
  {
    id: 3,
    title: "Founder Networking Night",
    date: "Apr 18, 2026",
    location: "Bhaktapur",
    verified: true,
    status: "Approved",
  },
];

const emptyEditState = {
  title: "",
  date: "",
  location: "",
  status: "",
};

const isEventFinalized = (status) =>
  status === "Approved" || status === "Rejected";

export default function AdminEventCards() {
  const [events, setEvents] = useState(initialEvents);
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState(emptyEditState);

  const approvedEvents = useMemo(
    () => events.filter((event) => event.status === "Approved").length,
    [events],
  );

  const rejectedEvents = useMemo(
    () => events.filter((event) => event.status === "Rejected").length,
    [events],
  );

  const handleDelete = (id) => {
    const targetEvent = events.find((event) => event.id === id);
    if (!targetEvent || isEventFinalized(targetEvent.status)) {
      return;
    }

    setEvents((currentEvents) =>
      currentEvents.filter((event) => event.id !== id),
    );

    if (editingId === id) {
      setEditingId(null);
      setEditForm(emptyEditState);
    }
  };

  const handleEditStart = (event) => {
    if (isEventFinalized(event.status)) {
      return;
    }

    setEditingId(event.id);
    setEditForm({
      title: event.title,
      date: event.date,
      location: event.location,
      status: event.status,
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

  const handleSave = (id) => {
    const targetEvent = events.find((event) => event.id === id);
    if (!targetEvent || isEventFinalized(targetEvent.status)) {
      return;
    }

    setEvents((currentEvents) =>
      currentEvents.map((event) =>
        event.id === id ? { ...event, ...editForm } : event,
      ),
    );

    setEditingId(null);
    setEditForm(emptyEditState);
  };

  const handleApprove = (id) => {
    const targetEvent = events.find((event) => event.id === id);
    if (!targetEvent || isEventFinalized(targetEvent.status)) {
      return;
    }

    setEvents((currentEvents) =>
      currentEvents.map((event) =>
        event.id === id
          ? { ...event, status: "Approved", verified: true }
          : event,
      ),
    );
  };

  const handleReject = (id) => {
    const targetEvent = events.find((event) => event.id === id);
    if (!targetEvent || isEventFinalized(targetEvent.status)) {
      return;
    }

    setEvents((currentEvents) =>
      currentEvents.map((event) =>
        event.id === id
          ? { ...event, status: "Rejected", verified: false }
          : event,
      ),
    );
  };

  return (
    <section className="w-full">
      <div className="mx-auto max-w-7xl space-y-6">
        <AdminEventsHero />

        <AdminEventsStats
          totalEvents={events.length}
          approvedEvents={approvedEvents}
          rejectedEvents={rejectedEvents}
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
              {events.length} managed events
            </span>
          </div>

          <div className="space-y-4">
            {events.map((event) => {
              const isEditing = editingId === event.id;

              return (
                <AdminEventEditCard
                  key={event.id}
                  event={event}
                  isEditing={isEditing}
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
        </div>
      </div>
    </section>
  );
}

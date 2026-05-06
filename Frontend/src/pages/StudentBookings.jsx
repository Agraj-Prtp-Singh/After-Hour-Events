import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Clock,
  MapPin,
  QrCode,
  ChevronRight,
  Loader2,
  XCircle,
} from "lucide-react";
import { getStudentBookings, cancelBooking } from "../api/student";

function normalizeBooking(registration) {
  const event = registration.eventId || registration.event || {};
  const startDate = event.startDate ? new Date(event.startDate) : null;

  return {
    id: registration._id || registration.id,
    eventId: event._id || event.id,
    title: event.title || "Untitled Event",
    month: startDate
      ? startDate.toLocaleString("en-US", { month: "short" })
      : "--",
    day: startDate ? String(startDate.getDate()) : "--",
    time: startDate
      ? startDate.toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        })
      : "Time not set",
    location: event.location || "Location not set",
    status: registration.status === "cancelled" ? "Cancelled" : "Confirmed",
    ticketCode: registration.ticketCode || "",
    qrCodeDataUrl: registration.qrCodeDataUrl || "",
  };
}

export default function MyBookings() {
  const navigate = useNavigate();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cancelingId, setCancelingId] = useState(null);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    getStudentBookings()
      .then((data) => {
        const list = Array.isArray(data) ? data : [];
        setBookings(list.map(normalizeBooking));
      })
      .catch((err) => {
        setError(err.message || "Failed to load bookings.");
      })
      .finally(() => setLoading(false));
  }, []);

  const handleCancel = async (bookingId) => {
    if (!window.confirm("Cancel this booking?")) {
      return;
    }

    setCancelingId(bookingId);
    setError("");

    try {
      await cancelBooking(bookingId);
      setBookings((prev) =>
        prev.map((booking) =>
          booking.id === bookingId
            ? { ...booking, status: "Cancelled" }
            : booking
        )
      );
    } catch (err) {
      setError(err.message || "Failed to cancel booking.");
    } finally {
      setCancelingId(null);
    }
  };

  return (
    <div className="flex flex-col items-center px-4 md:px-8 py-8 bg-[#F8FAFC]">
      <div className="w-full max-w-3xl space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-900">My Bookings</h2>
          {!loading && (
            <span className="text-xs font-medium px-3 py-1 bg-gray-100 rounded-full text-gray-500">
              {bookings.length} total
            </span>
          )}
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 text-sm rounded-xl px-4 py-3">
            {error}
          </div>
        )}

        {loading ? (
          <div className="flex items-center justify-center py-24 text-slate-400 gap-2">
            <Loader2 size={24} className="animate-spin" />
            <span className="text-sm">Loading bookings...</span>
          </div>
        ) : bookings.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-2xl border border-dashed border-gray-200">
            <p className="text-gray-400 text-sm">No bookings yet.</p>
            <button
              onClick={() => navigate("/student/browse")}
              className="mt-4 text-blue-500 text-sm font-medium hover:underline cursor-pointer"
            >
              Browse events
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {bookings.map((booking) => (
              <div
                key={booking.id}
                className="bg-white border border-black/10 rounded-2xl shadow-sm px-4 md:px-6 py-5 hover:shadow-md transition-shadow"
              >
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3 md:gap-4 min-w-0">
                    <div className="bg-[#0b0220] text-white rounded-xl px-2.5 md:px-3 py-2 text-center shrink-0 min-w-[46px] md:min-w-[52px]">
                      <p className="text-[9px] md:text-[10px] font-medium opacity-60 uppercase">
                        {booking.month}
                      </p>
                      <p className="text-lg md:text-xl font-bold leading-tight">
                        {booking.day}
                      </p>
                    </div>

                    <div className="min-w-0">
                      <p className="font-bold text-gray-900 text-sm md:text-base truncate">
                        {booking.title}
                      </p>
                      <p className="text-[11px] text-gray-400 mt-0.5">{booking.id}</p>
                      <div className="flex flex-wrap items-center gap-2 md:gap-3 mt-1.5 text-gray-400 text-xs">
                        <span className="flex items-center gap-1 shrink-0">
                          <Clock size={10} /> {booking.time}
                        </span>
                        <span className="flex items-center gap-1 truncate">
                          <MapPin size={10} /> {booking.location}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col items-end gap-2 shrink-0">
                    <span
                      className={`text-[10px] md:text-xs font-semibold px-2.5 md:px-3 py-1 rounded-full ${
                        booking.status === "Confirmed"
                          ? "bg-green-100 text-green-700"
                          : booking.status === "Cancelled"
                          ? "bg-red-100 text-red-500"
                          : "bg-yellow-100 text-yellow-700"
                      }`}
                    >
                      {booking.status}
                    </span>

                    {booking.status === "Confirmed" && (
                      <button
                        onClick={() => setSelectedTicket(booking)}
                        className="flex items-center gap-1.5 text-blue-500 text-xs font-medium hover:underline cursor-pointer"
                      >
                        <QrCode size={12} />
                        View QR <ChevronRight size={11} />
                      </button>
                    )}

                    {booking.status === "Confirmed" && (
                      <button
                        onClick={() => handleCancel(booking.id)}
                        disabled={cancelingId === booking.id}
                        className="flex items-center gap-1 text-red-400 text-xs font-medium hover:underline cursor-pointer disabled:opacity-50"
                      >
                        {cancelingId === booking.id ? (
                          <Loader2 size={11} className="animate-spin" />
                        ) : (
                          <XCircle size={11} />
                        )}
                        Cancel
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="pt-4">
          <button
            onClick={() => navigate("/student/browse")}
            className="border border-black/10 bg-white text-gray-700 font-semibold px-6 py-2.5 rounded-xl hover:bg-gray-50 transition-colors cursor-pointer text-sm shadow-sm"
          >
            Browse more events
          </button>
        </div>
      </div>

      {selectedTicket && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4">
          <div className="w-full max-w-sm rounded-2xl bg-white p-6 text-center shadow-2xl">
            <h3 className="text-xl font-bold text-gray-900">Event Ticket</h3>
            <p className="mt-1 text-sm text-gray-500">{selectedTicket.title}</p>

            <div className="my-5 flex justify-center">
              {selectedTicket.qrCodeDataUrl ? (
                <img
                  src={selectedTicket.qrCodeDataUrl}
                  alt="Ticket QR code"
                  className="h-56 w-56 rounded-xl border border-slate-200 bg-white p-2"
                />
              ) : (
                <div className="flex h-56 w-56 items-center justify-center rounded-xl border border-dashed border-slate-300 bg-slate-50 px-4 text-sm text-slate-500">
                  QR code was not generated for this older booking. Cancel and book again to issue a new QR ticket.
                </div>
              )}
            </div>

            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
              Ticket Code
            </p>
            <p className="mt-1 font-mono text-sm font-bold text-slate-900">
              {selectedTicket.ticketCode || "Not issued"}
            </p>

            <div className="mt-6 flex gap-3">
              <button
                type="button"
                onClick={() => setSelectedTicket(null)}
                className="flex-1 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50"
              >
                Close
              </button>
              {selectedTicket.eventId && (
                <button
                  type="button"
                  onClick={() => navigate(`/student/event/${selectedTicket.eventId}`)}
                  className="flex-1 rounded-xl bg-[#0b0220] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#19024d]"
                >
                  Event Details
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

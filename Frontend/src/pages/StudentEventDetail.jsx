import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  CalendarDays,
  MapPin,
  Users,
  ArrowLeft,
  Clock,
  Loader2,
} from "lucide-react";
import { bookEvent, getEventById, getStudentBookings } from "../api/student";

const CATEGORY_COLORS = {
  Tech: "bg-blue-100 text-blue-700",
  Social: "bg-purple-100 text-purple-700",
  Career: "bg-orange-100 text-orange-700",
  Arts: "bg-pink-100 text-pink-700",
  Business: "bg-yellow-100 text-yellow-700",
  Other: "bg-gray-100 text-gray-600",
};

export default function StudentEventDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [event, setEvent] = useState(null);
  const [booked, setBooked] = useState(false);
  const [loading, setLoading] = useState(true);
  const [booking, setBooking] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let isMounted = true;

    Promise.all([getEventById(id), getStudentBookings().catch(() => [])])
      .then(([eventData, bookings]) => {
        if (!isMounted) {
          return;
        }

        setEvent(eventData);
        const list = Array.isArray(bookings) ? bookings : [];
        const alreadyBooked = list.some((registration) => {
          const registrationEventId =
            registration.eventId?._id || registration.eventId || registration.event?.id;
          return String(registrationEventId) === String(id);
        });
        setBooked(alreadyBooked);
      })
      .catch((err) => {
        if (isMounted) {
          setError(err.message || "Failed to load event details.");
        }
      })
      .finally(() => {
        if (isMounted) {
          setLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [id]);

  const startDate = useMemo(
    () => (event?.startDate ? new Date(event.startDate) : null),
    [event]
  );

  const handleBook = async () => {
    setBooking(true);
    setError("");

    try {
      await bookEvent(id);
      setBooked(true);
      setTimeout(() => navigate("/student/bookings"), 1000);
    } catch (err) {
      setError(err.message || "Failed to book this event.");
    } finally {
      setBooking(false);
    }
  };

  return (
    <div className="flex flex-col items-center px-4 md:px-8 py-8 bg-[#F8FAFC]">
      <div className="w-full max-w-3xl">
        <button
          onClick={() => navigate("/student/browse")}
          className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-800 mb-6 cursor-pointer transition-colors"
        >
          <ArrowLeft size={15} />
          Back to Browse
        </button>

        {loading ? (
          <div className="flex items-center justify-center gap-2 rounded-2xl bg-white py-24 text-slate-400 shadow-md">
            <Loader2 size={20} className="animate-spin" />
            <span className="text-sm">Loading event details...</span>
          </div>
        ) : error ? (
          <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
            {error}
          </div>
        ) : !event ? (
          <div className="rounded-2xl border border-dashed border-slate-200 px-4 py-12 text-center text-sm text-slate-400 bg-white">
            Event not found.
          </div>
        ) : (
          <div className="bg-white border border-black/10 rounded-2xl shadow-md overflow-hidden">
            <div className="h-44 md:h-52 bg-[#0b0220] flex items-center justify-center relative">
              <CalendarDays size={56} className="text-white/10" />
              <span
                className={`absolute top-4 left-4 text-xs font-semibold px-3 py-1 rounded-full ${
                  CATEGORY_COLORS[event.category || "Other"] || CATEGORY_COLORS.Other
                }`}
              >
                {event.category || "Other"}
              </span>
            </div>

            <div className="p-6 md:p-8 space-y-5">
              <h2 className="text-2xl md:text-3xl font-bold text-gray-900">
                {event.title}
              </h2>

              <div className="flex flex-wrap items-center gap-4 md:gap-6 text-sm text-gray-500">
                <span className="flex items-center gap-1.5">
                  <CalendarDays size={16} className="text-[#0b0220]" />
                  {startDate
                    ? startDate.toLocaleDateString("en-US", {
                        weekday: "short",
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })
                    : "Date not set"}
                </span>
                <span className="flex items-center gap-1.5">
                  <Clock size={16} className="text-[#0b0220]" />
                  {startDate
                    ? startDate.toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })
                    : "Time not set"}
                </span>
                <span className="flex items-center gap-1.5">
                  <MapPin size={16} className="text-[#0b0220]" />
                  {event.location || "Location not set"}
                </span>
                <span className="flex items-center gap-1.5 font-medium text-blue-600">
                  <Users size={16} /> Capacity {event.capacity ?? 0}
                </span>
              </div>

              <hr className="border-black/5" />

              <div className="space-y-2">
                <h3 className="font-bold text-gray-900">About this Event</h3>
                <p className="text-sm md:text-base text-gray-600 leading-relaxed">
                  {event.description || "No description provided yet."}
                </p>
              </div>

              <div className="flex items-center justify-between bg-gray-50 p-4 rounded-xl border border-black/5">
                <div>
                  <p className="text-[10px] text-gray-400 uppercase font-bold tracking-wider">
                    Organised by
                  </p>
                  <p className="text-sm font-semibold text-gray-800 mt-0.5">
                    {event.createdBy?.fullName || "AfterHour Events"}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-[10px] text-gray-400 uppercase font-bold tracking-wider">
                    Ticket Price
                  </p>
                  <p className="text-xl font-black text-[#0b0220] mt-0.5">
                    Rs. {event.ticketPrice ?? 0}
                  </p>
                </div>
              </div>

              <button
                onClick={handleBook}
                disabled={booked || booking}
                className={`w-full py-4 rounded-xl text-base font-bold transition-all shadow-lg ${
                  booked
                    ? "bg-green-500 text-white cursor-default"
                    : "bg-[#0b0220] hover:bg-[#19024d] text-white cursor-pointer hover:scale-[1.01] active:scale-[0.98]"
                } ${booking ? "opacity-80" : ""}`}
              >
                {booking
                  ? "Booking..."
                  : booked
                  ? "Booking Confirmed!"
                  : "Book My Spot Now"}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

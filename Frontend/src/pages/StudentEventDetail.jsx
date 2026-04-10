import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  CalendarDays,
  MapPin,
  Users,
  ArrowLeft,
  Clock,
} from "lucide-react";

const event = {
  id: 1,
  title: "Tech Summit 2026",
  date: "Fri Mar 27 2026",
  time: "10:00 AM",
  location: "Kathmandu",
  spotsRemaining: 96,
  description:
    "Hey everyone come and join us for the biggest tech gathering of the year! Network with industry leaders, attend insightful talks, and explore the latest innovations in technology.",
  organizer: "AfterHour Events",
  price: "Rs. 101",
  category: "Tech",
  categoryColor: "bg-blue-100 text-blue-700",
};

export default function StudentEventDetail() {
  const [booked, setBooked] = useState(false);
  const navigate = useNavigate();

  const handleBook = () => {
    setBooked(true);
    // Simulating a delay before moving to bookings
    setTimeout(() => navigate("/student/bookings"), 1200);
  };

  return (
    <div className="flex flex-col items-center px-4 md:px-8 py-8 bg-[#F8FAFC]">
      <div className="w-full max-w-3xl">

        {/* Back button */}
        <button
          onClick={() => navigate("/student/browse")}
          className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-800 mb-6 cursor-pointer transition-colors"
        >
          <ArrowLeft size={15} />
          Back to Browse
        </button>

        {/* Event Detail Card */}
        <div className="bg-white border border-black/10 rounded-2xl shadow-md overflow-hidden">

          {/* Banner Placeholder */}
          <div className="h-44 md:h-52 bg-[#0b0220] flex items-center justify-center relative">
            <CalendarDays size={56} className="text-white/10" />
            <span className={`absolute top-4 left-4 text-xs font-semibold px-3 py-1 rounded-full ${event.categoryColor}`}>
              {event.category}
            </span>
          </div>

          {/* Content Area */}
          <div className="p-6 md:p-8 space-y-5">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900">{event.title}</h2>

            {/* Event Metadata */}
            <div className="flex flex-wrap items-center gap-4 md:gap-6 text-sm text-gray-500">
              <span className="flex items-center gap-1.5">
                <CalendarDays size={16} className="text-[#0b0220]" /> {event.date}
              </span>
              <span className="flex items-center gap-1.5">
                <Clock size={16} className="text-[#0b0220]" /> {event.time}
              </span>
              <span className="flex items-center gap-1.5">
                <MapPin size={16} className="text-[#0b0220]" /> {event.location}
              </span>
              <span className="flex items-center gap-1.5 font-medium text-blue-600">
                <Users size={16} /> {event.spotsRemaining} spots left
              </span>
            </div>

            <hr className="border-black/5" />

            <div className="space-y-2">
                <h3 className="font-bold text-gray-900">About this Event</h3>
                <p className="text-sm md:text-base text-gray-600 leading-relaxed">
                    {event.description}
                </p>
            </div>

            {/* Organizer & Price Info */}
            <div className="flex items-center justify-between bg-gray-50 p-4 rounded-xl border border-black/5">
              <div>
                <p className="text-[10px] text-gray-400 uppercase font-bold tracking-wider">Organised by</p>
                <p className="text-sm font-semibold text-gray-800 mt-0.5">{event.organizer}</p>
              </div>
              <div className="text-right">
                <p className="text-[10px] text-gray-400 uppercase font-bold tracking-wider">Ticket Price</p>
                <p className="text-xl font-black text-[#0b0220] mt-0.5">{event.price}</p>
              </div>
            </div>

            {/* Action Button */}
            <button
              onClick={handleBook}
              disabled={booked}
              className={`w-full py-4 rounded-xl text-base font-bold transition-all shadow-lg
                ${booked 
                    ? "bg-green-500 text-white cursor-default" 
                    : "bg-[#0b0220] hover:bg-[#19024d] text-white cursor-pointer hover:scale-[1.01] active:scale-[0.98]"
                }`}
            >
              {booked ? "✓ Booking Confirmed!" : "Book My Spot Now"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
import { useNavigate } from "react-router-dom";
import {
  Clock,
  MapPin,
  QrCode,
  ChevronRight,
} from "lucide-react";

const bookings = [
  {
    id: "BK-2026-001",
    title: "Tech Innovation Summit",
    month: "Mar",
    day: "28",
    time: "10:00 AM",
    location: "Main Hall, Block A",
    status: "Confirmed",
  },
  {
    id: "BK-2026-002",
    title: "Campus Music Fest",
    month: "Apr",
    day: "18",
    time: "6:00 PM",
    location: "Outdoor Stage",
    status: "Confirmed",
  },
  {
    id: "BK-2026-003",
    title: "AI & Future Workshop",
    month: "Apr",
    day: "25",
    time: "2:00 PM",
    location: "Lab 3B",
    status: "Pending",
  },
];

export default function MyBookings() {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col items-center px-4 md:px-8 py-8 bg-[#F8FAFC]">
      <div className="w-full max-w-3xl space-y-6">
        
        {/* Page Header within Content */}
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-900">My Bookings</h2>
          <span className="text-xs font-medium px-3 py-1 bg-gray-100 rounded-full text-gray-500">
            {bookings.length} total
          </span>
        </div>

        {/* Booking Cards */}
        <div className="space-y-4">
          {bookings.map((booking) => (
            <div
              key={booking.id}
              className="bg-white border border-black/10 rounded-2xl shadow-sm px-4 md:px-6 py-5 hover:shadow-md transition-shadow"
            >
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3 md:gap-4 min-w-0">
                  {/* Date block */}
                  <div className="bg-[#0b0220] text-white rounded-xl px-2.5 md:px-3 py-2 text-center shrink-0 min-w-[46px] md:min-w-[52px]">
                    <p className="text-[9px] md:text-[10px] font-medium opacity-60 uppercase">{booking.month}</p>
                    <p className="text-lg md:text-xl font-bold leading-tight">{booking.day}</p>
                  </div>
                  
                  {/* Info */}
                  <div className="min-w-0">
                    <p className="font-bold text-gray-900 text-sm md:text-base truncate">{booking.title}</p>
                    <p className="text-[11px] text-gray-400 mt-0.5">{booking.id}</p>
                    <div className="flex flex-wrap items-center gap-2 md:gap-3 mt-1.5 text-gray-400 text-xs">
                      <span className="flex items-center gap-1 shrink-0"><Clock size={10} /> {booking.time}</span>
                      <span className="flex items-center gap-1 truncate"><MapPin size={10} /> {booking.location}</span>
                    </div>
                  </div>
                </div>

                {/* Right side Actions */}
                <div className="flex flex-col items-end gap-2 shrink-0">
                  <span className={`text-[10px] md:text-xs font-semibold px-2.5 md:px-3 py-1 rounded-full ${
                    booking.status === "Confirmed" ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"
                  }`}>
                    {booking.status}
                  </span>
                  
                  {booking.status === "Confirmed" && (
                    <button
                      onClick={() => navigate(`/student/event/${booking.id}`)}
                      className="flex items-center gap-1.5 text-blue-500 text-xs font-medium hover:underline cursor-pointer"
                    >
                      <QrCode size={12} />
                      View QR <ChevronRight size={11} />
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Browse more CTA */}
        <div className="pt-4">
          <button
            onClick={() => navigate("/student/browse")}
            className="border border-black/10 bg-white text-gray-700 font-semibold px-6 py-2.5 rounded-xl hover:bg-gray-50 transition-colors cursor-pointer text-sm shadow-sm"
          >
            Browse more events
          </button>
        </div>
      </div>
    </div>
  );
}
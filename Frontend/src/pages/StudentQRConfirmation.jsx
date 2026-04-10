import { useNavigate } from "react-router-dom";
import {
  CheckCircle2,
  Download,
  ArrowLeft,
} from "lucide-react";

export default function QRConfirmation() {
  const navigate = useNavigate();

  return (
    <div className="flex-1 flex flex-col items-center justify-center px-4 py-10 bg-[#F8FAFC]">
      
      {/* Confirmation Card */}
      <div className="w-full max-w-md bg-white border border-black/10 rounded-3xl shadow-xl p-8 text-center space-y-6">

        {/* Success Icon */}
        <div className="flex flex-col items-center gap-3">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
            <CheckCircle2 size={32} className="text-green-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900">Booking Confirmed!</h2>
          <p className="text-sm text-gray-500 px-4">
            Show this QR code at the event entrance for quick check-in.
          </p>
        </div>

        {/* Ticket Summary */}
        <div className="bg-gray-50 rounded-2xl border border-black/5 p-5 space-y-4">
          <div className="border-b border-gray-200 pb-3">
            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Booking ID</p>
            <p className="text-sm font-mono font-bold text-gray-800">BK-2026-001</p>
          </div>
          
          <div className="pb-2">
            <p className="text-sm font-bold text-gray-900 leading-tight">Tech Innovation Summit</p>
            <p className="text-xs text-gray-500 mt-1">March 28, 2026 • 10:00 AM</p>
          </div>

          {/* QR Code Placeholder */}
          <div className="flex justify-center py-2">
            <div className="p-3 bg-white border-2 border-gray-100 rounded-xl">
               <svg viewBox="0 0 100 100" className="w-40 h-40">
                <rect x="5" y="5" width="30" height="30" fill="none" stroke="#111" strokeWidth="3"/>
                <rect x="10" y="10" width="20" height="20" fill="#111"/>
                <rect x="65" y="5" width="30" height="30" fill="none" stroke="#111" strokeWidth="3"/>
                <rect x="70" y="10" width="20" height="20" fill="#111"/>
                <rect x="5" y="65" width="30" height="30" fill="none" stroke="#111" strokeWidth="3"/>
                <rect x="10" y="70" width="20" height="20" fill="#111"/>
                {[40,45,50,55,60].map((x) =>
                  [5,10,15,20,25,30,35,40,45,50,55,60,65,70,75,80,85,90].map((y) =>
                    Math.random() > 0.4 ? <rect key={`${x}-${y}`} x={x} y={y} width="4" height="4" fill="#111"/> : null
                  )
                )}
              </svg>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col gap-3 pt-2">
          <button className="w-full flex items-center justify-center gap-2 bg-[#0b0220] text-white text-sm font-bold py-3.5 rounded-xl hover:bg-[#19024d] transition-all cursor-pointer shadow-lg shadow-blue-900/10">
            <Download size={18} />
            Download Ticket (PDF)
          </button>
          
          <button
            onClick={() => navigate("/student/bookings")}
            className="w-full flex items-center justify-center gap-2 border border-black/10 text-gray-600 text-sm font-bold py-3.5 rounded-xl hover:bg-gray-50 transition-colors cursor-pointer"
          >
            <ArrowLeft size={16} />
            Back to My Bookings
          </button>
        </div>
      </div>
    </div>
  );
}
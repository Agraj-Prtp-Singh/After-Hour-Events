import { Users, QrCode, CircleCheck, Bot } from "lucide-react";

export default function Footer() {
  return (
    <div className="bg-[#0b0220] text-gray-300 max-[950px]:overflow-x-auto overflow-visible">
      <div className="flex justify-between items-center px-6 py-4 min-w-[950px]">
        {/* Left */}
        <span className="text-sm whitespace-nowrap">
          ©2026 EMS Collaborative Development
        </span>

        {/* Right */}
        <div className="flex gap-12">
          {/* Role */}
          <div className="flex flex-col items-center text-center min-w-[120px]">
            <Users />
            <span className="font-bold">Role-based</span>
            <span className="text-[10px]">
              Each user type sees only what is relevant
              <br />
              to them. Enforced by JWT middleware.
            </span>
          </div>

          {/* QR */}
          <div className="flex flex-col items-center text-center min-w-[120px]">
            <QrCode />
            <span className="font-bold">QR code ticketing</span>
            <span className="text-[10px]">
              Auto-generated QR codes on every booking.
              <br /> Scanned on event day for instant check-in.
            </span>
          </div>

          {/* Real-Time */}
          <div className="flex flex-col items-center text-center min-w-[120px]">
            <CircleCheck />
            <span className="font-bold">Real-time approvals</span>
            <span className="text-[10px]">
              Events go live only after admin approval.
              <br /> Vendor applications reviewed by planners
            </span>
          </div>

          {/* AI */}
          <div className="flex flex-col items-center text-center min-w-[120px]">
            <Bot />
            <span className="font-bold">AI assistant</span>
            <span className="text-[10px]">
              Context-aware chatbot helps every role
              <br /> navigate the platform and find answers fast
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

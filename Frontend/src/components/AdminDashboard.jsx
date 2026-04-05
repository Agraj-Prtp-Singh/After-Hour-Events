import { User, Search } from "lucide-react";

const userName = {
  id: "userName",
  label: "Aragon Sama",
};
export default function AdminDashboard() {
  return (
    <div>
      <div className="flex items-center justify-between px-8 py-4">
        <p className="text-3xl font-semibold">Events</p>
        <div
          className="flex items-center space-x-2.5 px-4 py-2 rounded-full backdrop-blur-2xl bg-white/30 
shadow-[0_0_20px_rgba(0,0,0,0.15)] 
transition-all duration-300 hover:shadow-[0_0_30px_rgba(0,0,0,0.25)] hover:-translate-y-1 cursor-pointer"
        >
          <User size={25} />
          <p>{userName.label}</p>
        </div>
      </div>
    </div>
  );
}

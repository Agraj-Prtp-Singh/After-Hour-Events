import React from "react";

export default function RolesSection() {
  const roles = [
    { title: "Student", description: "Browse & book", color: "#ef4444" },
    {
      title: "Event Planner",
      description: "Create & manage",
      color: "#22c55e",
    },
    { title: "Vendors", description: "Apply to exhibit", color: "#3b82f6" },
    {
      title: "Administration",
      description: "Full oversight",
      color: "#facc15",
    },
  ];

  return (
    <div className="flex items-center justify-center px-4">
      <div className="card-bg">
        {/* Title */}
        <h2 className="text-center text-base sm:text-lg md:text-xl font-semibold mb-4 sm:mb-6 text-gray-900">
          4 Roles • One platform
        </h2>

        {/* Cards */}
        <div className="space-y-3 sm:space-y-4">
          {roles.map((role, index) => (
            <div
              key={index}
              className="group flex items-center justify-between bg-white/30 backdrop-blur-md rounded-2xl px-4 sm:px-6 py-3 sm:py-4 shadow-lg border border-white/20 transition-all duration-300 hover:shadow-2xl hover:-translate-y-1 cursor-pointer"
            >
              {/* Left Section */}
              <div className="flex items-center gap-3 sm:gap-4">
                <span
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: role.color }}
                ></span>

                <h3 className="text-sm sm:text-base md:text-lg font-semibold text-gray-900 group-hover:text-gray-800 transition">
                  {role.title}
                </h3>
              </div>

              {/* Right Text */}
              <p className="text-xs sm:text-sm text-gray-700 group-hover:text-gray-800 transition">
                {role.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

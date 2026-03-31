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
    <div className="flex items-center justify-center px-4  ">
      <div className="w-full max-w-md sm:max-w-lg md:max-w-xl p-4 sm:p-6 md:p-8 rounded-2xl sm:rounded-3xl bg-gradient-to-br from-gray-900 via-gray-800 to-black text-white shadow-xl">
        {/* Title */}
        <h2 className="text-center text-base sm:text-lg md:text-xl font-semibold mb-4 sm:mb-6">
          4 Roles • One platform
        </h2>

        {/* Cards */}
        <div className="space-y-3 sm:space-y-4">
          {roles.map((role, index) => (
            <div
              key={index}
              className="group flex items-center justify-between bg-white/90 backdrop-blur-md rounded-xl sm:rounded-2xl px-4 sm:px-6 py-3 sm:py-4 shadow-sm border border-gray-200 transition-all duration-300 hover:shadow-lg hover:-translate-y-1 hover:bg-white cursor-pointer"
            >
              {/* Left Section */}
              <div className="flex items-center gap-3 sm:gap-4">
                <span
                  className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full"
                  style={{ backgroundColor: role.color }}
                ></span>

                <h3 className="text-sm sm:text-base md:text-lg font-semibold text-gray-800 group-hover:text-black transition">
                  {role.title}
                </h3>
              </div>

              {/* Right Text */}
              <p className="text-xs sm:text-sm text-gray-500 group-hover:text-gray-700 transition">
                {role.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

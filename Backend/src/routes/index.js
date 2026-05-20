const express = require("express");
const authRoutes = require("./auth.routes");
const eventRoutes = require("./event.routes");
const registrationRoutes = require("./registration.routes");
const chatbotRoutes = require("./chatbot.routes");
const studentRoutes = require("./student.routes");
const plannerRoutes = require("./planner.routes");
const vendorRoutes = require("./vendor.routes");
const adminRoutes = require("./admin.routes");

const router = express.Router();

// Base root for mounted API routers. This allows requests to /api and /api/v1
// (depending on how the router is mounted) to return a friendly response.
router.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message: "API root - backend is running",
  });
});

router.get("/health", (req, res) => {
  res.status(200).json({ success: true, message: "Backend is healthy" });
});

router.use("/auth", authRoutes);
router.use("/events", eventRoutes);
router.use("/registrations", registrationRoutes);
router.use("/chatbot", chatbotRoutes);
router.use("/student", studentRoutes);
router.use("/planner", plannerRoutes);
router.use("/vendor", vendorRoutes);
router.use("/admin", adminRoutes);

module.exports = router;

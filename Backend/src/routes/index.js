const express = require('express');
const authRoutes = require('./auth.routes');
const eventRoutes = require('./event.routes');
const registrationRoutes = require('./registration.routes');
const studentRoutes = require('./student.routes');
const plannerRoutes = require('./planner.routes');
const vendorRoutes = require('./vendor.routes');

const router = express.Router();

router.get('/health', (req, res) => {
  res.status(200).json({ success: true, message: 'Backend is healthy' });
});

router.use('/auth', authRoutes);
router.use('/events', eventRoutes);
router.use('/registrations', registrationRoutes);
router.use('/student', studentRoutes);
router.use('/planner', plannerRoutes);
router.use('/vendor', vendorRoutes);

module.exports = router;

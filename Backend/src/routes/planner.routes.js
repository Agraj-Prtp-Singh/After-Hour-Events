const express = require('express');
const plannerController = require('../controllers/planner.controller');
const eventController = require('../controllers/event.controller');
const vendorController = require('../controllers/vendor.controller');
const { authMiddleware, authorize } = require('../middlewares/auth.middleware');
const validateObjectId = require('../middlewares/validateObjectId.middleware');
const { ROLES } = require('../constants/roles');

const router = express.Router();

router.use(authMiddleware, authorize(ROLES.EVENT_PLANNER, ROLES.ADMIN));
router.get('/stats', plannerController.getPlannerStats);
router.get('/events', plannerController.getPlannerEvents);
router.post('/events', eventController.createEvent);
router.put('/events/:id', validateObjectId('id'), eventController.updateEvent);
router.delete('/events/:id', validateObjectId('id'), eventController.deleteEvent);
router.get('/events/:id/attendees', validateObjectId('id'), eventController.listEventRegistrations);
router.get('/attendees', plannerController.getAllAttendees);
router.get('/vendor-applications', vendorController.getPlannerVendorApplications);
router.patch('/vendor-applications/:applicationId/review', validateObjectId('applicationId'), vendorController.reviewVendorApplication);

module.exports = router;

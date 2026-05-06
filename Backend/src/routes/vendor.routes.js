const express = require('express');
const vendorApplicationController = require('../controllers/vendorApplication.controller');
const { authMiddleware, authorize } = require('../middlewares/auth.middleware');
const validateObjectId = require('../middlewares/validateObjectId.middleware');
const { ROLES } = require('../constants/roles');

const router = express.Router();

router.use(authMiddleware, authorize(ROLES.VENDOR, ROLES.ADMIN));
router.get('/events', vendorApplicationController.listAvailableEvents);
router.get('/applications', vendorApplicationController.listMyApplications);
router.post(
  '/events/:eventId/apply',
  validateObjectId('eventId'),
  vendorApplicationController.applyForEvent
);

module.exports = router;

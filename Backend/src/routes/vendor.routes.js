const express = require('express');
const vendorController = require('../controllers/vendor.controller');
const { authMiddleware, authorize } = require('../middlewares/auth.middleware');
const validateObjectId = require('../middlewares/validateObjectId.middleware');
const { ROLES } = require('../constants/roles');

const router = express.Router();

router.use(authMiddleware, authorize(ROLES.VENDOR, ROLES.ADMIN));
router.get('/events', vendorController.getVendorEvents);
router.post('/events/:eventId/apply', validateObjectId('eventId'), vendorController.applyForEvent);
router.post('/apply/:eventId', validateObjectId('eventId'), vendorController.applyForEvent);
router.get('/applications', vendorController.getMyApplications);
router.get('/profile', vendorController.getMyVendorProfile);

module.exports = router;

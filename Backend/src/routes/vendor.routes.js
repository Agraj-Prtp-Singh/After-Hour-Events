const express = require('express');
<<<<<<< HEAD
const vendorApplicationController = require('../controllers/vendorApplication.controller');
=======
const vendorController = require('../controllers/vendor.controller');
>>>>>>> 9ddf807c9db2fcd6990408ed41387411cc9ffd10
const { authMiddleware, authorize } = require('../middlewares/auth.middleware');
const validateObjectId = require('../middlewares/validateObjectId.middleware');
const { ROLES } = require('../constants/roles');

const router = express.Router();

<<<<<<< HEAD
router.use(authMiddleware, authorize(ROLES.VENDOR, ROLES.ADMIN));
router.get('/events', vendorApplicationController.listAvailableEvents);
router.get('/applications', vendorApplicationController.listMyApplications);
router.post(
  '/events/:eventId/apply',
  validateObjectId('eventId'),
  vendorApplicationController.applyForEvent
);
=======
router.use(authMiddleware, authorize(ROLES.VENDOR));
router.get('/events', vendorController.getVendorEvents);
router.post('/apply/:eventId', validateObjectId('eventId'), vendorController.applyForEvent);
router.get('/applications', vendorController.getMyApplications);
router.get('/profile', vendorController.getMyVendorProfile);
>>>>>>> 9ddf807c9db2fcd6990408ed41387411cc9ffd10

module.exports = router;

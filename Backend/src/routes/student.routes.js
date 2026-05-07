const express = require('express');
const studentController = require('../controllers/student.controller');
const { authMiddleware } = require('../middlewares/auth.middleware');
const validateObjectId = require('../middlewares/validateObjectId.middleware');

const router = express.Router();

router.use(authMiddleware);
router.get('/stats', studentController.getStudentStats);
router.get('/bookings', studentController.getStudentBookings);
router.post('/bookings', studentController.bookEvent);
router.delete('/bookings/:bookingId', validateObjectId('bookingId'), studentController.cancelBooking);

module.exports = router;

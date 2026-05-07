const registrationService = require('../services/registration.service');
const asyncHandler = require('../utils/asyncHandler');
const HTTP_STATUS = require('../constants/httpStatus');

const getStudentStats = asyncHandler(async (req, res) => {
  const stats = await registrationService.getStudentStats(req.user.id);

  res.status(HTTP_STATUS.OK).json({
    success: true,
    message: 'Student stats fetched successfully',
    data: stats
  });
});

const getStudentBookings = asyncHandler(async (req, res) => {
  const bookings = await registrationService.listMyRegistrations(req.user.id);

  res.status(HTTP_STATUS.OK).json({
    success: true,
    message: 'Student bookings fetched successfully',
    data: bookings
  });
});

const bookEvent = asyncHandler(async (req, res) => {
  const { eventId } = req.body;
  if (!eventId) {
    return res.status(HTTP_STATUS.BAD_REQUEST).json({
      success: false,
      message: 'eventId is required'
    });
  }

  const registration = await registrationService.registerForEvent(eventId, req.user.id);

  res.status(HTTP_STATUS.CREATED).json({
    success: true,
    message: 'Event booked successfully',
    data: registration
  });
});

const cancelBooking = asyncHandler(async (req, res) => {
  const registration = await registrationService.cancelRegistrationById(req.params.bookingId, req.user.id);

  res.status(HTTP_STATUS.OK).json({
    success: true,
    message: 'Booking cancelled successfully',
    data: registration
  });
});

module.exports = {
  getStudentStats,
  getStudentBookings,
  bookEvent,
  cancelBooking
};

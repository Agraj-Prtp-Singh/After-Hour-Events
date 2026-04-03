const registrationService = require('../services/registration.service');
const asyncHandler = require('../utils/asyncHandler');
const HTTP_STATUS = require('../constants/httpStatus');

const registerForEvent = asyncHandler(async (req, res) => {
  const eventId = req.params.id || req.params.eventId;
  const registration = await registrationService.registerForEvent(eventId, req.user.id);

  res.status(HTTP_STATUS.CREATED).json({
    success: true,
    message: 'Event registration successful',
    data: registration
  });
});

const cancelMyRegistration = asyncHandler(async (req, res) => {
  const eventId = req.params.id || req.params.eventId;
  const registration = await registrationService.cancelRegistration(eventId, req.user.id);

  res.status(HTTP_STATUS.OK).json({
    success: true,
    message: 'Registration cancelled successfully',
    data: registration
  });
});

const listMyRegistrations = asyncHandler(async (req, res) => {
  const registrations = await registrationService.listMyRegistrations(req.user.id);

  res.status(HTTP_STATUS.OK).json({
    success: true,
    message: 'My registrations fetched successfully',
    data: registrations
  });
});

module.exports = {
  registerForEvent,
  cancelMyRegistration,
  listMyRegistrations
};

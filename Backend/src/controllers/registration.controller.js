const registrationService = require('../services/registration.service');
const asyncHandler = require('../utils/asyncHandler');
const HTTP_STATUS = require('../constants/httpStatus');
const AppError = require('../utils/appError');

const registerForEvent = asyncHandler(async (req, res) => {
  const eventId = req.params.id || req.params.eventId;
  const registration = await registrationService.registerForEvent(eventId, req.user.id);

  res.status(HTTP_STATUS.CREATED).json({
    success: true,
    message: 'Event registered successfully',
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

const getMyRegistrations = asyncHandler(async (req, res) => {
  const registrations = await registrationService.listMyRegistrations(req.user.id);

  res.status(HTTP_STATUS.OK).json({
    success: true,
    data: registrations
  });
});

const scanTicketForEventDetails = asyncHandler(async (req, res) => {
  const { token } = req.query;

  if (!token) {
    throw new AppError('Ticket token is required in query parameter ?token=', HTTP_STATUS.BAD_REQUEST);
  }

  const registration = await registrationService.scanTicketForEventDetails(token, req.user.id);

  res.status(HTTP_STATUS.OK).json({
    success: true,
    message: 'Ticket scanned successfully',
    data: registration
  });
});

module.exports = {
  registerForEvent,
  cancelMyRegistration,
  getMyRegistrations,
  register: registerForEvent,
  cancel: cancelMyRegistration,
  listMyRegistrations: getMyRegistrations,
  scanTicketForEventDetails
};

const vendorApplicationService = require('../services/vendorApplication.service');
const asyncHandler = require('../utils/asyncHandler');
const HTTP_STATUS = require('../constants/httpStatus');

const listAvailableEvents = asyncHandler(async (req, res) => {
  const events = await vendorApplicationService.listAvailableEvents();

  res.status(HTTP_STATUS.OK).json({
    success: true,
    message: 'Vendor events fetched successfully',
    data: events
  });
});

const applyForEvent = asyncHandler(async (req, res) => {
  const application = await vendorApplicationService.apply(
    req.params.eventId,
    req.user.id,
    req.body
  );

  res.status(HTTP_STATUS.CREATED).json({
    success: true,
    message: 'Vendor application submitted successfully',
    data: application
  });
});

const listMyApplications = asyncHandler(async (req, res) => {
  const applications = await vendorApplicationService.listMyApplications(req.user.id);

  res.status(HTTP_STATUS.OK).json({
    success: true,
    message: 'Vendor applications fetched successfully',
    data: applications
  });
});

const listPlannerApplications = asyncHandler(async (req, res) => {
  const applications = await vendorApplicationService.listPlannerApplications(req.user.id);

  res.status(HTTP_STATUS.OK).json({
    success: true,
    message: 'Planner vendor applications fetched successfully',
    data: applications
  });
});

const reviewApplication = asyncHandler(async (req, res) => {
  const application = await vendorApplicationService.review(
    req.params.applicationId,
    req.user,
    req.body.decision
  );

  res.status(HTTP_STATUS.OK).json({
    success: true,
    message: 'Vendor application reviewed successfully',
    data: application
  });
});

module.exports = {
  listAvailableEvents,
  applyForEvent,
  listMyApplications,
  listPlannerApplications,
  reviewApplication
};

const eventService = require('../services/event.service');
const asyncHandler = require('../utils/asyncHandler');
const HTTP_STATUS = require('../constants/httpStatus');

const getPlannerStats = asyncHandler(async (req, res) => {
  const stats = await eventService.getPlannerStats(req.user.id);

  res.status(HTTP_STATUS.OK).json({
    success: true,
    message: 'Planner stats fetched successfully',
    data: stats
  });
});

const getPlannerEvents = asyncHandler(async (req, res) => {
  const data = await eventService.listEventsByPlanner(req.user.id, req.query);

  res.status(HTTP_STATUS.OK).json({
    success: true,
    message: 'Planner events fetched successfully',
    data
  });
});

const getAllAttendees = asyncHandler(async (req, res) => {
  const attendees = await eventService.listPlannerAttendees(req.user.id);

  res.status(HTTP_STATUS.OK).json({
    success: true,
    message: 'Planner attendees fetched successfully',
    data: attendees
  });
});

module.exports = {
  getPlannerStats,
  getPlannerEvents,
  getAllAttendees
};

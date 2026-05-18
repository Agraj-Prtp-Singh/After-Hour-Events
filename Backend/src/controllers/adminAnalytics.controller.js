const adminAnalyticsService = require('../services/adminAnalytics.service');
const asyncHandler = require('../utils/asyncHandler');
const HTTP_STATUS = require('../constants/httpStatus');

const getOverview = asyncHandler(async (req, res) => {
  const analytics = await adminAnalyticsService.getOverview(req.query);

  res.status(HTTP_STATUS.OK).json({
    success: true,
    message: 'Admin analytics fetched successfully',
    data: analytics
  });
});

module.exports = {
  getOverview
};
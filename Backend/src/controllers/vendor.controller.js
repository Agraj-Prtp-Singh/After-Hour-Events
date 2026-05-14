const vendorService = require('../services/vendor.service');
const {
  validateVendorApplicationPayload,
  validateVendorApplicationDecisionPayload
} = require('../validators/vendor.validator');
const asyncHandler = require('../utils/asyncHandler');
const HTTP_STATUS = require('../constants/httpStatus');

const getVendorEvents = asyncHandler(async (req, res) => {
  const data = await vendorService.getVendorEvents(req.query);

  res.status(HTTP_STATUS.OK).json({
    success: true,
    message: 'Vendor events fetched successfully',
    data
  });
});

const applyForEvent = asyncHandler(async (req, res) => {
  validateVendorApplicationPayload(req.body);
  const data = await vendorService.applyForEvent(req.params.eventId, req.user.id, req.body);

  res.status(HTTP_STATUS.CREATED).json({
    success: true,
    message: 'Application submitted successfully',
    data
  });
});

const getMyApplications = asyncHandler(async (req, res) => {
  const data = await vendorService.getMyApplications(req.user.id);

  res.status(HTTP_STATUS.OK).json({
    success: true,
    message: 'Vendor applications fetched successfully',
    data
  });
});

const getMyVendorProfile = asyncHandler(async (req, res) => {
  const data = await vendorService.getMyVendorProfile(req.user.id);

  res.status(HTTP_STATUS.OK).json({
    success: true,
    message: 'Vendor profile fetched successfully',
    data
  });
});

const getPlannerVendorApplications = asyncHandler(async (req, res) => {
  const data = await vendorService.listPlannerVendorApplications(req.user.id, req.query);

  res.status(HTTP_STATUS.OK).json({
    success: true,
    message: 'Vendor applications fetched successfully',
    data
  });
});

const reviewVendorApplication = asyncHandler(async (req, res) => {
  validateVendorApplicationDecisionPayload(req.body);

  const data = await vendorService.reviewVendorApplication(req.params.applicationId, req.body.decision, {
    id: req.user.id,
    role: req.user.role,
    rejectionReason: req.body.rejectionReason
  });

  res.status(HTTP_STATUS.OK).json({
    success: true,
    message: `Vendor application ${req.body.decision.toLowerCase()} successfully`,
    data
  });
});

module.exports = {
  getVendorEvents,
  applyForEvent,
  getMyApplications,
  getMyVendorProfile,
  getPlannerVendorApplications,
  reviewVendorApplication
};

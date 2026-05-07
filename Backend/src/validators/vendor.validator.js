const AppError = require('../utils/appError');
const HTTP_STATUS = require('../constants/httpStatus');

function validateVendorApplicationPayload(payload) {
  if (payload.message !== undefined) {
    if (typeof payload.message !== 'string') {
      throw new AppError('message must be a string', HTTP_STATUS.BAD_REQUEST);
    }

    if (payload.message.trim().length > 500) {
      throw new AppError('message must not exceed 500 characters', HTTP_STATUS.BAD_REQUEST);
    }
  }
}

function validateVendorApplicationDecisionPayload(payload) {
  const decision = String(payload.decision || '').trim().toLowerCase();

  if (decision !== 'approved' && decision !== 'rejected') {
    throw new AppError("decision must be either 'approved' or 'rejected'", HTTP_STATUS.BAD_REQUEST);
  }

  if (decision === 'rejected') {
    const rejectionReason = String(payload.rejectionReason || '').trim();
    if (!rejectionReason) {
      throw new AppError('rejectionReason is required when decision is rejected', HTTP_STATUS.BAD_REQUEST);
    }
  }
}

module.exports = {
  validateVendorApplicationPayload,
  validateVendorApplicationDecisionPayload
};

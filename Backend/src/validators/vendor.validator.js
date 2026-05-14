const AppError = require('../utils/appError');
const HTTP_STATUS = require('../constants/httpStatus');

function validateVendorApplicationPayload(payload) {
  if (payload.stallName !== undefined) {
    if (typeof payload.stallName !== 'string') {
      throw new AppError('stallName must be a string', HTTP_STATUS.BAD_REQUEST);
    }

    if (payload.stallName.trim().length > 120) {
      throw new AppError('stallName must not exceed 120 characters', HTTP_STATUS.BAD_REQUEST);
    }
  }

  if (payload.offerings !== undefined) {
    if (typeof payload.offerings !== 'string') {
      throw new AppError('offerings must be a string', HTTP_STATUS.BAD_REQUEST);
    }

    if (payload.offerings.trim().length > 1000) {
      throw new AppError('offerings must not exceed 1000 characters', HTTP_STATUS.BAD_REQUEST);
    }
  }

  if (payload.notes !== undefined) {
    if (typeof payload.notes !== 'string') {
      throw new AppError('notes must be a string', HTTP_STATUS.BAD_REQUEST);
    }

    if (payload.notes.trim().length > 1000) {
      throw new AppError('notes must not exceed 1000 characters', HTTP_STATUS.BAD_REQUEST);
    }
  }

  if (payload.message !== undefined) {
    if (typeof payload.message !== 'string') {
      throw new AppError('message must be a string', HTTP_STATUS.BAD_REQUEST);
    }

    if (payload.message.trim().length > 500) {
      throw new AppError('message must not exceed 500 characters', HTTP_STATUS.BAD_REQUEST);
    }
  }

  if (payload.paymentScreenshot !== undefined) {
    if (typeof payload.paymentScreenshot !== 'string') {
      throw new AppError('paymentScreenshot must be a string', HTTP_STATUS.BAD_REQUEST);
    }

    const screenshot = payload.paymentScreenshot.trim();

    if (!screenshot) {
      return;
    }

    if (!/^data:image\/(png|jpe?g|webp);base64,/i.test(screenshot)) {
      throw new AppError('paymentScreenshot must be a PNG, JPG, or WEBP image data URL', HTTP_STATUS.BAD_REQUEST);
    }

    if (screenshot.length > 2_500_000) {
      throw new AppError('paymentScreenshot must be smaller than 2.5MB', HTTP_STATUS.BAD_REQUEST);
    }
  }
}

function validateVendorApplicationDecisionPayload(payload) {
  const decision = String(payload.decision || '').trim().toLowerCase();

  if (decision !== 'approved' && decision !== 'rejected') {
    throw new AppError("decision must be either 'approved' or 'rejected'", HTTP_STATUS.BAD_REQUEST);
  }

  if (decision === 'rejected' && payload.rejectionReason !== undefined) {
    const rejectionReason = String(payload.rejectionReason || '').trim();

    if (rejectionReason.length > 500) {
      throw new AppError('rejectionReason must not exceed 500 characters', HTTP_STATUS.BAD_REQUEST);
    }
  }
}

module.exports = {
  validateVendorApplicationPayload,
  validateVendorApplicationDecisionPayload
};

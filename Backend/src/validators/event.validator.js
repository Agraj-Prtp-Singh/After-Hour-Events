const AppError = require('../utils/appError');
const HTTP_STATUS = require('../constants/httpStatus');
const { EVENT_APPROVAL_STATUS } = require('../models/event.model');

function isValidDate(value) {
  return !Number.isNaN(new Date(value).getTime());
}

function isImageDataUrl(value) {
  return typeof value === 'string' && /^data:image\/(png|jpe?g|webp);base64,/i.test(value);
}

function validateEventPayload(payload, isUpdate = false) {
  const errors = [];

  const requiredFields = ['title', 'description', 'location', 'startDate', 'endDate', 'capacity'];

  if (!isUpdate) {
    requiredFields.forEach((field) => {
      if (payload[field] === undefined || payload[field] === null || payload[field] === '') {
        errors.push(`${field} is required`);
      }
    });
  }

  if (payload.title !== undefined && payload.title.trim().length < 3) {
    errors.push('title must be at least 3 characters long');
  }

  if (payload.description !== undefined && payload.description.trim().length < 10) {
    errors.push('description must be at least 10 characters long');
  }

  if (payload.startDate !== undefined && !isValidDate(payload.startDate)) {
    errors.push('startDate must be a valid date');
  }

  if (payload.endDate !== undefined && !isValidDate(payload.endDate)) {
    errors.push('endDate must be a valid date');
  }

  if (payload.startDate && payload.endDate) {
    const start = new Date(payload.startDate);
    const end = new Date(payload.endDate);
    if (end <= start) {
      errors.push('endDate must be greater than startDate');
    }
  }

  if (payload.capacity !== undefined && (!Number.isInteger(payload.capacity) || payload.capacity < 1)) {
    errors.push('capacity must be a positive integer');
  }

  if (payload.vendorLimit !== undefined && (!Number.isInteger(payload.vendorLimit) || payload.vendorLimit < 0)) {
    errors.push('vendorLimit must be a non-negative integer');
  }

  if (
    payload.vendorSecurityDeposit !== undefined &&
    (typeof payload.vendorSecurityDeposit !== 'number' || payload.vendorSecurityDeposit < 0)
  ) {
    errors.push('vendorSecurityDeposit must be a non-negative number');
  }

  if (payload.vendorPaymentQrImage !== undefined && payload.vendorPaymentQrImage !== '') {
    if (!isImageDataUrl(payload.vendorPaymentQrImage)) {
      errors.push('vendorPaymentQrImage must be a PNG, JPG, or WEBP image data URL');
    }

    if (String(payload.vendorPaymentQrImage).length > 2_500_000) {
      errors.push('vendorPaymentQrImage must be smaller than 2.5MB');
    }
  }

  if (
    payload.openToVendors !== false &&
    Number(payload.vendorSecurityDeposit || 0) > 0 &&
    !payload.vendorPaymentQrImage
  ) {
    errors.push('vendorPaymentQrImage is required when vendorSecurityDeposit is greater than 0');
  }

  if (payload.tags !== undefined && !Array.isArray(payload.tags)) {
    errors.push('tags must be an array of strings');
  }

  if (errors.length) {
    throw new AppError(errors.join(', '), HTTP_STATUS.BAD_REQUEST);
  }
}

function validateReviewPayload(payload) {
  const decision = String(payload.decision || '').trim().toLowerCase();

  if (decision !== EVENT_APPROVAL_STATUS.APPROVED && decision !== EVENT_APPROVAL_STATUS.DENIED) {
    throw new AppError("decision must be either 'approved' or 'denied'", HTTP_STATUS.BAD_REQUEST);
  }

  if (decision === EVENT_APPROVAL_STATUS.DENIED) {
    const denialReason = String(payload.denialReason || '').trim();
    if (!denialReason) {
      throw new AppError('denialReason is required when decision is denied', HTTP_STATUS.BAD_REQUEST);
    }
  }
}

module.exports = { validateEventPayload, validateReviewPayload };

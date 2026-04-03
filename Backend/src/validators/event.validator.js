const AppError = require('../utils/appError');
const HTTP_STATUS = require('../constants/httpStatus');

function isValidDate(value) {
  return !Number.isNaN(new Date(value).getTime());
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

  if (payload.tags !== undefined && !Array.isArray(payload.tags)) {
    errors.push('tags must be an array of strings');
  }

  if (errors.length) {
    throw new AppError(errors.join(', '), HTTP_STATUS.BAD_REQUEST);
  }
}

module.exports = { validateEventPayload };

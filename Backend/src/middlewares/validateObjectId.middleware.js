const mongoose = require('mongoose');
const AppError = require('../utils/appError');
const HTTP_STATUS = require('../constants/httpStatus');

function validateObjectId(paramName = 'id') {
  return (req, res, next) => {
    const value = req.params[paramName];

    if (!mongoose.Types.ObjectId.isValid(value)) {
      return next(new AppError(`Invalid ${paramName}`, HTTP_STATUS.BAD_REQUEST));
    }

    return next();
  };
}

module.exports = validateObjectId;

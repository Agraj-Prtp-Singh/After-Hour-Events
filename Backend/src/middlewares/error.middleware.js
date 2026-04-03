const HTTP_STATUS = require('../constants/httpStatus');

function errorHandler(err, req, res, next) {
  const statusCode = err.statusCode || HTTP_STATUS.INTERNAL_SERVER_ERROR;

  if (statusCode >= 500) {
    console.error(err);
  }

  res.status(statusCode).json({
    success: false,
    message: err.message || 'Something went wrong'
  });
}

module.exports = errorHandler;

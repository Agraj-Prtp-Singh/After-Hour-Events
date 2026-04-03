const jwt = require('jsonwebtoken');
const env = require('../config/env');
const AppError = require('../utils/appError');
const HTTP_STATUS = require('../constants/httpStatus');

function authMiddleware(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return next(new AppError('Authorization token is required', HTTP_STATUS.UNAUTHORIZED));
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, env.jwtSecret);
    req.user = {
      id: decoded.sub,
      role: decoded.role,
      email: decoded.email
    };
    return next();
  } catch (error) {
    return next(new AppError('Invalid or expired token', HTTP_STATUS.UNAUTHORIZED));
  }
}

function authorize(...allowedRoles) {
  return (req, res, next) => {
    if (!req.user || !allowedRoles.includes(req.user.role)) {
      return next(new AppError('You are not allowed to access this resource', HTTP_STATUS.FORBIDDEN));
    }
    return next();
  };
}

module.exports = { authMiddleware, authorize };

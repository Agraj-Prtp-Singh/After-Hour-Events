const jwt = require('jsonwebtoken');
const AppError = require('../utils/appError');
const HTTP_STATUS = require('../constants/httpStatus');

const authMiddleware = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return next(new AppError('Unauthorized', HTTP_STATUS.UNAUTHORIZED));
    }

    const token = authHeader.split(' ')[1];

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    req.user = {
      id: decoded.sub || decoded.id,
      email: decoded.email,
      role: decoded.role
    };

    next();
  } catch (error) {
    next(new AppError('Invalid or expired token', HTTP_STATUS.UNAUTHORIZED));
  }
};

const authorize = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return next(new AppError('User not authenticated', HTTP_STATUS.UNAUTHORIZED));
    }

    if (!allowedRoles.includes(req.user.role)) {
      return next(new AppError('Forbidden', HTTP_STATUS.FORBIDDEN));
    }

    next();
  };
};

module.exports = { authMiddleware, authorize };

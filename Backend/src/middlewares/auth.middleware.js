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
      id: decoded.id,
      email: decoded.email,
      role: decoded.role
    };

    next();
  } catch (error) {
    next(new AppError('Invalid or expired token', HTTP_STATUS.UNAUTHORIZED));
  }
};

module.exports = authMiddleware;
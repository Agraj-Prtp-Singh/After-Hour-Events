const authService = require('../services/auth.service');
const {
  validateRegisterPayload,
  validateLoginPayload,
  validateSendOtpPayload,
  validateVerifyOtpPayload,
  validateForgotPasswordPayload,
  validateResetPasswordPayload
} = require('../validators/auth.validator');
const asyncHandler = require('../utils/asyncHandler');
const HTTP_STATUS = require('../constants/httpStatus');

const register = asyncHandler(async (req, res) => {
  validateRegisterPayload(req.body);
  const data = await authService.register(req.body);

  res.status(HTTP_STATUS.CREATED).json({
    success: true,
    message: 'Registration successful',
    data
  });
});

const login = asyncHandler(async (req, res) => {
  validateLoginPayload(req.body);
  const data = await authService.login(req.body);

  res.status(HTTP_STATUS.OK).json({
    success: true,
    message: 'Login successful',
    data
  });
});

const getMyProfile = asyncHandler(async (req, res) => {
  const user = await authService.getMyProfile(req.user.id);

  res.status(HTTP_STATUS.OK).json({
    success: true,
    message: 'Profile fetched successfully',
    data: user
  });
});

const sendOtp = asyncHandler(async (req, res) => {
  validateSendOtpPayload(req.body);
  const data = await authService.sendOtp(req.body);

  res.status(HTTP_STATUS.OK).json({
    success: true,
    message: 'OTP generated successfully',
    data
  });
});

const verifyOtp = asyncHandler(async (req, res) => {
  validateVerifyOtpPayload(req.body);
  const data = await authService.verifyOtp(req.body);

  res.status(HTTP_STATUS.OK).json({
    success: true,
    message: 'OTP verified successfully',
    data
  });
});

const forgotPassword = asyncHandler(async (req, res) => {
  validateForgotPasswordPayload(req.body);
  const data = await authService.forgotPassword(req.body);

  res.status(HTTP_STATUS.OK).json({
    success: true,
    message: 'If the email exists, password reset instructions have been sent',
    data
  });
});

const resetPassword = asyncHandler(async (req, res) => {
  validateResetPasswordPayload(req.body);
  const data = await authService.resetPassword(req.body);

  res.status(HTTP_STATUS.OK).json({
    success: true,
    message: 'Password reset successful',
    data
  });
});

module.exports = {
  register,
  login,
  getMyProfile,
  sendOtp,
  verifyOtp,
  forgotPassword,
  resetPassword
};

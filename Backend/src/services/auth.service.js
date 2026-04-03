const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const env = require('../config/env');
const userRepository = require('../repositories/user.repository');
const AppError = require('../utils/appError');
const HTTP_STATUS = require('../constants/httpStatus');
const { ROLES, normalizeRole } = require('../constants/roles');
const emailService = require('./email.service');

class AuthService {
  async register(payload) {
    const existingUser = await userRepository.findByEmail(payload.email.toLowerCase());
    if (existingUser) {
      throw new AppError('Email already registered. Please login instead.', HTTP_STATUS.CONFLICT);
    }

    const passwordHash = await bcrypt.hash(payload.password, 10);

    const role = normalizeRole(payload.role) || ROLES.STUDENT;

    const user = await userRepository.create({
      fullName: payload.fullName,
      phone: payload.phone,
      email: payload.email.toLowerCase(),
      passwordHash,
      role
    });

    const token = this.#buildToken(user);

    return {
      token,
      user: {
        id: user._id,
        fullName: user.fullName,
        phone: user.phone,
        email: user.email,
        role: user.role
      }
    };
  }

  async login(payload) {
    const user = await userRepository.findByEmail(payload.email.toLowerCase());
    if (!user) {
      throw new AppError('Invalid email or password', HTTP_STATUS.UNAUTHORIZED);
    }

    const isPasswordMatch = await bcrypt.compare(payload.password, user.passwordHash);
    if (!isPasswordMatch) {
      throw new AppError('Invalid email or password', HTTP_STATUS.UNAUTHORIZED);
    }

    const token = this.#buildToken(user);

    return {
      token,
      user: {
        id: user._id,
        fullName: user.fullName,
        phone: user.phone,
        email: user.email,
        role: user.role
      }
    };
  }

  async getMyProfile(userId) {
    const user = await userRepository.findById(userId);
    if (!user) {
      throw new AppError('User not found', HTTP_STATUS.NOT_FOUND);
    }

    return user;
  }

  async sendOtp(payload) {
    const user = await userRepository.findByEmail(payload.email.toLowerCase());
    if (!user) {
      throw new AppError('User not found', HTTP_STATUS.NOT_FOUND);
    }

    const otp = this.#generateOtp();
    const otpCodeHash = this.#hashOtp(otp);
    const otpExpiresAt = new Date(Date.now() + env.otpExpiresMinutes * 60 * 1000);

    user.otpCodeHash = otpCodeHash;
    user.otpExpiresAt = otpExpiresAt;
    user.otpAttempts = 0;
    await user.save();

    try {
      await emailService.sendOtpEmail({
        toEmail: user.email,
        fullName: user.fullName,
        otp,
        expiresInMinutes: env.otpExpiresMinutes
      });
    } catch (error) {
      user.otpCodeHash = null;
      user.otpExpiresAt = null;
      user.otpAttempts = 0;
      await user.save();

      throw new AppError(
        `Failed to send OTP email. ${error.message}`,
        HTTP_STATUS.INTERNAL_SERVER_ERROR
      );
    }

    return {
      message: 'OTP sent successfully',
      expiresInMinutes: env.otpExpiresMinutes,
      ...(env.otpExposeInResponse ? { otp } : {})
    };
  }

  async verifyOtp(payload) {
    const user = await userRepository.findByEmail(payload.email.toLowerCase());
    if (!user) {
      throw new AppError('User not found', HTTP_STATUS.NOT_FOUND);
    }

    if (!user.otpCodeHash || !user.otpExpiresAt) {
      throw new AppError('No active OTP found. Please request a new OTP.', HTTP_STATUS.BAD_REQUEST);
    }

    if (new Date() > user.otpExpiresAt) {
      user.otpCodeHash = null;
      user.otpExpiresAt = null;
      user.otpAttempts = 0;
      await user.save();
      throw new AppError('OTP has expired. Please request a new OTP.', HTTP_STATUS.BAD_REQUEST);
    }

    if (user.otpAttempts >= env.otpMaxAttempts) {
      throw new AppError('Maximum OTP attempts reached. Please request a new OTP.', HTTP_STATUS.BAD_REQUEST);
    }

    const otpCodeHash = this.#hashOtp(String(payload.otp));
    if (otpCodeHash !== user.otpCodeHash) {
      user.otpAttempts += 1;
      await user.save();
      throw new AppError('Invalid OTP', HTTP_STATUS.BAD_REQUEST);
    }

    user.otpCodeHash = null;
    user.otpExpiresAt = null;
    user.otpAttempts = 0;
    user.otpVerifiedAt = new Date();
    await user.save();

    const token = this.#buildToken(user);

    return {
      token,
      user: {
        id: user._id,
        fullName: user.fullName,
        phone: user.phone,
        email: user.email,
        role: user.role,
        otpVerifiedAt: user.otpVerifiedAt
      }
    };
  }

  #generateOtp() {
    return String(Math.floor(100000 + Math.random() * 900000));
  }

  #hashOtp(otp) {
    return crypto
      .createHash('sha256')
      .update(`${otp}:${env.jwtSecret}`)
      .digest('hex');
  }

  #buildToken(user) {
    return jwt.sign(
      {
        role: user.role,
        email: user.email
      },
      env.jwtSecret,
      {
        subject: String(user._id),
        expiresIn: env.jwtExpiresIn
      }
    );
  }
}

module.exports = new AuthService();

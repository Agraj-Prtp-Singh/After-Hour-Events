const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const env = require('../config/env');
const userRepository = require('../repositories/user.repository');
const AppError = require('../utils/appError');
const HTTP_STATUS = require('../constants/httpStatus');

class AuthService {
  async register(payload) {
    const existingUser = await userRepository.findByEmail(payload.email.toLowerCase());
    if (existingUser) {
      throw new AppError('Email already registered. Please login instead.', HTTP_STATUS.CONFLICT);
    }

    const passwordHash = await bcrypt.hash(payload.password, 10);

    const user = await userRepository.create({
      fullName: payload.fullName,
      phone: payload.phone,
      email: payload.email.toLowerCase(),
      passwordHash,
      role: payload.role || 'user'
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

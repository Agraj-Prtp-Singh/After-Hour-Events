const mongoose = require('mongoose');
const { ROLES } = require('../constants/roles');

const userSchema = new mongoose.Schema(
  {
    fullName: {
      type: String,
      required: true,
      trim: true,
      minlength: 2,
      maxlength: 100
    },
    phone: {
      type: String,
      required: true,
      trim: true
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true
    },
    passwordHash: {
      type: String,
      required: true
    },
    role: {
      type: String,
      enum: [ROLES.STUDENT, ROLES.VENDOR, ROLES.EVENT_PLANNER, ROLES.ADMIN],
      default: ROLES.STUDENT
    },
    businessName: {
      type: String,
      trim: true,
      maxlength: 160,
      default: null
    },
    businessType: {
      type: String,
      trim: true,
      maxlength: 120,
      default: null
    },
    phoneNumber: {
      type: String,
      trim: true,
      maxlength: 30,
      default: null
    },
    description: {
      type: String,
      trim: true,
      maxlength: 1000,
      default: null
    },
    verificationStatus: {
      type: String,
      enum: ['unverified', 'pending', 'verified', 'rejected'],
      default: 'unverified'
    },
    otpCodeHash: {
      type: String,
      default: null
    },
    otpExpiresAt: {
      type: Date,
      default: null
    },
    otpAttempts: {
      type: Number,
      default: 0
    },
    otpVerifiedAt: {
      type: Date,
      default: null
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model('User', userSchema);

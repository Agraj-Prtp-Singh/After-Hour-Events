const mongoose = require('mongoose');

const VENDOR_APPLICATION_STATUS = {
  PENDING: 'pending',
  APPROVED: 'approved',
  REJECTED: 'rejected'
};

const vendorApplicationSchema = new mongoose.Schema(
  {
    eventId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Event',
      required: true,
      index: true
    },
    vendorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
<<<<<<< HEAD
    plannerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    stallName: {
      type: String,
      required: true,
      trim: true,
      maxlength: 120
    },
    offerings: {
      type: String,
      required: true,
      trim: true,
      maxlength: 1000
    },
    notes: {
      type: String,
      trim: true,
      maxlength: 1000,
      default: ''
    },
=======
>>>>>>> 9ddf807c9db2fcd6990408ed41387411cc9ffd10
    status: {
      type: String,
      enum: Object.values(VENDOR_APPLICATION_STATUS),
      default: VENDOR_APPLICATION_STATUS.PENDING,
      index: true
    },
<<<<<<< HEAD
    reviewedAt: {
      type: Date,
      default: null
=======
    message: {
      type: String,
      trim: true,
      maxlength: 500,
      default: ''
    },
    reviewedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null
    },
    reviewedAt: {
      type: Date,
      default: null
    },
    rejectionReason: {
      type: String,
      trim: true,
      maxlength: 500,
      default: null
>>>>>>> 9ddf807c9db2fcd6990408ed41387411cc9ffd10
    }
  },
  { timestamps: true }
);

vendorApplicationSchema.index({ eventId: 1, vendorId: 1 }, { unique: true });

const VendorApplication = mongoose.model('VendorApplication', vendorApplicationSchema);

module.exports = VendorApplication;
module.exports.VENDOR_APPLICATION_STATUS = VENDOR_APPLICATION_STATUS;

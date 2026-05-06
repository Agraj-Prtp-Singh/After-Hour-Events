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
    status: {
      type: String,
      enum: Object.values(VENDOR_APPLICATION_STATUS),
      default: VENDOR_APPLICATION_STATUS.PENDING,
      index: true
    },
    reviewedAt: {
      type: Date,
      default: null
    }
  },
  { timestamps: true }
);

vendorApplicationSchema.index({ eventId: 1, vendorId: 1 }, { unique: true });

const VendorApplication = mongoose.model('VendorApplication', vendorApplicationSchema);

module.exports = VendorApplication;
module.exports.VENDOR_APPLICATION_STATUS = VENDOR_APPLICATION_STATUS;

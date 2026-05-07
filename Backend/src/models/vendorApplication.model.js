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
    status: {
      type: String,
      enum: Object.values(VENDOR_APPLICATION_STATUS),
      default: VENDOR_APPLICATION_STATUS.PENDING,
      index: true
    },
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
    }
  },
  { timestamps: true }
);

vendorApplicationSchema.index({ eventId: 1, vendorId: 1 }, { unique: true });

const VendorApplication = mongoose.model('VendorApplication', vendorApplicationSchema);

module.exports = VendorApplication;
module.exports.VENDOR_APPLICATION_STATUS = VENDOR_APPLICATION_STATUS;

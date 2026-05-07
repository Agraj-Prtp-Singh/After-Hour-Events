const mongoose = require('mongoose');

const EVENT_APPROVAL_STATUS = {
  PENDING: 'pending',
  APPROVED: 'approved',
  DENIED: 'denied'
};

const eventSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
      minlength: 3,
      maxlength: 180
    },
    description: {
      type: String,
      required: true,
      trim: true,
      maxlength: 2000
    },
    category: {
      type: String,
      trim: true,
      default: ''
    },
    location: {
      type: String,
      required: true,
      trim: true,
      maxlength: 180
    },
    startDate: {
      type: Date,
      required: true
    },
    endDate: {
      type: Date,
      required: true
    },
    capacity: {
      type: Number,
      required: true,
      min: 1
    },
    vendorLimit: {
      type: Number,
      min: 0,
      default: 0
    },
    ticketPrice: {
      type: Number,
      default: 0,
      min: 0
    },
    tags: {
      type: [String],
      default: []
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    isPublished: {
      type: Boolean,
      default: true
    },
    approvalStatus: {
      type: String,
      enum: Object.values(EVENT_APPROVAL_STATUS),
      default: EVENT_APPROVAL_STATUS.PENDING,
      index: true
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
    denialReason: {
      type: String,
      trim: true,
      maxlength: 500,
      default: null
    }
  },
  { timestamps: true }
);

eventSchema.index({ title: 'text', location: 'text', description: 'text' });

const Event = mongoose.model('Event', eventSchema);

module.exports = Event;
module.exports.EVENT_APPROVAL_STATUS = EVENT_APPROVAL_STATUS;

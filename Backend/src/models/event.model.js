const mongoose = require('mongoose');

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
    }
  },
  { timestamps: true }
);

eventSchema.index({ title: 'text', location: 'text', description: 'text' });

module.exports = mongoose.model('Event', eventSchema);

const mongoose = require('mongoose');

const schema = new mongoose.Schema({
  eventId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Event'
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  status: {
    type: String,
    enum: ['registered', 'cancelled'],
    default: 'registered'
  }
}, { timestamps: true });

module.exports = mongoose.model('Registration', schema);

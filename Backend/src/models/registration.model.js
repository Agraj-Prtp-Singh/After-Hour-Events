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
  },
  ticketCode: {
    type: String,
    unique: true,
    sparse: true,
    trim: true
  },
  qrCodeDataUrl: {
    type: String,
    default: ''
  }
}, { timestamps: true });

module.exports = mongoose.model('Registration', schema);

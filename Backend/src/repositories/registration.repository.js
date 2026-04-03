const Registration = require('../models/registration.model');

class RegistrationRepository {
  create(data) {
    return Registration.create(data);
  }

  findOne(filter) {
    return Registration.findOne(filter);
  }

  countByEvent(eventId) {
    return Registration.countDocuments({ eventId, status: 'registered' });
  }

  listByUser(userId) {
    return Registration.find({ userId, status: 'registered' })
      .sort({ createdAt: -1 })
      .populate('eventId');
  }

  listByEvent(eventId) {
    return Registration.find({ eventId, status: 'registered' })
      .sort({ createdAt: -1 })
      .populate('userId', 'fullName phone email role');
  }

  cancel(userId, eventId) {
    return Registration.findOneAndUpdate(
      { userId, eventId, status: 'registered' },
      { status: 'cancelled' },
      { new: true }
    );
  }
}

module.exports = new RegistrationRepository();

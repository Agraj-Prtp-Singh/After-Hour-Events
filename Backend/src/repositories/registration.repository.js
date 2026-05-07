const Registration = require('../models/registration.model');

class RegistrationRepository {
  #registeredFilter(extra = {}) {
    return {
      ...extra,
      $or: [{ status: 'registered' }, { status: { $exists: false } }]
    };
  }

  create(data) {
    return Registration.create(data);
  }

  findOne(filter) {
    return Registration.findOne(filter);
  }

  countByEvent(eventId) {
    return Registration.countDocuments(this.#registeredFilter({ eventId }));
  }

  countByUser(userId) {
    return Registration.countDocuments(this.#registeredFilter({ userId }));
  }

  listByUser(userId) {
    return Registration.find(this.#registeredFilter({ userId }))
      .sort({ createdAt: -1 })
      .populate('eventId');
  }

  listByEvent(eventId) {
    return Registration.find(this.#registeredFilter({ eventId }))
      .sort({ createdAt: -1 })
      .populate('userId', 'fullName phone email role');
  }

  cancel(userId, eventId) {
    return Registration.findOneAndUpdate(
      this.#registeredFilter({ userId, eventId }),
      { status: 'cancelled' },
      { new: true }
    );
  }

  cancelById(registrationId, userId) {
    return Registration.findOneAndUpdate(
      this.#registeredFilter({ _id: registrationId, userId }),
      { status: 'cancelled' },
      { new: true }
    );
  }

  countByEventIds(eventIds) {
    return Registration.countDocuments(
      this.#registeredFilter({ eventId: { $in: eventIds } })
    );
  }

  listByEventIds(eventIds) {
    return Registration.find(this.#registeredFilter({ eventId: { $in: eventIds } }))
      .sort({ createdAt: -1 })
      .populate('eventId')
      .populate('userId', 'fullName phone email role');
  }
}

module.exports = new RegistrationRepository();

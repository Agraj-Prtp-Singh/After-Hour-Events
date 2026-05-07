const registrationRepository = require('../repositories/registration.repository');
const eventRepository = require('../repositories/event.repository');
const AppError = require('../utils/appError');
const HTTP_STATUS = require('../constants/httpStatus');

class RegistrationService {
  async registerForEvent(eventId, userId) {
    const event = await eventRepository.findById(eventId);

    if (!event) {
      throw new AppError('Event not found', HTTP_STATUS.NOT_FOUND);
    }

    if (!event.isPublished) {
      throw new AppError('Event is not available for registration', HTTP_STATUS.NOT_FOUND);
    }

    if (new Date(event.endDate) < new Date()) {
      throw new AppError('Event registration is closed', HTTP_STATUS.BAD_REQUEST);
    }

    const existing = await registrationRepository.findOne({ eventId, userId });
    if (existing && (!existing.status || existing.status === 'registered')) {
      throw new AppError('You are already registered for this event', HTTP_STATUS.CONFLICT);
    }

    const registeredCount = await registrationRepository.countByEvent(eventId);
    if (registeredCount >= event.capacity) {
      throw new AppError('Event is full', HTTP_STATUS.CONFLICT);
    }

    if (existing && existing.status === 'cancelled') {
      existing.status = 'registered';
      await existing.save();
      return existing;
    }

    return registrationRepository.create({ eventId, userId });
  }

  async cancelRegistration(eventId, userId) {
    const updated = await registrationRepository.cancel(userId, eventId);

    if (!updated) {
      throw new AppError('Active registration not found', HTTP_STATUS.NOT_FOUND);
    }

    return updated;
  }

  async cancelRegistrationById(registrationId, userId) {
    const updated = await registrationRepository.cancelById(registrationId, userId);

    if (!updated) {
      throw new AppError('Active registration not found', HTTP_STATUS.NOT_FOUND);
    }

    return updated;
  }

  async listMyRegistrations(userId) {
    return registrationRepository.listByUser(userId);
  }

  async getStudentStats(userId) {
    const registrations = await registrationRepository.listByUser(userId);
    const now = new Date();
    const total = registrations.length;
    const upcoming = registrations.filter((registration) => {
      const start = registration.eventId?.startDate;
      return start && new Date(start) >= now;
    }).length;
    const attended = registrations.filter((registration) => {
      const end = registration.eventId?.endDate;
      return end && new Date(end) < now;
    }).length;

    return {
      eventsAttended: attended,
      upcomingEvents: upcoming,
      totalBookings: total
    };
  }
}

module.exports = new RegistrationService();

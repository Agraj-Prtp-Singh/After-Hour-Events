const registrationRepository = require('../repositories/registration.repository');
const eventRepository = require('../repositories/event.repository');
const userRepository = require('../repositories/user.repository');
const emailService = require('./email.service');
const { createTicketArtifacts } = require('./ticket.service');
const AppError = require('../utils/appError');
const HTTP_STATUS = require('../constants/httpStatus');
const { EVENT_APPROVAL_STATUS } = require('../models/event.model');

class RegistrationService {
  async #attachTicket(registration) {
    if (registration.ticketCode && registration.qrCodeDataUrl) {
      if (registration.isModified && registration.isModified()) {
        await registration.save();
      }

      return registration;
    }

    const ticket = await createTicketArtifacts({
      registrationId: registration._id,
      eventId: registration.eventId,
      userId: registration.userId
    });

    registration.ticketCode = ticket.ticketCode;
    registration.qrCodeDataUrl = ticket.qrCodeDataUrl;
    await registration.save();
    return registration;
  }

  async #sendTicketEmail(registration, event, userId) {
    try {
      const user = await userRepository.findById(userId);

      if (!user?.email) {
        return;
      }

      await emailService.sendTicketEmail({
        toEmail: user.email,
        fullName: user.fullName,
        event,
        ticketCode: registration.ticketCode,
        qrCodeDataUrl: registration.qrCodeDataUrl
      });
    } catch (error) {
      console.warn(`Ticket email was not sent: ${error.message}`);
    }
  }

  async registerForEvent(eventId, userId) {
    const event = await eventRepository.findById(eventId);

    if (!event) {
      throw new AppError('Event not found', HTTP_STATUS.NOT_FOUND);
    }

    if (event.approvalStatus === EVENT_APPROVAL_STATUS.DENIED) {
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
      await this.#attachTicket(existing);
      await this.#sendTicketEmail(existing, event, userId);
      return existing;
    }

    const registration = await registrationRepository.create({ eventId, userId });
    await this.#attachTicket(registration);
    await this.#sendTicketEmail(registration, event, userId);
    return registration;
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

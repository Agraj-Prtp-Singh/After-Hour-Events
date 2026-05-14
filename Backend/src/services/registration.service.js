const jwt = require('jsonwebtoken');
const env = require('../config/env');
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

    if (!event.isPublished || event.approvalStatus !== EVENT_APPROVAL_STATUS.APPROVED) {
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
    const registrations = await registrationRepository.listByUser(userId);
    return registrations.map((registration) => this.#serializeRegistrationWithTicket(registration, userId));
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

  async scanTicketForEventDetails(ticketToken, userId) {
    let decodedTicket;

    try {
      decodedTicket = jwt.verify(ticketToken, env.jwtSecret);
    } catch (error) {
      throw new AppError('Invalid or expired ticket QR code', HTTP_STATUS.BAD_REQUEST);
    }

    if (decodedTicket.typ !== 'event_ticket' || !decodedTicket.rid) {
      throw new AppError('Invalid ticket QR code payload', HTTP_STATUS.BAD_REQUEST);
    }

    const registration = await registrationRepository.findActiveByIdAndUser(decodedTicket.rid, userId);
    if (!registration) {
      throw new AppError('Ticket not found for this user', HTTP_STATUS.NOT_FOUND);
    }

    return this.#serializeRegistrationWithTicket(registration, userId);
  }

  #serializeRegistrationWithTicket(registration, userId) {
    const safeRegistration = registration.toObject
      ? registration.toObject({ virtuals: true })
      : registration;
    const event = safeRegistration.eventId;
    const eventId = event && event._id ? String(event._id) : String(safeRegistration.eventId);
    const registrationId = String(safeRegistration._id);
    const qrPayload = this.#buildTicketToken({
      registrationId,
      eventId,
      userId,
      eventEndDate: event && event.endDate
    });

    return {
      ...safeRegistration,
      ticket: {
        type: 'event_ticket',
        qrPayload
      }
    };
  }

  #buildTicketToken({ registrationId, eventId, userId, eventEndDate }) {
    return jwt.sign(
      {
        typ: 'event_ticket',
        rid: registrationId,
        eid: eventId,
        uid: userId
      },
      env.jwtSecret,
      {
        expiresIn: this.#resolveTicketExpiry(eventEndDate)
      }
    );
  }

  #resolveTicketExpiry(eventEndDate) {
    if (!eventEndDate) {
      return '30d';
    }

    const eventEndMillis = new Date(eventEndDate).getTime();
    if (Number.isNaN(eventEndMillis)) {
      return '30d';
    }

    const now = Date.now();
    const minLifetimeSeconds = 60 * 30;
    const eventLifetimeSeconds = Math.ceil((eventEndMillis - now) / 1000);

    return Math.max(eventLifetimeSeconds, minLifetimeSeconds);
  }
}

module.exports = new RegistrationService();

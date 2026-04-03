const eventRepository = require('../repositories/event.repository');
const registrationRepository = require('../repositories/registration.repository');
const sanitizePagination = require('../utils/pagination');
const AppError = require('../utils/appError');
const HTTP_STATUS = require('../constants/httpStatus');
const { ROLES } = require('../constants/roles');

class EventService {
  async createEvent(payload, userId) {
    const event = await eventRepository.create({
      ...payload,
      createdBy: userId
    });

    return event;
  }

  async listEvents(query) {
    const pagination = sanitizePagination(query);
    const filter = { isPublished: true };

    if (query.search && query.search.trim()) {
      filter.$text = { $search: query.search.trim() };
    }

    if (query.fromDate || query.toDate) {
      filter.startDate = {};
      if (query.fromDate) filter.startDate.$gte = new Date(query.fromDate);
      if (query.toDate) filter.startDate.$lte = new Date(query.toDate);
    }

    const [items, total] = await Promise.all([
      eventRepository.list(filter, pagination),
      eventRepository.count(filter)
    ]);

    return {
      items,
      pagination: {
        page: pagination.page,
        limit: pagination.limit,
        total,
        totalPages: Math.ceil(total / pagination.limit)
      }
    };
  }

  async getEventById(eventId) {
    const event = await eventRepository.findByIdWithCreator(eventId);

    if (!event || !event.isPublished) {
      throw new AppError('Event not found', HTTP_STATUS.NOT_FOUND);
    }

    return event;
  }

  async updateEvent(eventId, payload, user) {
    const existingEvent = await eventRepository.findById(eventId);

    if (!existingEvent) {
      throw new AppError('Event not found', HTTP_STATUS.NOT_FOUND);
    }

    const isOwner = String(existingEvent.createdBy) === user.id;
    const isAdmin = user.role === ROLES.ADMIN;

    if (!isOwner && !isAdmin) {
      throw new AppError('Only owner or admin can update this event', HTTP_STATUS.FORBIDDEN);
    }

    const updated = await eventRepository.updateById(eventId, payload);
    return updated;
  }

  async deleteEvent(eventId, user) {
    const existingEvent = await eventRepository.findById(eventId);

    if (!existingEvent) {
      throw new AppError('Event not found', HTTP_STATUS.NOT_FOUND);
    }

    const isOwner = String(existingEvent.createdBy) === user.id;
    const isAdmin = user.role === ROLES.ADMIN;

    if (!isOwner && !isAdmin) {
      throw new AppError('Only owner or admin can delete this event', HTTP_STATUS.FORBIDDEN);
    }

    await eventRepository.deleteById(eventId);
    return true;
  }

  async listEventRegistrations(eventId, user) {
    const event = await eventRepository.findById(eventId);

    if (!event) {
      throw new AppError('Event not found', HTTP_STATUS.NOT_FOUND);
    }

    const isOwner = String(event.createdBy) === user.id;
    const isAdmin = user.role === ROLES.ADMIN;

    if (!isOwner && !isAdmin) {
      throw new AppError('Only owner or admin can view registrations', HTTP_STATUS.FORBIDDEN);
    }

    return registrationRepository.listByEvent(eventId);
  }
}

module.exports = new EventService();

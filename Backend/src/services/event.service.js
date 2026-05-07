const eventRepository = require('../repositories/event.repository');
const registrationRepository = require('../repositories/registration.repository');
const sanitizePagination = require('../utils/pagination');
const AppError = require('../utils/appError');
const HTTP_STATUS = require('../constants/httpStatus');
const { ROLES } = require('../constants/roles');
const { EVENT_APPROVAL_STATUS } = require('../models/event.model');

class EventService {
  async createEvent(payload, user) {
    const isAdmin = user.role === ROLES.ADMIN;

    const event = await eventRepository.create({
      ...payload,
      createdBy: user.id,
      isPublished: isAdmin,
      approvalStatus: isAdmin ? EVENT_APPROVAL_STATUS.APPROVED : EVENT_APPROVAL_STATUS.PENDING,
      reviewedBy: isAdmin ? user.id : null,
      reviewedAt: isAdmin ? new Date() : null,
      denialReason: null
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

  async listEventsByPlanner(plannerId, query) {
    const pagination = sanitizePagination(query);
    const filter = { createdBy: plannerId };

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

  async getPlannerStats(plannerId) {
    const eventCount = await eventRepository.count({ createdBy: plannerId });
    const totalCapacity = await eventRepository.sumCapacityByOwner(plannerId);

    const eventIds = await eventRepository.listIdsByOwner(plannerId);
    const ids = eventIds.map((event) => event._id);
    const attendeeCount = ids.length ? await registrationRepository.countByEventIds(ids) : 0;
    const fillRate = totalCapacity > 0 ? Math.round((attendeeCount / totalCapacity) * 100) : 0;

    return {
      totalEvents: eventCount,
      totalAttendees: attendeeCount,
      totalCapacity,
      fillRate,
      revenue: 0
    };
  }

  async listPlannerAttendees(plannerId) {
    const eventIds = await eventRepository.listIdsByOwner(plannerId);
    const ids = eventIds.map((event) => event._id);

    if (ids.length === 0) {
      return [];
    }

    return registrationRepository.listByEventIds(ids);
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

    const sanitizedPayload = { ...payload };
    delete sanitizedPayload.isPublished;
    delete sanitizedPayload.approvalStatus;
    delete sanitizedPayload.reviewedBy;
    delete sanitizedPayload.reviewedAt;
    delete sanitizedPayload.denialReason;

    if (!isAdmin) {
      sanitizedPayload.isPublished = false;
      sanitizedPayload.approvalStatus = EVENT_APPROVAL_STATUS.PENDING;
      sanitizedPayload.reviewedBy = null;
      sanitizedPayload.reviewedAt = null;
      sanitizedPayload.denialReason = null;
    }

    return eventRepository.updateById(eventId, sanitizedPayload);
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

  async listPendingEvents(query) {
    const pagination = sanitizePagination(query);
    const filter = { approvalStatus: EVENT_APPROVAL_STATUS.PENDING };

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

  async reviewEvent(eventId, decision, adminUserId, denialReason) {
    const event = await eventRepository.findById(eventId);

    if (!event) {
      throw new AppError('Event not found', HTTP_STATUS.NOT_FOUND);
    }

    const normalizedDecision = String(decision || '').trim().toLowerCase();

    if (normalizedDecision !== EVENT_APPROVAL_STATUS.APPROVED && normalizedDecision !== EVENT_APPROVAL_STATUS.DENIED) {
      throw new AppError("decision must be either 'approved' or 'denied'", HTTP_STATUS.BAD_REQUEST);
    }

    const update = {
      approvalStatus: normalizedDecision,
      isPublished: normalizedDecision === EVENT_APPROVAL_STATUS.APPROVED,
      reviewedBy: adminUserId,
      reviewedAt: new Date(),
      denialReason: normalizedDecision === EVENT_APPROVAL_STATUS.DENIED ? denialReason || null : null
    };

    return eventRepository.updateById(eventId, update);
  }
}

module.exports = new EventService();

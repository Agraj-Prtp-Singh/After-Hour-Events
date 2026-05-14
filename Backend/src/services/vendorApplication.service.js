const eventRepository = require('../repositories/event.repository');
const vendorApplicationRepository = require('../repositories/vendorApplication.repository');
const AppError = require('../utils/appError');
const HTTP_STATUS = require('../constants/httpStatus');
const { ROLES } = require('../constants/roles');
const { VENDOR_APPLICATION_STATUS } = require('../models/vendorApplication.model');

class VendorApplicationService {
  async listAvailableEvents() {
    const now = new Date();
    const events = await eventRepository.listOpenToVendors();

    return events.filter((event) => {
      if (event.approvalStatus === 'denied') return false;
      if (!event.endDate) return true;
      return new Date(event.endDate) >= now;
    });
  }

  async apply(eventId, vendorId, payload) {
    const event = await eventRepository.findById(eventId);

    if (!event) {
      throw new AppError('Event not found', HTTP_STATUS.NOT_FOUND);
    }

    if (!event.openToVendors) {
      throw new AppError('This event is not open to vendor applications', HTTP_STATUS.BAD_REQUEST);
    }

    const existing = await vendorApplicationRepository.findByVendorAndEvent(vendorId, eventId);
    if (existing) {
      throw new AppError('You have already applied for this event', HTTP_STATUS.CONFLICT);
    }

    const stallName = String(payload.stallName || '').trim();
    const offerings = String(payload.offerings || '').trim();
    const notes = String(payload.notes || '').trim();

    if (!stallName || !offerings) {
      throw new AppError('stallName and offerings are required', HTTP_STATUS.BAD_REQUEST);
    }

    return vendorApplicationRepository.create({
      eventId,
      vendorId,
      plannerId: event.createdBy,
      stallName,
      offerings,
      notes
    });
  }

  listMyApplications(vendorId) {
    return vendorApplicationRepository.listByVendor(vendorId);
  }

  listPlannerApplications(plannerId) {
    return vendorApplicationRepository.listByPlanner(plannerId);
  }

  async review(applicationId, plannerUser, decision) {
    const application = await vendorApplicationRepository.findById(applicationId);

    if (!application) {
      throw new AppError('Vendor application not found', HTTP_STATUS.NOT_FOUND);
    }

    const isOwner = String(application.plannerId) === plannerUser.id;
    const isAdmin = plannerUser.role === ROLES.ADMIN;

    if (!isOwner && !isAdmin) {
      throw new AppError('Only the event planner can review this vendor application', HTTP_STATUS.FORBIDDEN);
    }

    const normalizedDecision = String(decision || '').trim().toLowerCase();
    if (
      normalizedDecision !== VENDOR_APPLICATION_STATUS.APPROVED &&
      normalizedDecision !== VENDOR_APPLICATION_STATUS.REJECTED
    ) {
      throw new AppError("decision must be either 'approved' or 'rejected'", HTTP_STATUS.BAD_REQUEST);
    }

    return vendorApplicationRepository.updateById(applicationId, {
      status: normalizedDecision,
      reviewedAt: new Date()
    });
  }
}

module.exports = new VendorApplicationService();

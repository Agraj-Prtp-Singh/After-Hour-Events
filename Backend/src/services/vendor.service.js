const vendorApplicationRepository = require('../repositories/vendorApplication.repository');
const eventRepository = require('../repositories/event.repository');
const userRepository = require('../repositories/user.repository');
const notificationService = require('./notification.service');
const AppError = require('../utils/appError');
const HTTP_STATUS = require('../constants/httpStatus');
const { ROLES } = require('../constants/roles');
const { VENDOR_APPLICATION_STATUS } = require('../models/vendorApplication.model');
const { EVENT_APPROVAL_STATUS } = require('../models/event.model');

class VendorService {
  async getVendorEvents(query = {}) {
    const filter = {
      isPublished: true,
      approvalStatus: EVENT_APPROVAL_STATUS.APPROVED,
      openToVendors: { $ne: false }
    };

    if (query.search && query.search.trim()) {
      filter.$text = { $search: query.search.trim() };
    }

    return eventRepository.list(filter, { skip: 0, limit: 100 });
  }

  async applyForEvent(eventId, vendorId, payload = {}) {
    const event = await eventRepository.findById(eventId);

    if (!event || !event.isPublished || event.approvalStatus !== EVENT_APPROVAL_STATUS.APPROVED) {
      throw new AppError('Event not found', HTTP_STATUS.NOT_FOUND);
    }

    if (!event.openToVendors) {
      throw new AppError('This event is not open to vendor applications', HTTP_STATUS.BAD_REQUEST);
    }

    const existing = await vendorApplicationRepository.findOne({ eventId, vendorId });
    if (existing) {
      throw new AppError('You have already applied to this event', HTTP_STATUS.CONFLICT);
    }

    const stallName = String(payload.stallName || '').trim();
    const offerings = String(payload.offerings || '').trim();
    const notes = String(payload.notes || '').trim();
    const message = String(payload.message || '').trim();
    const paymentScreenshot = String(payload.paymentScreenshot || '').trim();

    if (!stallName || !offerings) {
      throw new AppError('stallName and offerings are required', HTTP_STATUS.BAD_REQUEST);
    }

    if (Number(event.vendorSecurityDeposit || 0) > 0 && !paymentScreenshot) {
      throw new AppError('Payment screenshot is required for this vendor application', HTTP_STATUS.BAD_REQUEST);
    }

    return vendorApplicationRepository.create({
      eventId,
      vendorId,
      plannerId: event.createdBy,
      stallName,
      offerings,
      notes,
      message,
      paymentScreenshot
    });
  }

  async getMyApplications(vendorId) {
    return vendorApplicationRepository.listByVendor(vendorId);
  }

  async getMyVendorProfile(vendorId) {
    const user = await userRepository.findById(vendorId);

    if (!user) {
      throw new AppError('User not found', HTTP_STATUS.NOT_FOUND);
    }

    if (user.role !== ROLES.VENDOR) {
      throw new AppError('Only vendor users can access vendor profile', HTTP_STATUS.FORBIDDEN);
    }

    return user;
  }

  async listPlannerVendorApplications(plannerId, query = {}) {
    const status = query.status ? String(query.status).trim().toLowerCase() : null;
    const validStatuses = Object.values(VENDOR_APPLICATION_STATUS);

    if (status && !validStatuses.includes(status)) {
      throw new AppError(`status must be one of: ${validStatuses.join(', ')}`, HTTP_STATUS.BAD_REQUEST);
    }

    const items = await vendorApplicationRepository.listByPlanner(plannerId, status);
    return items.filter((item) => item.eventId);
  }

  async reviewVendorApplication(applicationId, decision, reviewer) {
    const application = await vendorApplicationRepository.findById(applicationId);

    if (!application || !application.eventId) {
      throw new AppError('Vendor application not found', HTTP_STATUS.NOT_FOUND);
    }

    const isPlannerOwner =
      String(application.plannerId?._id || application.plannerId) === reviewer.id ||
      String(application.eventId.createdBy) === reviewer.id;
    const isAdmin = reviewer.role === ROLES.ADMIN;

    if (!isPlannerOwner && !isAdmin) {
      throw new AppError('Only event owner or admin can review vendor applications', HTTP_STATUS.FORBIDDEN);
    }

    if (application.status !== VENDOR_APPLICATION_STATUS.PENDING) {
      throw new AppError('This application has already been reviewed', HTTP_STATUS.CONFLICT);
    }

    const normalizedDecision = String(decision || '').trim().toLowerCase();

    if (normalizedDecision === VENDOR_APPLICATION_STATUS.APPROVED) {
      const approvedCount = await vendorApplicationRepository.countApprovedByEvent(application.eventId._id);
      const vendorLimit = Number(application.eventId.vendorLimit || 0);

      if (vendorLimit > 0 && approvedCount >= vendorLimit) {
        throw new AppError('Vendor limit reached for this event', HTTP_STATUS.CONFLICT);
      }
    }

    const update = {
      status: normalizedDecision,
      reviewedBy: reviewer.id,
      reviewedAt: new Date(),
      rejectionReason: normalizedDecision === VENDOR_APPLICATION_STATUS.REJECTED
        ? String(reviewer.rejectionReason || '').trim() || null
        : null
    };

    const updated = await vendorApplicationRepository.updateById(applicationId, update);

    if (normalizedDecision === VENDOR_APPLICATION_STATUS.APPROVED) {
      await notificationService.createVendorApprovedNotification(updated.vendorId._id, updated.eventId);
    } else if (normalizedDecision === VENDOR_APPLICATION_STATUS.REJECTED) {
      await notificationService.createVendorRejectedNotification(
        updated.vendorId._id,
        updated.eventId,
        update.rejectionReason
      );
    }

    return updated;
  }
}

module.exports = new VendorService();

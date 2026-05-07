const notificationRepository = require('../repositories/notification.repository');
const { NOTIFICATION_TYPES } = require('../models/notification.model');

class NotificationService {
  async createVendorApprovedNotification(vendorId, event) {
    return notificationRepository.create({
      userId: vendorId,
      eventId: event._id,
      type: NOTIFICATION_TYPES.VENDOR_APPLICATION_APPROVED,
      title: 'Vendor application approved',
      message: `Your vendor application for "${event.title}" has been approved.`
    });
  }

  async createVendorRejectedNotification(vendorId, event, reason) {
    const reasonSuffix = reason ? ` Reason: ${reason}` : '';

    return notificationRepository.create({
      userId: vendorId,
      eventId: event._id,
      type: NOTIFICATION_TYPES.VENDOR_APPLICATION_REJECTED,
      title: 'Vendor application rejected',
      message: `Your vendor application for "${event.title}" has been rejected.${reasonSuffix}`,
      metadata: { rejectionReason: reason || null }
    });
  }
}

module.exports = new NotificationService();

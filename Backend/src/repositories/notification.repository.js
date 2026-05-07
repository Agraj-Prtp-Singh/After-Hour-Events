const Notification = require('../models/notification.model');

class NotificationRepository {
  create(data) {
    return Notification.create(data);
  }

  listByUser(userId) {
    return Notification.find({ userId }).sort({ createdAt: -1 });
  }
}

module.exports = new NotificationRepository();

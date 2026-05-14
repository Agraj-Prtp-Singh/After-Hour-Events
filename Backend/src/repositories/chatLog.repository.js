const { ChatLog } = require('../models/chatLog.model');

class ChatLogRepository {
  create(data) {
    return ChatLog.create(data);
  }

  listByUser(userId, options = {}) {
    const filter = { userId };

    if (options.conversationId) {
      filter.conversationId = options.conversationId;
    }

    return ChatLog.find(filter)
      .sort({ createdAt: -1 })
      .skip(options.skip)
      .limit(options.limit)
      .lean();
  }

  countByUser(userId, options = {}) {
    const filter = { userId };

    if (options.conversationId) {
      filter.conversationId = options.conversationId;
    }

    return ChatLog.countDocuments(filter);
  }

  deleteByUser(userId, options = {}) {
    const filter = { userId };

    if (options.conversationId) {
      filter.conversationId = options.conversationId;
    }

    return ChatLog.deleteMany(filter);
  }
}

module.exports = new ChatLogRepository();
const chatLogRepository = require('../repositories/chatLog.repository');
const AppError = require('../utils/appError');
const HTTP_STATUS = require('../constants/httpStatus');
const { CHAT_LOG_ROLES } = require('../models/chatLog.model');

class ChatLogService {
  async createLog(userId, payload) {
    const role = String(payload.role || '').trim().toLowerCase();
    const message = String(payload.message || '').trim();
    const conversationId = this.#normalizeConversationId(payload.conversationId);

    if (!Object.values(CHAT_LOG_ROLES).includes(role)) {
      throw new AppError(
        "role must be one of: 'user', 'assistant', or 'system'",
        HTTP_STATUS.BAD_REQUEST
      );
    }

    if (!message) {
      throw new AppError('message is required', HTTP_STATUS.BAD_REQUEST);
    }

    return chatLogRepository.create({
      userId,
      conversationId,
      role,
      message,
      metadata: this.#sanitizeMetadata(payload.metadata)
    });
  }

  async listMyLogs(userId, query = {}) {
    const conversationId = query.conversationId
      ? this.#normalizeConversationId(query.conversationId)
      : undefined;

    const limit = this.#normalizeLimit(query.limit);
    const page = this.#normalizePage(query.page);
    const skip = (page - 1) * limit;

    const [logs, total] = await Promise.all([
      chatLogRepository.listByUser(userId, {
        conversationId,
        limit,
        skip
      }),
      chatLogRepository.countByUser(userId, { conversationId })
    ]);

    return {
      logs: logs.reverse(),
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit) || 1
      }
    };
  }

  async clearMyLogs(userId, query = {}) {
    const conversationId = query.conversationId
      ? this.#normalizeConversationId(query.conversationId)
      : undefined;

    const result = await chatLogRepository.deleteByUser(userId, {
      conversationId
    });

    return {
      deletedCount: result.deletedCount || 0
    };
  }

  #normalizeConversationId(value) {
    const conversationId = String(value || 'default').trim();
    return conversationId || 'default';
  }

  #normalizeLimit(value) {
    const limit = Number(value) || 50;
    return Math.min(Math.max(limit, 1), 100);
  }

  #normalizePage(value) {
    const page = Number(value) || 1;
    return Math.max(page, 1);
  }

  #sanitizeMetadata(metadata) {
    if (!metadata || typeof metadata !== 'object' || Array.isArray(metadata)) {
      return {};
    }

    return metadata;
  }
}

module.exports = new ChatLogService();
const mongoose = require('mongoose');

const CHAT_LOG_ROLES = {
  USER: 'user',
  ASSISTANT: 'assistant',
  SYSTEM: 'system'
};

const chatLogSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },

    conversationId: {
      type: String,
      trim: true,
      default: 'default',
      index: true
    },

    role: {
      type: String,
      enum: Object.values(CHAT_LOG_ROLES),
      required: true
    },

    message: {
      type: String,
      required: true,
      trim: true,
      maxlength: 5000
    },

    metadata: {
      type: mongoose.Schema.Types.Mixed,
      default: {}
    }
  },
  {
    timestamps: true
  }
);

chatLogSchema.index({ userId: 1, conversationId: 1, createdAt: -1 });

module.exports = {
  ChatLog: mongoose.model('ChatLog', chatLogSchema),
  CHAT_LOG_ROLES
};
const chatLogService = require('../services/chatLog.service');
const asyncHandler = require('../utils/asyncHandler');
const HTTP_STATUS = require('../constants/httpStatus');

const createChatLog = asyncHandler(async (req, res) => {
  const chatLog = await chatLogService.createLog(req.user.id, req.body);

  res.status(HTTP_STATUS.CREATED).json({
    success: true,
    message: 'Chat log saved successfully',
    data: chatLog
  });
});

const listMyChatLogs = asyncHandler(async (req, res) => {
  const result = await chatLogService.listMyLogs(req.user.id, req.query);

  res.status(HTTP_STATUS.OK).json({
    success: true,
    message: 'Chat logs fetched successfully',
    data: result.logs,
    pagination: result.pagination
  });
});

const clearMyChatLogs = asyncHandler(async (req, res) => {
  const result = await chatLogService.clearMyLogs(req.user.id, req.query);

  res.status(HTTP_STATUS.OK).json({
    success: true,
    message: 'Chat logs cleared successfully',
    data: result
  });
});

module.exports = {
  createChatLog,
  listMyChatLogs,
  clearMyChatLogs
};
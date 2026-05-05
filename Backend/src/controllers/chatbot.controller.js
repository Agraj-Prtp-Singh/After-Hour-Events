const asyncHandler = require('../utils/asyncHandler');
const chatbotService = require('../services/chatbot.service');
const HTTP_STATUS = require('../constants/httpStatus');
const AppError = require('../utils/appError');

const askChatbot = asyncHandler(async (req, res) => {
  const question = req.body?.question;

  if (!question || typeof question !== 'string' || !question.trim()) {
    throw new AppError('question is required and must be a non-empty string', HTTP_STATUS.BAD_REQUEST);
  }

  if (question.length > 1000) {
    throw new AppError('question must be at most 1000 characters', HTTP_STATUS.BAD_REQUEST);
  }

  const data = await chatbotService.ask(question);

  res.status(HTTP_STATUS.OK).json({
    success: true,
    message: 'Chatbot response generated successfully',
    data
  });
});

module.exports = {
  askChatbot
};

const repo = require('../repositories/registration.repository');
const eventRepo = require('../repositories/event.repository');
const AppError = require('../utils/appError');

exports.register = async (eventId, user) => {
  const event = await eventRepo.findById(eventId);
  if (!event) throw new AppError('Event not found', 404);

  return await repo.create({
    eventId,
    userId: user.id
  });
};

exports.cancel = async (eventId, user) => {
  return await repo.cancel(eventId, user.id);
};

exports.getMyRegistrations = async (userId) => {
  return await repo.findByUser(userId);
};
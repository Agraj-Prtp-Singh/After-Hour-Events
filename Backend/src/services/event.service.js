const eventRepo = require('../repositories/event.repository');
const AppError = require('../utils/appError');

exports.createEvent = async (data, user) => {
  data.createdBy = user.id;
  return await eventRepo.create(data);
};

exports.updateEvent = async (eventId, data, user) => {
  const event = await eventRepo.findById(eventId);
  if (!event) throw new AppError('Event not found', 404);

  if (event.createdBy.toString() !== user.id) {
    throw new AppError('Unauthorized', 403);
  }

  return await eventRepo.update(eventId, data);
};

exports.deleteEvent = async (eventId, user) => {
  const event = await eventRepo.findById(eventId);
  if (!event) throw new AppError('Event not found', 404);

  if (event.createdBy.toString() !== user.id) {
    throw new AppError('Unauthorized', 403);
  }

  return await eventRepo.delete(eventId);
};

exports.getEventById = async (id) => {
  return await eventRepo.findById(id);
};

exports.listEvents = async (query) => {
  return await eventRepo.findAll(query);
};
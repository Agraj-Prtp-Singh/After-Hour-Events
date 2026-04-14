const eventService = require('../services/event.service');

exports.createEvent = async (req, res) => {
  const event = await eventService.createEvent(req.body, req.user);
  res.status(201).json({ success: true, data: event });
};

exports.updateEvent = async (req, res) => {
  const event = await eventService.updateEvent(req.params.id, req.body, req.user);
  res.json({ success: true, data: event });
};

exports.deleteEvent = async (req, res) => {
  await eventService.deleteEvent(req.params.id, req.user);
  res.json({ success: true, message: 'Event deleted' });
};

exports.getEventById = async (req, res) => {
  const event = await eventService.getEventById(req.params.id);
  res.json({ success: true, data: event });
};

exports.listEvents = async (req, res) => {
  const events = await eventService.listEvents(req.query);
  res.json({ success: true, data: events });
};
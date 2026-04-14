const service = require('../services/registration.service');

exports.register = async (req, res) => {
  const result = await service.register(req.params.eventId, req.user);
  res.json({ success: true, data: result });
};

exports.cancel = async (req, res) => {
  await service.cancel(req.params.eventId, req.user);
  res.json({ success: true, message: 'Cancelled' });
};

exports.getMyRegistrations = async (req, res) => {
  const data = await service.getMyRegistrations(req.user.id);
  res.json({ success: true, data });
};
const Registration = require('../models/registration.model');

exports.create = (data) => Registration.create(data);

exports.cancel = (eventId, userId) =>
  Registration.findOneAndDelete({ eventId, userId });

exports.findByUser = (userId) =>
  Registration.find({ userId }).populate('eventId');
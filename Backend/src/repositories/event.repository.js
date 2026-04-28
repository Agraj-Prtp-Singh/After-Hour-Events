const Event = require('../models/event.model');

exports.create = (data) => Event.create(data);

exports.findById = (id) => Event.findById(id);

exports.update = (id, data) =>
  Event.findByIdAndUpdate(id, data, { new: true });

exports.delete = (id) =>
  Event.findByIdAndDelete(id);

exports.findAll = (query) => {
  return Event.find().sort({ createdAt: -1 });
};
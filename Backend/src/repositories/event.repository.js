const Event = require('../models/event.model');

class EventRepository {
  create(data) {
    return Event.create(data);
  }

  findById(id) {
    return Event.findById(id);
  }

  findByIdWithCreator(id) {
    return Event.findById(id).populate('createdBy', 'fullName phone email role');
  }

  list(filter, options) {
    return Event.find(filter)
      .sort({ startDate: 1, createdAt: -1 })
      .skip(options.skip)
      .limit(options.limit)
      .populate('createdBy', 'fullName phone email role');
  }

  count(filter) {
    return Event.countDocuments(filter);
  }

  updateById(id, update) {
    return Event.findByIdAndUpdate(id, update, { new: true, runValidators: true });
  }

  deleteById(id) {
    return Event.findByIdAndDelete(id);
  }
}

module.exports = new EventRepository();

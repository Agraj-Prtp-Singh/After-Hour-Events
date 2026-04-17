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

  listByOwner(ownerId, options) {
    return Event.find({ createdBy: ownerId })
      .sort({ startDate: 1, createdAt: -1 })
      .skip(options.skip)
      .limit(options.limit)
      .populate('createdBy', 'fullName phone email role');
  }

  listIdsByOwner(ownerId) {
    return Event.find({ createdBy: ownerId }).select('_id');
  }

  async sumCapacityByOwner(ownerId) {
    const result = await Event.aggregate([
      { $match: { createdBy: ownerId } },
      { $group: { _id: null, totalCapacity: { $sum: '$capacity' } } }
    ]);
    return result[0]?.totalCapacity ?? 0;
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

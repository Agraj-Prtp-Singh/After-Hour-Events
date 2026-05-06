const VendorApplication = require('../models/vendorApplication.model');

const populateApplication = (query) =>
  query
    .populate('eventId', 'title description location startDate endDate category createdBy openToVendors')
    .populate('vendorId', 'fullName phone email role')
    .populate('plannerId', 'fullName phone email role');

class VendorApplicationRepository {
  create(data) {
    return VendorApplication.create(data);
  }

  findByVendorAndEvent(vendorId, eventId) {
    return VendorApplication.findOne({ vendorId, eventId });
  }

  listByVendor(vendorId) {
    return populateApplication(
      VendorApplication.find({ vendorId }).sort({ createdAt: -1 })
    );
  }

  listByPlanner(plannerId) {
    return populateApplication(
      VendorApplication.find({ plannerId }).sort({ createdAt: -1 })
    );
  }

  findById(id) {
    return VendorApplication.findById(id);
  }

  updateById(id, update) {
    return populateApplication(
      VendorApplication.findByIdAndUpdate(id, update, {
        new: true,
        runValidators: true
      })
    );
  }
}

module.exports = new VendorApplicationRepository();

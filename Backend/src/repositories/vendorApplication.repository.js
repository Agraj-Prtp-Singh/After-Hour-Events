const VendorApplication = require('../models/vendorApplication.model');
const { VENDOR_APPLICATION_STATUS } = require('../models/vendorApplication.model');

class VendorApplicationRepository {
  create(data) {
    return VendorApplication.create(data);
  }

  findOne(filter) {
    return VendorApplication.findOne(filter);
  }

  findById(id) {
    return VendorApplication.findById(id)
      .populate('eventId')
      .populate('vendorId', 'fullName email phone role businessName businessType phoneNumber description verificationStatus');
  }

  listByVendor(vendorId) {
    return VendorApplication.find({ vendorId })
      .sort({ createdAt: -1 })
      .populate('eventId')
      .populate('reviewedBy', 'fullName email role');
  }

  listByPlanner(plannerId, status) {
    const filter = {};
    if (status) {
      filter.status = status;
    }

    return VendorApplication.find(filter)
      .sort({ createdAt: -1 })
      .populate({
        path: 'eventId',
        match: { createdBy: plannerId },
        populate: { path: 'createdBy', select: 'fullName email role' }
      })
      .populate('vendorId', 'fullName email phone role businessName businessType phoneNumber description verificationStatus')
      .populate('reviewedBy', 'fullName email role');
  }

  countApprovedByEvent(eventId) {
    return VendorApplication.countDocuments({ eventId, status: VENDOR_APPLICATION_STATUS.APPROVED });
  }

  updateById(id, update) {
    return VendorApplication.findByIdAndUpdate(id, update, { new: true, runValidators: true })
      .populate('eventId')
      .populate('vendorId', 'fullName email phone role businessName businessType phoneNumber description verificationStatus')
      .populate('reviewedBy', 'fullName email role');
  }
}

module.exports = new VendorApplicationRepository();

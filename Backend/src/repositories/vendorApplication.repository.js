const VendorApplication = require('../models/vendorApplication.model');
<<<<<<< HEAD

const populateApplication = (query) =>
  query
    .populate('eventId', 'title description location startDate endDate category createdBy openToVendors')
    .populate('vendorId', 'fullName phone email role')
    .populate('plannerId', 'fullName phone email role');
=======
const { VENDOR_APPLICATION_STATUS } = require('../models/vendorApplication.model');
>>>>>>> 9ddf807c9db2fcd6990408ed41387411cc9ffd10

class VendorApplicationRepository {
  create(data) {
    return VendorApplication.create(data);
  }

<<<<<<< HEAD
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
=======
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
>>>>>>> 9ddf807c9db2fcd6990408ed41387411cc9ffd10
  }
}

module.exports = new VendorApplicationRepository();

const VendorApplication = require('../models/vendorApplication.model');
const { VENDOR_APPLICATION_STATUS } = require('../models/vendorApplication.model');

const populateApplication = (query) =>
  query
    .populate('eventId', 'title description location startDate endDate category createdBy openToVendors vendorLimit isPublished vendorSecurityDeposit vendorPaymentQrImage')
    .populate('vendorId', 'fullName email phone role businessName businessType phoneNumber description verificationStatus')
    .populate('plannerId', 'fullName phone email role')
    .populate('reviewedBy', 'fullName email role');

class VendorApplicationRepository {
  create(data) {
    return VendorApplication.create(data);
  }

  findByVendorAndEvent(vendorId, eventId) {
    return VendorApplication.findOne({ vendorId, eventId });
  }

  findOne(filter) {
    return VendorApplication.findOne(filter);
  }

  listByVendor(vendorId) {
    return populateApplication(
      VendorApplication.find({ vendorId }).sort({ createdAt: -1 })
    );
  }

  listByPlanner(plannerId, status) {
    const filter = { plannerId };
    if (status) {
      filter.status = status;
    }

    return populateApplication(VendorApplication.find(filter).sort({ createdAt: -1 }));
  }

  findById(id) {
    return populateApplication(VendorApplication.findById(id));
  }

  countApprovedByEvent(eventId) {
    return VendorApplication.countDocuments({
      eventId,
      status: VENDOR_APPLICATION_STATUS.APPROVED
    });
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

const Event = require('../models/event.model');
const Registration = require('../models/registration.model');
const User = require('../models/user.model');
const VendorApplication = require('../models/vendorApplication.model');

class AdminAnalyticsRepository {
  countUsers(filter = {}) {
    return User.countDocuments(filter);
  }

  countEvents(filter = {}) {
    return Event.countDocuments(filter);
  }

  countRegistrations(filter = {}) {
    return Registration.countDocuments(filter);
  }

  countVendorApplications(filter = {}) {
    return VendorApplication.countDocuments(filter);
  }

  usersByRole() {
    return User.aggregate([
      {
        $group: {
          _id: '$role',
          count: { $sum: 1 }
        }
      }
    ]);
  }

  eventsByApprovalStatus() {
    return Event.aggregate([
      {
        $group: {
          _id: '$approvalStatus',
          count: { $sum: 1 }
        }
      }
    ]);
  }

  eventsByCategory() {
    return Event.aggregate([
      {
        $group: {
          _id: {
            $cond: [
              {
                $or: [
                  { $eq: ['$category', null] },
                  { $eq: ['$category', ''] }
                ]
              },
              'Uncategorized',
              '$category'
            ]
          },
          count: { $sum: 1 }
        }
      },
      { $sort: { count: -1, _id: 1 } }
    ]);
  }

  registrationsByStatus() {
    return Registration.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);
  }

  vendorApplicationsByStatus() {
    return VendorApplication.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);
  }

  monthlyRegistrations(year) {
    return Registration.aggregate([
      {
        $match: {
          createdAt: {
            $gte: new Date(`${year}-01-01T00:00:00.000Z`),
            $lt: new Date(`${year + 1}-01-01T00:00:00.000Z`)
          }
        }
      },
      {
        $group: {
          _id: { $month: '$createdAt' },
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);
  }

  revenueSummary() {
    return Registration.aggregate([
      { $match: { status: 'registered' } },
      {
        $lookup: {
          from: 'events',
          localField: 'eventId',
          foreignField: '_id',
          as: 'event'
        }
      },
      { $unwind: '$event' },
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: { $ifNull: ['$event.ticketPrice', 0] } }
        }
      }
    ]);
  }

  recentEvents(limit = 5) {
    return Event.find()
      .sort({ createdAt: -1 })
      .limit(limit)
      .populate('createdBy', 'fullName email role')
      .lean();
  }

  topEventsByRegistrations(limit = 5) {
    return Registration.aggregate([
      { $match: { status: 'registered' } },
      {
        $group: {
          _id: '$eventId',
          registrations: { $sum: 1 }
        }
      },
      { $sort: { registrations: -1 } },
      { $limit: limit },
      {
        $lookup: {
          from: 'events',
          localField: '_id',
          foreignField: '_id',
          as: 'event'
        }
      },
      { $unwind: '$event' },
      {
        $project: {
          _id: 0,
          eventId: '$event._id',
          title: '$event.title',
          location: '$event.location',
          startDate: '$event.startDate',
          registrations: 1
        }
      }
    ]);
  }
}

module.exports = new AdminAnalyticsRepository();
const adminAnalyticsRepository = require('../repositories/adminAnalytics.repository');
const { ROLES } = require('../constants/roles');
const { EVENT_APPROVAL_STATUS } = require('../models/event.model');
const { VENDOR_APPLICATION_STATUS } = require('../models/vendorApplication.model');

class AdminAnalyticsService {
  async getOverview(query = {}) {
    const year = this.#normalizeYear(query.year);
    const recentLimit = this.#normalizeLimit(query.recentLimit, 5);
    const topLimit = this.#normalizeLimit(query.topLimit, 5);

    const [
      totalUsers,
      totalEvents,
      totalRegistrations,
      totalVendorApplications,
      usersByRole,
      eventsByApprovalStatus,
      eventsByCategory,
      registrationsByStatus,
      vendorApplicationsByStatus,
      monthlyRegistrations,
      revenueSummary,
      recentEvents,
      topEvents
    ] = await Promise.all([
      adminAnalyticsRepository.countUsers(),
      adminAnalyticsRepository.countEvents(),
      adminAnalyticsRepository.countRegistrations(),
      adminAnalyticsRepository.countVendorApplications(),
      adminAnalyticsRepository.usersByRole(),
      adminAnalyticsRepository.eventsByApprovalStatus(),
      adminAnalyticsRepository.eventsByCategory(),
      adminAnalyticsRepository.registrationsByStatus(),
      adminAnalyticsRepository.vendorApplicationsByStatus(),
      adminAnalyticsRepository.monthlyRegistrations(year),
      adminAnalyticsRepository.revenueSummary(),
      adminAnalyticsRepository.recentEvents(recentLimit),
      adminAnalyticsRepository.topEventsByRegistrations(topLimit)
    ]);

    const roleCounts = this.#mapCounts(usersByRole);
    const approvalCounts = this.#mapCounts(eventsByApprovalStatus);
    const registrationCounts = this.#mapCounts(registrationsByStatus);
    const vendorApplicationCounts = this.#mapCounts(vendorApplicationsByStatus);

    return {
      summary: {
        totalUsers,
        totalStudents: roleCounts[ROLES.STUDENT] || 0,
        totalVendors: roleCounts[ROLES.VENDOR] || 0,
        totalEventPlanners: roleCounts[ROLES.EVENT_PLANNER] || 0,
        totalAdmins: roleCounts[ROLES.ADMIN] || 0,
        totalEvents,
        totalRegistrations,
        totalVendorApplications,
        totalRevenue: revenueSummary[0]?.totalRevenue || 0
      },

      users: {
        byRole: {
          student: roleCounts[ROLES.STUDENT] || 0,
          vendor: roleCounts[ROLES.VENDOR] || 0,
          eventPlanner: roleCounts[ROLES.EVENT_PLANNER] || 0,
          admin: roleCounts[ROLES.ADMIN] || 0
        }
      },

      events: {
        total: totalEvents,
        pending: approvalCounts[EVENT_APPROVAL_STATUS.PENDING] || 0,
        approved: approvalCounts[EVENT_APPROVAL_STATUS.APPROVED] || 0,
        denied: approvalCounts[EVENT_APPROVAL_STATUS.DENIED] || 0,
        byCategory: eventsByCategory.map((item) => ({
          category: item._id || 'Uncategorized',
          count: item.count
        }))
      },

      registrations: {
        total: totalRegistrations,
        registered: registrationCounts.registered || 0,
        cancelled: registrationCounts.cancelled || 0,
        monthlyTrend: this.#buildMonthlyTrend(monthlyRegistrations)
      },

      vendorApplications: {
        total: totalVendorApplications,
        pending: vendorApplicationCounts[VENDOR_APPLICATION_STATUS.PENDING] || 0,
        approved: vendorApplicationCounts[VENDOR_APPLICATION_STATUS.APPROVED] || 0,
        rejected: vendorApplicationCounts[VENDOR_APPLICATION_STATUS.REJECTED] || 0
      },

      recentEvents: recentEvents.map((event) => ({
        id: event._id,
        title: event.title,
        category: event.category || 'Uncategorized',
        location: event.location,
        startDate: event.startDate,
        endDate: event.endDate,
        approvalStatus: event.approvalStatus,
        isPublished: event.isPublished,
        createdBy: event.createdBy
      })),

      topEvents,

      filters: {
        year,
        recentLimit,
        topLimit
      }
    };
  }

  #mapCounts(items) {
    return items.reduce((accumulator, item) => {
      accumulator[item._id || 'unknown'] = item.count;
      return accumulator;
    }, {});
  }

  #buildMonthlyTrend(items) {
    const monthMap = this.#mapCounts(items);

    return Array.from({ length: 12 }, (_, index) => {
      const month = index + 1;

      return {
        month,
        count: monthMap[month] || 0
      };
    });
  }

  #normalizeYear(value) {
    const currentYear = new Date().getFullYear();
    const year = Number(value) || currentYear;

    if (year < 2000 || year > currentYear + 5) {
      return currentYear;
    }

    return year;
  }

  #normalizeLimit(value, defaultValue) {
    const limit = Number(value) || defaultValue;
    return Math.min(Math.max(limit, 1), 20);
  }
}

module.exports = new AdminAnalyticsService();
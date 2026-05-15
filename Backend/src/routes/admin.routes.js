const express = require('express');
const adminAnalyticsController = require('../controllers/adminAnalytics.controller');
const { authMiddleware, authorize } = require('../middlewares/auth.middleware');
const { ROLES } = require('../constants/roles');

const router = express.Router();

router.use(authMiddleware, authorize(ROLES.ADMIN));

router.get('/analytics', adminAnalyticsController.getOverview);

module.exports = router;
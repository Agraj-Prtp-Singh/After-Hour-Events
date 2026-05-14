const express = require('express');
const controller = require('../controllers/registration.controller');
const { authMiddleware } = require('../middlewares/auth.middleware');
const validateObjectId = require('../middlewares/validateObjectId.middleware');

const router = express.Router();

router.get('/ticket/scan', authMiddleware, controller.scanTicketForEventDetails);
router.get('/me', authMiddleware, controller.getMyRegistrations);
router.post('/:eventId', authMiddleware, validateObjectId('eventId'), controller.register);
router.delete('/:eventId', authMiddleware, validateObjectId('eventId'), controller.cancel);

module.exports = router;

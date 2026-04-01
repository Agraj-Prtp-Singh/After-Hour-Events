const express = require('express');
const registrationController = require('../controllers/registration.controller');
const { authMiddleware } = require('../middlewares/auth.middleware');
const validateObjectId = require('../middlewares/validateObjectId.middleware');

const router = express.Router();

router.get('/me', authMiddleware, registrationController.listMyRegistrations);
router.post('/:eventId', authMiddleware, validateObjectId('eventId'), registrationController.registerForEvent);
router.delete('/:eventId', authMiddleware, validateObjectId('eventId'), registrationController.cancelMyRegistration);

module.exports = router;

const express = require('express');
const router = express.Router();

const controller = require('../controllers/registration.controller');
const { authMiddleware } = require('../middlewares/auth.middleware');

router.post('/:eventId', authMiddleware, controller.register);
router.delete('/:eventId', authMiddleware, controller.cancel);
router.get('/me', authMiddleware, controller.getMyRegistrations);

module.exports = router;
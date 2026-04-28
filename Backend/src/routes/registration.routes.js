const express = require('express');
const router = express.Router();

const controller = require('../controllers/registration.controller');
const auth = require('../middlewares/auth.middleware');

router.post('/:eventId', auth, controller.register);
router.delete('/:eventId', auth, controller.cancel);
router.get('/me', auth, controller.getMyRegistrations);

module.exports = router;
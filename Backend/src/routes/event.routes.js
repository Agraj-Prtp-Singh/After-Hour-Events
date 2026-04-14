const express = require('express');
const router = express.Router();

const eventController = require('../controllers/event.controller');
const auth = require('../middlewares/auth.middleware');
const validateObjectId = require('../middlewares/validateObjectId.middleware');

router.get('/', eventController.listEvents);
router.get('/:id', validateObjectId('id'), eventController.getEventById);

router.post('/', auth, eventController.createEvent);
router.put('/:id', auth, validateObjectId('id'), eventController.updateEvent);
router.delete('/:id', auth, validateObjectId('id'), eventController.deleteEvent);

module.exports = router;
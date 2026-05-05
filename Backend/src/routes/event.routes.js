const express = require('express');
const eventController = require('../controllers/event.controller');
const registrationController = require('../controllers/registration.controller');
const { authMiddleware, authorize } = require('../middlewares/auth.middleware');
const validateObjectId = require('../middlewares/validateObjectId.middleware');
const { ROLES } = require('../constants/roles');

const router = express.Router();

router.get('/', eventController.listEvents);
router.get('/pending', authMiddleware, authorize(ROLES.ADMIN), eventController.listPendingEvents);
router.get('/:id', validateObjectId('id'), eventController.getEventById);

router.post('/', authMiddleware, authorize(ROLES.EVENT_PLANNER, ROLES.ADMIN), eventController.createEvent);
router.patch('/:id', authMiddleware, validateObjectId('id'), eventController.updateEvent);
router.patch('/:id/review', authMiddleware, authorize(ROLES.ADMIN), validateObjectId('id'), eventController.reviewEvent);
router.delete('/:id', authMiddleware, validateObjectId('id'), eventController.deleteEvent);

router.post('/:id/register', authMiddleware, validateObjectId('id'), (req, res, next) => {
  req.params.eventId = req.params.id;
  return registrationController.register(req, res, next);
});
router.delete('/:id/register', authMiddleware, validateObjectId('id'), (req, res, next) => {
  req.params.eventId = req.params.id;
  return registrationController.cancel(req, res, next);
});
router.get('/:id/registrations', authMiddleware, validateObjectId('id'), eventController.listEventRegistrations);

module.exports = router;

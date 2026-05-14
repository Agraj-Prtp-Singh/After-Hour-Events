const express = require('express');
const chatLogController = require('../controllers/chatLog.controller');
const { authMiddleware } = require('../middlewares/auth.middleware');

const router = express.Router();

router.use(authMiddleware);

router.post('/', chatLogController.createChatLog);
router.get('/me', chatLogController.listMyChatLogs);
router.delete('/me', chatLogController.clearMyChatLogs);

module.exports = router;
const express = require('express');
const rateLimit = require('express-rate-limit');
const { protect } = require('../middleware/authMiddleware');
const { listConversations, createConversation, getMessages, sendMessage, deleteMessage } = require('../controllers/messageController');
const router = express.Router();
const sendMessageLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 60,
  message: { message: 'Too many messages sent. Please try again shortly.' },
  standardHeaders: true,
  legacyHeaders: false,
});
router.use(protect);
router.get('/', listConversations);
router.post('/', createConversation);
router.get('/:id/messages', getMessages);
router.post('/:id/messages', sendMessageLimiter, sendMessage);
router.delete('/:id/messages/:messageId', deleteMessage);
module.exports = router;

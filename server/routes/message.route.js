const express = require('express');
const router = express.Router();
const {
    getConversations,
    getMessages,
    sendMessage
} = require('../controllers/message.controller');
const authMiddleware = require('../middlewares/auth.middleware');

// Toutes les routes messagerie sont protégées
router.use(authMiddleware);

// GET /api/messages - liste des conversations
router.get('/', getConversations);

// GET /api/messages/conversations/:id - messages d'une conversation
router.get('/conversations/:id', getMessages);

// POST /api/messages/conversations/:id - envoyer un message
router.post('/conversations/:id', sendMessage);

module.exports = router;

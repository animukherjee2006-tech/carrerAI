
const express = require('express');
const router = express.Router();

const authmiddleware = require('../middleware/auth.middleware');

const {
    createConversation,
    getConversations,
    getMessages,
    sendMessage,
    renameConversation,
    deleteConversation
} = require('../controller/chat.controller');

router.post('/conversations', authmiddleware, createConversation);

router.get('/conversations', authmiddleware, getConversations);

router.get(
    '/conversations/:conversationId/messages',
    authmiddleware,
    getMessages
);

router.post(
    '/conversations/:conversationId/messages',
    authmiddleware,
    sendMessage
);

router.patch(
    '/conversations/:conversationId',
    authmiddleware,
    renameConversation
);

router.delete(
    '/conversations/:conversationId',
    authmiddleware,
    deleteConversation
);

module.exports = router;

const express = require('express');
const router = express.Router();
const authmiddleware = require('../middleware/auth.middleware');
const {
    getNotifications,
    markAsRead,
    markAllAsRead
} = require('../controller/notification.controller');

router.get('/', authmiddleware, getNotifications);
router.patch('/:notificationId/read', authmiddleware, markAsRead);
router.post('/mark-all-read', authmiddleware, markAllAsRead);

module.exports = router;

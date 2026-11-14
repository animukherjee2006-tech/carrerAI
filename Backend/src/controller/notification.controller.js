const Notification = require('../model/notification.model');

const getNotifications = async (req, res) => {
    try {
        let notifications = await Notification.find({ user: req.user.id })
            .sort({ createdAt: -1 })
            .limit(20)
            .lean();

        // Seed welcome notification if empty
        if (notifications.length === 0) {
            const welcome = await Notification.create({
                user: req.user.id,
                title: "Welcome to CareerAI!",
                message: "Upload your resume or practice a mock interview to get personalized AI career guidance.",
                type: "info",
                link: "/resume-analyzer"
            });
            notifications = [welcome.toObject()];
        }

        const unreadCount = notifications.filter(n => !n.isRead).length;

        return res.status(200).json({
            success: true,
            notifications,
            unreadCount
        });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

const markAsRead = async (req, res) => {
    try {
        const { notificationId } = req.params;
        await Notification.findOneAndUpdate(
            { _id: notificationId, user: req.user.id },
            { isRead: true }
        );
        return res.status(200).json({ success: true, message: 'Notification marked as read' });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

const markAllAsRead = async (req, res) => {
    try {
        await Notification.updateMany({ user: req.user.id }, { isRead: true });
        return res.status(200).json({ success: true, message: 'All notifications marked as read' });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

module.exports = {
    getNotifications,
    markAsRead,
    markAllAsRead
};

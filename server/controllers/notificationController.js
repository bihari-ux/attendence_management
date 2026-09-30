const asyncHandler = require('../utils/asyncHandler');
const Notification = require('../models/Notification');

const getNotifications = asyncHandler(async (req, res) => {
  const notifications = await Notification.find({ recipient: req.user._id }).sort({ createdAt: -1 }).limit(50);
  const unreadCount = await Notification.countDocuments({ recipient: req.user._id, isRead: false });
  res.json({ success: true, notifications, unreadCount });
});

const markAsRead = asyncHandler(async (req, res) => {
  const notif = await Notification.findOne({ _id: req.params.id, recipient: req.user._id });
  if (!notif) {
    res.status(404);
    throw new Error('Notification not found');
  }
  notif.isRead = true;
  await notif.save();
  res.json({ success: true, notification: notif });
});

const markAllAsRead = asyncHandler(async (req, res) => {
  await Notification.updateMany({ recipient: req.user._id, isRead: false }, { isRead: true });
  res.json({ success: true, message: 'All notifications marked as read' });
});

module.exports = { getNotifications, markAsRead, markAllAsRead };

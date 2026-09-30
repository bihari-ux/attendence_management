const Notification = require('../models/Notification');

const notify = async ({ recipient, title, message, type = 'general', link = '' }) => {
  try {
    await Notification.create({ recipient, title, message, type, link });
  } catch (err) {
    console.error('Notification error:', err.message);
  }
};

module.exports = notify;

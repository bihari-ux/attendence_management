const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema(
  {
    recipient: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    title: { type: String, required: true },
    message: { type: String, required: true },
    type: {
      type: String,
      enum: [
        'leave_request', 'leave_approved', 'leave_rejected', 'task_assigned',
        'task_updated', 'task_completed', 'employee_absent', 'account_status',
        'deadline', 'holiday', 'general'
      ],
      default: 'general',
    },
    isRead: { type: Boolean, default: false },
    link: { type: String, default: '' },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Notification', notificationSchema);

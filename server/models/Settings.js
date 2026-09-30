const mongoose = require('mongoose');

const settingsSchema = new mongoose.Schema(
  {
    key: { type: String, default: 'global', unique: true },
    companyName: { type: String, default: 'My Company' },
    companyLogo: { type: String, default: '' },
    workStartTime: { type: String, default: '09:30' },
    workEndTime: { type: String, default: '18:30' },
    lateAfterMinutes: { type: Number, default: 15 },
    breakDurationMinutes: { type: Number, default: 60 },
    weekendDays: { type: [Number], default: [0, 6] }, // 0=Sun, 6=Sat
    leaveSettings: {
      casual: { type: Number, default: 12 },
      sick: { type: Number, default: 10 },
      earned: { type: Number, default: 15 },
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Settings', settingsSchema);

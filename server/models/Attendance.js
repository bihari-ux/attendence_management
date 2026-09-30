const mongoose = require('mongoose');

// One record per employee per calendar date
const attendanceSchema = new mongoose.Schema(
  {
    employee: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    date: { type: String, required: true }, // YYYY-MM-DD (local business date)
    startTime: { type: Date },
    endTime: { type: Date },
    totalWorkingSeconds: { type: Number, default: 0 },
    totalBreakSeconds: { type: Number, default: 0 },
    status: {
      type: String,
      enum: ['present', 'absent', 'on_leave', 'holiday', 'working', 'completed'],
      default: 'absent',
    },
    currentState: {
      type: String,
      enum: ['not_started', 'working', 'on_break', 'stopped'],
      default: 'not_started',
    },
    isLate: { type: Boolean, default: false },
    ip: { type: String },
    device: { type: String },
    city: { type: String, default: '' },
    locationAddress: { type: String, default: '' },
    latitude: { type: Number },
    longitude: { type: Number },
  },
  { timestamps: true }
);

attendanceSchema.index({ employee: 1, date: 1 }, { unique: true });

module.exports = mongoose.model('Attendance', attendanceSchema);

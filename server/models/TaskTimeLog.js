const mongoose = require('mongoose');

const taskTimeLogSchema = new mongoose.Schema(
  {
    task: { type: mongoose.Schema.Types.ObjectId, ref: 'Task', required: true },
    employee: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    startTime: { type: Date },
    endTime: { type: Date },
    minutesSpent: { type: Number, required: true, default: 0 },
    note: { type: String, default: '' },
  },
  { timestamps: true }
);

module.exports = mongoose.model('TaskTimeLog', taskTimeLogSchema);

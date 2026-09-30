const mongoose = require('mongoose');

const holidaySchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    date: { type: String, required: true }, // YYYY-MM-DD
    description: { type: String, default: '' },
    type: { type: String, enum: ['mandatory', 'optional'], default: 'mandatory' },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Holiday', holidaySchema);

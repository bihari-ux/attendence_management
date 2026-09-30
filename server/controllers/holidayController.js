const asyncHandler = require('../utils/asyncHandler');
const Holiday = require('../models/Holiday');

const getHolidays = asyncHandler(async (req, res) => {
  const { year } = req.query;
  const query = {};
  if (year) query.date = { $regex: `^${year}` };
  const holidays = await Holiday.find(query).sort({ date: 1 });
  res.json({ success: true, holidays });
});

const createHoliday = asyncHandler(async (req, res) => {
  const { name, date, description, type } = req.body;
  const holiday = await Holiday.create({ name, date, description, type });
  res.status(201).json({ success: true, message: 'Holiday added successfully', holiday });
});

const updateHoliday = asyncHandler(async (req, res) => {
  const holiday = await Holiday.findById(req.params.id);
  if (!holiday) {
    res.status(404);
    throw new Error('Holiday not found');
  }
  ['name', 'date', 'description', 'type'].forEach((f) => {
    if (req.body[f] !== undefined) holiday[f] = req.body[f];
  });
  await holiday.save();
  res.json({ success: true, message: 'Holiday updated successfully', holiday });
});

const deleteHoliday = asyncHandler(async (req, res) => {
  const holiday = await Holiday.findById(req.params.id);
  if (!holiday) {
    res.status(404);
    throw new Error('Holiday not found');
  }
  await holiday.deleteOne();
  res.json({ success: true, message: 'Holiday deleted successfully' });
});

module.exports = { getHolidays, createHoliday, updateHoliday, deleteHoliday };

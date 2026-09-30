const asyncHandler = require('../utils/asyncHandler');
const Settings = require('../models/Settings');
const AuditLog = require('../models/AuditLog');

const getSettings = asyncHandler(async (req, res) => {
  let settings = await Settings.findOne({ key: 'global' });
  if (!settings) settings = await Settings.create({ key: 'global' });
  res.json({ success: true, settings });
});

const updateSettings = asyncHandler(async (req, res) => {
  let settings = await Settings.findOne({ key: 'global' });
  if (!settings) settings = new Settings({ key: 'global' });

  const fields = [
    'companyName', 'companyLogo', 'workStartTime', 'workEndTime',
    'lateAfterMinutes', 'breakDurationMinutes', 'weekendDays', 'leaveSettings',
  ];
  fields.forEach((f) => {
    if (req.body[f] !== undefined) settings[f] = req.body[f];
  });

  await settings.save();
  await AuditLog.create({ admin: req.user._id, action: 'settings_changed', targetType: 'Settings', targetLabel: 'Global Settings' });

  res.json({ success: true, message: 'Settings updated successfully', settings });
});

module.exports = { getSettings, updateSettings };

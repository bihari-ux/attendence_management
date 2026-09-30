const asyncHandler = require('../utils/asyncHandler');
const Attendance = require('../models/Attendance');
const WorkSession = require('../models/WorkSession');
const BreakSession = require('../models/BreakSession');
const User = require('../models/User');
const Settings = require('../models/Settings');
const { toDateKey } = require('../utils/dateUtils');

// Helper: get or create today's attendance doc for an employee
const getTodayAttendance = async (employeeId) => {
  const dateKey = toDateKey();
  let attendance = await Attendance.findOne({ employee: employeeId, date: dateKey });
  return attendance;
};

const computeLive = (attendance, activeSession) => {
  let liveWorkingSeconds = attendance.totalWorkingSeconds || 0;
  if (attendance.currentState === 'working' && activeSession) {
    liveWorkingSeconds += Math.floor((Date.now() - new Date(activeSession.startedAt).getTime()) / 1000);
  }
  return liveWorkingSeconds;
};

// @desc  Start work (creates attendance record + work session)
// @route POST /api/attendance/start
const startWork = asyncHandler(async (req, res) => {
  const employeeId = req.user._id;
  const dateKey = toDateKey();

  let attendance = await Attendance.findOne({ employee: employeeId, date: dateKey });

  if (attendance && attendance.currentState === 'working') {
    res.status(400);
    throw new Error('You already have an active work session running');
  }

  const settings = (await Settings.findOne({ key: 'global' })) || {};
  const now = new Date();

  if (!attendance) {
    // Determine late status
    let isLate = false;
    if (settings.workStartTime) {
      const [h, m] = settings.workStartTime.split(':').map(Number);
      const startBoundary = new Date(now);
      startBoundary.setHours(h, m + (settings.lateAfterMinutes || 0), 0, 0);
      isLate = now > startBoundary;
    }

    const loc = req.body.locationInfo || {};
    attendance = await Attendance.create({
      employee: employeeId,
      date: dateKey,
      startTime: now,
      status: 'working',
      currentState: 'working',
      isLate,
      ip: loc.ip || req.ip?.replace('::ffff:', ''),
      device: loc.device || req.headers['user-agent'],
      city: loc.city || '',
      locationAddress: loc.address || loc.city || '',
      latitude: loc.latitude || null,
      longitude: loc.longitude || null,
    });
  } else {
    if (attendance.currentState === 'stopped') {
      res.status(400);
      throw new Error('Work has already been stopped for today');
    }
    attendance.currentState = 'working';
    attendance.status = 'working';
    await attendance.save();
  }

  const session = await WorkSession.create({
    attendance: attendance._id,
    employee: employeeId,
    startedAt: now,
  });

  res.json({ success: true, message: 'Work started', attendance, session });
});

// @desc  Pause (start break)
// @route POST /api/attendance/break/start
const startBreak = asyncHandler(async (req, res) => {
  const employeeId = req.user._id;
  const attendance = await getTodayAttendance(employeeId);

  if (!attendance || attendance.currentState !== 'working') {
    res.status(400);
    throw new Error('You must be actively working to start a break');
  }

  // Close active work session
  const activeSession = await WorkSession.findOne({ attendance: attendance._id, endedAt: null }).sort({ startedAt: -1 });
  if (activeSession) {
    const now = new Date();
    const duration = Math.floor((now - activeSession.startedAt) / 1000);
    activeSession.endedAt = now;
    activeSession.durationSeconds = duration;
    await activeSession.save();
    attendance.totalWorkingSeconds += duration;
  }

  attendance.currentState = 'on_break';
  await attendance.save();

  const breakSession = await BreakSession.create({
    attendance: attendance._id,
    employee: employeeId,
    startedAt: new Date(),
  });

  res.json({ success: true, message: 'Break started', attendance, breakSession });
});

// @desc  Resume work (end break)
// @route POST /api/attendance/break/end
const endBreak = asyncHandler(async (req, res) => {
  const employeeId = req.user._id;
  const attendance = await getTodayAttendance(employeeId);

  if (!attendance || attendance.currentState !== 'on_break') {
    res.status(400);
    throw new Error('You are not currently on a break');
  }

  const activeBreak = await BreakSession.findOne({ attendance: attendance._id, endedAt: null }).sort({ startedAt: -1 });
  if (activeBreak) {
    const now = new Date();
    const duration = Math.floor((now - activeBreak.startedAt) / 1000);
    activeBreak.endedAt = now;
    activeBreak.durationSeconds = duration;
    await activeBreak.save();
    attendance.totalBreakSeconds += duration;
  }

  attendance.currentState = 'working';
  attendance.status = 'working';
  await attendance.save();

  const session = await WorkSession.create({
    attendance: attendance._id,
    employee: employeeId,
    startedAt: new Date(),
  });

  res.json({ success: true, message: 'Work resumed', attendance, session });
});

// @desc  Stop work
// @route POST /api/attendance/stop
const stopWork = asyncHandler(async (req, res) => {
  const employeeId = req.user._id;
  const attendance = await getTodayAttendance(employeeId);

  if (!attendance || attendance.currentState === 'not_started') {
    res.status(400);
    throw new Error('You have not started work yet');
  }
  if (attendance.currentState === 'stopped') {
    res.status(400);
    throw new Error('Work has already been stopped for today');
  }

  const now = new Date();

  if (attendance.currentState === 'working') {
    const activeSession = await WorkSession.findOne({ attendance: attendance._id, endedAt: null }).sort({ startedAt: -1 });
    if (activeSession) {
      const duration = Math.floor((now - activeSession.startedAt) / 1000);
      activeSession.endedAt = now;
      activeSession.durationSeconds = duration;
      await activeSession.save();
      attendance.totalWorkingSeconds += duration;
    }
  } else if (attendance.currentState === 'on_break') {
    const activeBreak = await BreakSession.findOne({ attendance: attendance._id, endedAt: null }).sort({ startedAt: -1 });
    if (activeBreak) {
      const duration = Math.floor((now - activeBreak.startedAt) / 1000);
      activeBreak.endedAt = now;
      activeBreak.durationSeconds = duration;
      await activeBreak.save();
      attendance.totalBreakSeconds += duration;
    }
  }

  attendance.currentState = 'stopped';
  attendance.status = 'completed';
  attendance.endTime = now;
  await attendance.save();

  res.json({ success: true, message: 'Work stopped', attendance });
});

// @desc  Get today's attendance/timer state for logged-in employee
// @route GET /api/attendance/today
const getTodayStatus = asyncHandler(async (req, res) => {
  const employeeId = req.user._id;
  const attendance = await getTodayAttendance(employeeId);

  if (!attendance) {
    return res.json({
      success: true,
      attendance: null,
      liveWorkingSeconds: 0,
      currentState: 'not_started',
    });
  }

  let activeSession = null;
  if (attendance.currentState === 'working') {
    activeSession = await WorkSession.findOne({ attendance: attendance._id, endedAt: null }).sort({ startedAt: -1 });
  }
  let activeBreak = null;
  if (attendance.currentState === 'on_break') {
    activeBreak = await BreakSession.findOne({ attendance: attendance._id, endedAt: null }).sort({ startedAt: -1 });
  }

  const liveWorkingSeconds = computeLive(attendance, activeSession);
  let liveBreakSeconds = attendance.totalBreakSeconds || 0;
  if (activeBreak) {
    liveBreakSeconds += Math.floor((Date.now() - new Date(activeBreak.startedAt).getTime()) / 1000);
  }

  res.json({
    success: true,
    attendance,
    liveWorkingSeconds,
    liveBreakSeconds,
    currentState: attendance.currentState,
  });
});

// @desc  Get attendance history for logged-in employee
// @route GET /api/attendance/history
const getMyHistory = asyncHandler(async (req, res) => {
  const { from, to, limit = 60 } = req.query;
  const query = { employee: req.user._id };
  if (from && to) query.date = { $gte: from, $lte: to };

  const records = await Attendance.find(query).sort({ date: -1 }).limit(parseInt(limit));
  res.json({ success: true, count: records.length, records });
});

// @desc  Admin: get all today's attendance / employee activity
// @route GET /api/attendance/all-today
const getAllToday = asyncHandler(async (req, res) => {
  const dateKey = toDateKey();
  const records = await Attendance.find({ date: dateKey }).populate({
    path: 'employee',
    select: 'fullName employeeId department designation avatar lastLogin lastLoginInfo',
    populate: { path: 'department', select: 'name' },
  });
  res.json({ success: true, date: dateKey, records });
});

// @desc  Admin: get attendance history with filters
// @route GET /api/attendance/history-admin
const getHistoryAdmin = asyncHandler(async (req, res) => {
  const { employee, from, to, status, page = 1, limit = 20 } = req.query;
  const query = {};
  if (employee) query.employee = employee;
  if (status && status !== 'all') query.status = status;
  if (from && to) query.date = { $gte: from, $lte: to };

  const pageNum = Math.max(parseInt(page), 1);
  const limitNum = Math.max(parseInt(limit), 1);

  const total = await Attendance.countDocuments(query);
  const records = await Attendance.find(query)
    .populate({ path: 'employee', select: 'fullName employeeId department lastLogin lastLoginInfo', populate: { path: 'department', select: 'name' } })
    .sort({ date: -1 })
    .skip((pageNum - 1) * limitNum)
    .limit(limitNum);

  res.json({ success: true, total, page: pageNum, pages: Math.ceil(total / limitNum), records });
});

// @desc  Admin: get break history for an employee
// @route GET /api/attendance/:employeeId/breaks
const getBreakHistory = asyncHandler(async (req, res) => {
  const breaks = await BreakSession.find({ employee: req.params.employeeId }).sort({ startedAt: -1 }).limit(100);
  res.json({ success: true, breaks });
});

module.exports = {
  startWork,
  startBreak,
  endBreak,
  stopWork,
  getTodayStatus,
  getMyHistory,
  getAllToday,
  getHistoryAdmin,
  getBreakHistory,
};

const asyncHandler = require('../utils/asyncHandler');
const AuditLog = require('../models/AuditLog');
const Attendance = require('../models/Attendance');
const Task = require('../models/Task');
const Leave = require('../models/Leave');
const { toDateKey } = require('../utils/dateUtils');

// @desc  Admin: Get paginated audit logs
// @route GET /api/audit-logs
const getAuditLogs = asyncHandler(async (req, res) => {
  const { page = 1, limit = 30, action } = req.query;
  const pageNum  = Math.max(parseInt(page), 1);
  const limitNum = Math.max(parseInt(limit), 1);

  const query = {};
  if (action && action !== 'all') query.action = action;

  const total = await AuditLog.countDocuments(query);
  const logs  = await AuditLog.find(query)
    .populate('admin', 'fullName employeeId role')
    .sort({ createdAt: -1 })
    .skip((pageNum - 1) * limitNum)
    .limit(limitNum);

  res.json({ success: true, total, page: pageNum, pages: Math.ceil(total / limitNum), logs });
});

// @desc  Employee: Get own activity history (attendance + tasks + leaves)
// @route GET /api/audit-logs/my-history
const getMyHistory = asyncHandler(async (req, res) => {
  const { limit = 60 } = req.query;
  const empId = req.user._id;
  const lim   = parseInt(limit);

  const [attendance, tasks, leaves] = await Promise.all([
    Attendance.find({ employee: empId })
      .sort({ date: -1 })
      .limit(lim),
    Task.find({ assignedTo: empId })
      .sort({ updatedAt: -1 })
      .limit(30),
    Leave.find({ employee: empId })
      .sort({ createdAt: -1 })
      .limit(20),
  ]);

  // Build a unified timeline
  const timeline = [];

  for (const a of attendance) {
    timeline.push({
      _id: a._id,
      type: 'attendance',
      date: a.date,
      timestamp: a.startTime || new Date(a.date),
      status: a.status,
      currentState: a.currentState,
      workingHours: ((a.totalWorkingSeconds || 0) / 3600).toFixed(1),
      isLate: a.isLate,
      startTime: a.startTime,
      endTime: a.endTime,
    });
  }

  for (const t of tasks) {
    timeline.push({
      _id: t._id,
      type: 'task',
      date: t.taskDate,
      timestamp: t.updatedAt || t.createdAt,
      title: t.title,
      status: t.status,
      priority: t.priority,
      completedAt: t.completedAt,
    });
  }

  for (const l of leaves) {
    timeline.push({
      _id: l._id,
      type: 'leave',
      date: l.startDate,
      timestamp: l.createdAt,
      leaveType: l.leaveType,
      status: l.status,
      days: l.days,
      reason: l.reason,
      startDate: l.startDate,
      endDate: l.endDate,
    });
  }

  // Sort by timestamp desc
  timeline.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

  res.json({ success: true, count: timeline.length, timeline });
});

module.exports = { getAuditLogs, getMyHistory };

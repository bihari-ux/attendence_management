const asyncHandler = require('../utils/asyncHandler');
const { Parser } = require('json2csv');
const Attendance = require('../models/Attendance');
const Task = require('../models/Task');

// @desc  Attendance report with filters + optional CSV export
// @route GET /api/reports/attendance
const attendanceReport = asyncHandler(async (req, res) => {
  const { from, to, employee, department, status, format } = req.query;
  const query = {};
  if (from && to) query.date = { $gte: from, $lte: to };
  if (employee) query.employee = employee;
  if (status && status !== 'all') query.status = status;

  let records = await Attendance.find(query)
    .populate({ path: 'employee', select: 'fullName employeeId department', populate: { path: 'department', select: 'name' } })
    .sort({ date: -1 });

  if (department && department !== 'all') {
    records = records.filter((r) => r.employee?.department?._id?.toString() === department);
  }

  const rows = records.map((r) => ({
    Employee: r.employee?.fullName || 'N/A',
    'Employee ID': r.employee?.employeeId || 'N/A',
    Department: r.employee?.department?.name || 'N/A',
    Date: r.date,
    'Start Time': r.startTime ? new Date(r.startTime).toLocaleTimeString() : '-',
    'End Time': r.endTime ? new Date(r.endTime).toLocaleTimeString() : '-',
    'Working Hours': (r.totalWorkingSeconds / 3600).toFixed(2),
    'Break Hours': (r.totalBreakSeconds / 3600).toFixed(2),
    Status: r.status,
  }));

  if (format === 'csv') {
    const parser = new Parser();
    const csv = parser.parse(rows);
    res.header('Content-Type', 'text/csv');
    res.attachment('attendance-report.csv');
    return res.send(csv);
  }

  res.json({ success: true, count: rows.length, records: rows });
});

// @desc  Task report with filters + optional CSV export
// @route GET /api/reports/tasks
const taskReport = asyncHandler(async (req, res) => {
  const { from, to, employee, department, status, priority, format } = req.query;
  const query = {};
  if (from && to) query.taskDate = { $gte: from, $lte: to };
  if (employee) query.assignedTo = employee;
  if (department && department !== 'all') query.department = department;
  if (status && status !== 'all') query.status = status;
  if (priority && priority !== 'all') query.priority = priority;

  const tasks = await Task.find(query).populate('assignedTo', 'fullName employeeId').sort({ taskDate: -1 });

  const total = tasks.length;
  const completed = tasks.filter((t) => t.status === 'completed').length;
  const pending = tasks.filter((t) => t.status === 'pending').length;
  const inProgress = tasks.filter((t) => t.status === 'in_progress').length;
  const totalTimeSpent = tasks.reduce((s, t) => s + (t.actualTimeMinutes || 0), 0);

  const rows = tasks.map((t) => ({
    Title: t.title,
    Employee: t.assignedTo?.fullName || 'N/A',
    Date: t.taskDate,
    Priority: t.priority,
    Status: t.status,
    'Estimated (min)': t.estimatedTimeMinutes,
    'Actual (min)': t.actualTimeMinutes,
  }));

  if (format === 'csv') {
    const parser = new Parser();
    const csv = parser.parse(rows);
    res.header('Content-Type', 'text/csv');
    res.attachment('task-report.csv');
    return res.send(csv);
  }

  res.json({
    success: true,
    summary: {
      total,
      completed,
      pending,
      inProgress,
      completionRate: total ? ((completed / total) * 100).toFixed(1) : 0,
      totalTimeSpentMinutes: totalTimeSpent,
    },
    records: rows,
  });
});

module.exports = { attendanceReport, taskReport };

const asyncHandler = require('../utils/asyncHandler');
const Leave = require('../models/Leave');
const Attendance = require('../models/Attendance');
const User = require('../models/User');
const notify = require('../utils/notify');
const { daysBetween, eachDateInRange } = require('../utils/dateUtils');

// @desc  Get leaves (employee: own, admin: all with filters)
// @route GET /api/leaves
const getLeaves = asyncHandler(async (req, res) => {
  const { employee, status, page = 1, limit = 20 } = req.query;
  const query = {};

  if (req.user.role === 'employee') {
    query.employee = req.user._id;
  } else if (employee) {
    query.employee = employee;
  }
  if (status && status !== 'all') query.status = status;

  const pageNum = Math.max(parseInt(page), 1);
  const limitNum = Math.max(parseInt(limit), 1);

  const total = await Leave.countDocuments(query);
  const leaves = await Leave.find(query)
    .populate('employee', 'fullName employeeId department')
    .populate('reviewedBy', 'fullName')
    .sort({ createdAt: -1 })
    .skip((pageNum - 1) * limitNum)
    .limit(limitNum);

  res.json({ success: true, total, page: pageNum, pages: Math.ceil(total / limitNum), leaves });
});

// @desc  Apply for leave
// @route POST /api/leaves
const applyLeave = asyncHandler(async (req, res) => {
  const { leaveType, startDate, endDate, reason } = req.body;

  if (new Date(endDate) < new Date(startDate)) {
    res.status(400);
    throw new Error('End date cannot be before start date');
  }

  const days = daysBetween(startDate, endDate);

  const leave = await Leave.create({
    employee: req.user._id,
    leaveType,
    startDate,
    endDate,
    days,
    reason,
    status: 'pending',
  });

  // Notify all admins
  const admins = await User.find({ role: 'admin' });
  await Promise.all(
    admins.map((admin) =>
      notify({
        recipient: admin._id,
        title: 'New Leave Request',
        message: `${req.user.fullName} applied for ${leaveType} leave (${days} day(s))`,
        type: 'leave_request',
      })
    )
  );

  res.status(201).json({ success: true, message: 'Leave application submitted successfully', leave });
});

// @desc  Approve leave
// @route PATCH /api/leaves/:id/approve
const approveLeave = asyncHandler(async (req, res) => {
  const leave = await Leave.findById(req.params.id);
  if (!leave) {
    res.status(404);
    throw new Error('Leave request not found');
  }
  if (leave.status !== 'pending') {
    res.status(400);
    throw new Error('This leave request has already been reviewed');
  }

  leave.status = 'approved';
  leave.adminComment = req.body.adminComment || '';
  leave.reviewedBy = req.user._id;
  leave.reviewedAt = new Date();
  await leave.save();

  // Mark attendance as on_leave for each date in range
  const dates = eachDateInRange(leave.startDate, leave.endDate);
  for (const dateKey of dates) {
    await Attendance.findOneAndUpdate(
      { employee: leave.employee, date: dateKey },
      { employee: leave.employee, date: dateKey, status: 'on_leave', currentState: 'not_started' },
      { upsert: true, new: true }
    );
  }

  await notify({
    recipient: leave.employee,
    title: 'Leave Approved',
    message: `Your ${leave.leaveType} leave request has been approved`,
    type: 'leave_approved',
  });

  res.json({ success: true, message: 'Leave approved successfully', leave });
});

// @desc  Reject leave
// @route PATCH /api/leaves/:id/reject
const rejectLeave = asyncHandler(async (req, res) => {
  const leave = await Leave.findById(req.params.id);
  if (!leave) {
    res.status(404);
    throw new Error('Leave request not found');
  }
  if (leave.status !== 'pending') {
    res.status(400);
    throw new Error('This leave request has already been reviewed');
  }

  leave.status = 'rejected';
  leave.adminComment = req.body.adminComment || '';
  leave.reviewedBy = req.user._id;
  leave.reviewedAt = new Date();
  await leave.save();

  await notify({
    recipient: leave.employee,
    title: 'Leave Rejected',
    message: `Your ${leave.leaveType} leave request has been rejected${leave.adminComment ? ': ' + leave.adminComment : ''}`,
    type: 'leave_rejected',
  });

  res.json({ success: true, message: 'Leave rejected', leave });
});

module.exports = { getLeaves, applyLeave, approveLeave, rejectLeave };

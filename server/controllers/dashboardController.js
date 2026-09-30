const asyncHandler = require('../utils/asyncHandler');
const User = require('../models/User');
const Attendance = require('../models/Attendance');
const Task = require('../models/Task');
const Leave = require('../models/Leave');
const { toDateKey } = require('../utils/dateUtils');

// @desc  Admin dashboard summary
// @route GET /api/dashboard/admin
const getAdminDashboard = asyncHandler(async (req, res) => {
  const dateKey = toDateKey();
  const totalEmployees = await User.countDocuments({ role: 'employee' });
  const activeEmployees = await User.countDocuments({ role: 'employee', status: 'active' });

  const todayAttendance = await Attendance.find({ date: dateKey });
  const present = todayAttendance.filter((a) => ['present', 'working', 'completed'].includes(a.status)).length;
  const onLeave = todayAttendance.filter((a) => a.status === 'on_leave').length;
  const workingNow = todayAttendance.filter((a) => a.currentState === 'working').length;
  const onBreak = todayAttendance.filter((a) => a.currentState === 'on_break').length;
  const absent = Math.max(activeEmployees - todayAttendance.length, 0);

  const tasksToday = await Task.countDocuments({ taskDate: dateKey });
  const tasksCompletedToday = await Task.countDocuments({ taskDate: dateKey, status: 'completed' });
  const pendingTasks = await Task.countDocuments({ status: { $ne: 'completed' } });
  const totalTasksAssigned = await Task.countDocuments({});

  const pendingLeaves = await Leave.countDocuments({ status: 'pending' });

  // Weekly attendance chart (last 7 days)
  const weekly = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const key = toDateKey(d);
    const records = await Attendance.find({ date: key });
    weekly.push({
      date: key,
      present: records.filter((r) => ['present', 'working', 'completed'].includes(r.status)).length,
      absent: Math.max(activeEmployees - records.length, 0),
      onLeave: records.filter((r) => r.status === 'on_leave').length,
    });
  }

  res.json({
    success: true,
    stats: {
      totalEmployees,
      presentToday: present,
      absentToday: absent,
      onLeave,
      currentlyWorking: workingNow,
      onBreak,
      tasksAssigned: totalTasksAssigned,
      tasksCompleted: tasksCompletedToday,
      pendingTasks,
      pendingLeaves,
    },
    weeklyAttendance: weekly,
  });
});

// @desc  Employee dashboard summary
// @route GET /api/dashboard/employee
const getEmployeeDashboard = asyncHandler(async (req, res) => {
  const employeeId = req.user._id;
  const dateKey = toDateKey();

  const todayAttendance = await Attendance.findOne({ employee: employeeId, date: dateKey });
  const todayTasks = await Task.find({ assignedTo: employeeId, taskDate: dateKey });
  const completedToday = todayTasks.filter((t) => t.status === 'completed').length;
  const pendingToday = todayTasks.filter((t) => t.status !== 'completed').length;

  const totalTasks = await Task.countDocuments({ assignedTo: employeeId });
  const totalCompleted = await Task.countDocuments({ assignedTo: employeeId, status: 'completed' });

  const allAttendance = await Attendance.find({ employee: employeeId });
  const presentDays = allAttendance.filter((a) => ['present', 'working', 'completed'].includes(a.status)).length;
  const totalWorkingSeconds = allAttendance.reduce((s, a) => s + (a.totalWorkingSeconds || 0), 0);

  const pendingLeaves = await Leave.countDocuments({ employee: employeeId, status: 'pending' });

  res.json({
    success: true,
    todayAttendance,
    stats: {
      todayTasks: todayTasks.length,
      completedToday,
      pendingToday,
      totalTasks,
      totalCompleted,
      presentDays,
      totalWorkingHours: (totalWorkingSeconds / 3600).toFixed(1),
      pendingLeaves,
    },
    recentTasks: todayTasks.slice(0, 5),
  });
});

module.exports = { getAdminDashboard, getEmployeeDashboard };

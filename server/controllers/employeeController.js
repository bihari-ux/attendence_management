const asyncHandler = require('../utils/asyncHandler');
const User = require('../models/User');
const Attendance = require('../models/Attendance');
const Task = require('../models/Task');
const Leave = require('../models/Leave');
const AuditLog = require('../models/AuditLog');
const notify = require('../utils/notify');
const { toDateKey } = require('../utils/dateUtils');

const logAudit = (admin, action, targetType, targetId, targetLabel, details = '') =>
  AuditLog.create({ admin, action, targetType, targetId, targetLabel, details });

// @desc  Get all employees with search/filter/sort/pagination
// @route GET /api/employees
const getEmployees = asyncHandler(async (req, res) => {
  const { search, department, status, sortBy = 'createdAt', order = 'desc', page = 1, limit = 10 } = req.query;

  const query = { role: 'employee' };
  if (status && status !== 'all') query.status = status;
  if (department && department !== 'all') query.department = department;
  if (search) {
    query.$or = [
      { fullName: { $regex: search, $options: 'i' } },
      { employeeId: { $regex: search, $options: 'i' } },
      { email: { $regex: search, $options: 'i' } },
      { designation: { $regex: search, $options: 'i' } },
    ];
  }

  const pageNum = Math.max(parseInt(page), 1);
  const limitNum = Math.max(parseInt(limit), 1);

  const total = await User.countDocuments(query);
  const employees = await User.find(query)
    .populate('department', 'name')
    .sort({ [sortBy]: order === 'asc' ? 1 : -1 })
    .skip((pageNum - 1) * limitNum)
    .limit(limitNum);

  res.json({
    success: true,
    count: employees.length,
    total,
    page: pageNum,
    pages: Math.ceil(total / limitNum),
    employees,
  });
});

// @desc  Get single employee with stats
// @route GET /api/employees/:id
const getEmployee = asyncHandler(async (req, res) => {
  const employee = await User.findById(req.params.id).populate('department', 'name');
  if (!employee) {
    res.status(404);
    throw new Error('Employee not found');
  }

  const attendanceRecords = await Attendance.find({ employee: employee._id });
  const presentDays = attendanceRecords.filter((a) => ['present', 'working', 'completed'].includes(a.status)).length;
  const totalWorkingSeconds = attendanceRecords.reduce((sum, a) => sum + (a.totalWorkingSeconds || 0), 0);
  const avgWorkingSeconds = presentDays ? totalWorkingSeconds / presentDays : 0;

  const leaveDays = await Leave.aggregate([
    { $match: { employee: employee._id, status: 'approved' } },
    { $group: { _id: null, total: { $sum: '$days' } } },
  ]);

  const completedTasks = await Task.countDocuments({ assignedTo: employee._id, status: 'completed' });
  const pendingTasks = await Task.countDocuments({ assignedTo: employee._id, status: { $ne: 'completed' } });

  res.json({
    success: true,
    employee,
    stats: {
      totalWorkingHours: (totalWorkingSeconds / 3600).toFixed(1),
      avgWorkingHours: (avgWorkingSeconds / 3600).toFixed(1),
      presentDays,
      leaveDays: leaveDays[0]?.total || 0,
      completedTasks,
      pendingTasks,
    },
  });
});

// @desc  Create employee (admin only)
// @route POST /api/employees
const createEmployee = asyncHandler(async (req, res) => {
  const { fullName, employeeId, email, phone, department, designation, joiningDate, password, status } = req.body;

  const exists = await User.findOne({ $or: [{ email: email.toLowerCase() }, { employeeId }] });
  if (exists) {
    res.status(400);
    throw new Error('Employee with this email or employee ID already exists');
  }

  const employee = await User.create({
    fullName,
    employeeId,
    email,
    phone,
    department: department || undefined,
    designation,
    joiningDate,
    password: password || 'Welcome@123',
    role: 'employee',
    status: status || 'active',
    mustChangePassword: true,
  });

  await logAudit(req.user._id, 'employee_created', 'User', employee._id, employee.fullName);
  await notify({
    recipient: employee._id,
    title: 'Welcome aboard!',
    message: `Your employee account has been created. Employee ID: ${employee.employeeId}`,
    type: 'general',
  });

  res.status(201).json({ success: true, message: 'Employee created successfully', employee });
});

// @desc  Update employee
// @route PUT /api/employees/:id
const updateEmployee = asyncHandler(async (req, res) => {
  const employee = await User.findById(req.params.id);
  if (!employee || employee.role !== 'employee') {
    res.status(404);
    throw new Error('Employee not found');
  }

  const fields = ['fullName', 'phone', 'department', 'designation', 'joiningDate', 'email', 'employeeId'];
  fields.forEach((f) => {
    if (req.body[f] !== undefined) employee[f] = req.body[f];
  });

  await employee.save();
  await logAudit(req.user._id, 'employee_updated', 'User', employee._id, employee.fullName);

  res.json({ success: true, message: 'Employee updated successfully', employee });
});

// @desc  Activate/Deactivate employee
// @route PATCH /api/employees/:id/status
const updateEmployeeStatus = asyncHandler(async (req, res) => {
  const { status } = req.body;
  if (!['active', 'inactive'].includes(status)) {
    res.status(400);
    throw new Error('Invalid status value');
  }

  const employee = await User.findById(req.params.id);
  if (!employee || employee.role !== 'employee') {
    res.status(404);
    throw new Error('Employee not found');
  }

  employee.status = status;
  await employee.save();

  await logAudit(
    req.user._id,
    status === 'active' ? 'employee_activated' : 'employee_deactivated',
    'User',
    employee._id,
    employee.fullName
  );

  await notify({
    recipient: employee._id,
    title: 'Account Status Changed',
    message: `Your account has been ${status === 'active' ? 'activated' : 'deactivated'} by admin.`,
    type: 'account_status',
  });

  res.json({ success: true, message: `Employee ${status === 'active' ? 'activated' : 'deactivated'} successfully`, employee });
});

// @desc  Delete employee
// @route DELETE /api/employees/:id
const deleteEmployee = asyncHandler(async (req, res) => {
  const employee = await User.findById(req.params.id);
  if (!employee || employee.role !== 'employee') {
    res.status(404);
    throw new Error('Employee not found');
  }

  const label = employee.fullName;
  await employee.deleteOne();
  await logAudit(req.user._id, 'employee_deleted', 'User', req.params.id, label);

  res.json({ success: true, message: 'Employee deleted successfully' });
});

// @desc  Reset employee password (admin)
// @route PATCH /api/employees/:id/reset-password
const resetEmployeePassword = asyncHandler(async (req, res) => {
  const employee = await User.findById(req.params.id);
  if (!employee) {
    res.status(404);
    throw new Error('Employee not found');
  }

  const newPassword = req.body.password || 'Welcome@123';
  if (newPassword.length < 6) {
    res.status(400);
    throw new Error('Password must be at least 6 characters long');
  }

  employee.password = newPassword;
  employee.mustChangePassword = req.body.mustChangePassword !== undefined ? Boolean(req.body.mustChangePassword) : false;
  await employee.save();

  await logAudit(
    req.user._id,
    'password_reset',
    'User',
    employee._id,
    employee.fullName,
    `Admin changed password for ${employee.fullName} (${employee.employeeId})`
  );

  res.json({
    success: true,
    message: `Password updated successfully for ${employee.fullName}`,
    employeeId: employee.employeeId,
    tempPassword: newPassword,
  });
});

// @desc  Reset passwords for all employees (admin command)
// @route POST /api/employees/reset-all-passwords
const resetAllEmployeesPassword = asyncHandler(async (req, res) => {
  const newPassword = req.body.password || 'Welcome@123';
  if (newPassword.length < 6) {
    res.status(400);
    throw new Error('Password must be at least 6 characters long');
  }

  const mustChange = req.body.mustChangePassword !== undefined ? Boolean(req.body.mustChangePassword) : false;

  const employees = await User.find({ role: 'employee' });
  for (const emp of employees) {
    emp.password = newPassword;
    emp.mustChangePassword = mustChange;
    await emp.save();
  }

  await logAudit(
    req.user._id,
    'all_passwords_reset',
    'User',
    req.user._id,
    'All Employees',
    `Admin executed command to change password for all ${employees.length} employees`
  );

  res.json({
    success: true,
    message: `Password reset successfully for all ${employees.length} employee accounts`,
    affectedCount: employees.length,
    password: newPassword,
  });
});

module.exports = {
  getEmployees,
  getEmployee,
  createEmployee,
  updateEmployee,
  updateEmployeeStatus,
  deleteEmployee,
  resetEmployeePassword,
  resetAllEmployeesPassword,
};


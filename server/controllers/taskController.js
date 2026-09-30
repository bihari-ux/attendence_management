const asyncHandler = require('../utils/asyncHandler');
const Task = require('../models/Task');
const TaskTimeLog = require('../models/TaskTimeLog');
const notify = require('../utils/notify');
const { toDateKey } = require('../utils/dateUtils');

// @desc  Get tasks (role aware: employee sees own, admin sees all with filters)
// @route GET /api/tasks
const getTasks = asyncHandler(async (req, res) => {
  const { employee, department, status, priority, date, search, page = 1, limit = 20 } = req.query;
  const query = {};

  if (req.user.role === 'employee') {
    query.assignedTo = req.user._id;
  } else if (employee) {
    query.assignedTo = employee;
  }

  if (department) query.department = department;
  if (status && status !== 'all') query.status = status;
  if (priority && priority !== 'all') query.priority = priority;
  if (date) query.taskDate = date;
  if (search) query.title = { $regex: search, $options: 'i' };

  const pageNum = Math.max(parseInt(page), 1);
  const limitNum = Math.max(parseInt(limit), 1);

  const total = await Task.countDocuments(query);
  const tasks = await Task.find(query)
    .populate('assignedTo', 'fullName employeeId')
    .populate('createdBy', 'fullName')
    .populate('department', 'name')
    .sort({ createdAt: -1 })
    .skip((pageNum - 1) * limitNum)
    .limit(limitNum);

  res.json({ success: true, total, page: pageNum, pages: Math.ceil(total / limitNum), tasks });
});

// @desc  Get single task with time logs
// @route GET /api/tasks/:id
const getTask = asyncHandler(async (req, res) => {
  const task = await Task.findById(req.params.id)
    .populate('assignedTo', 'fullName employeeId')
    .populate('createdBy', 'fullName')
    .populate('department', 'name');

  if (!task) {
    res.status(404);
    throw new Error('Task not found');
  }

  if (req.user.role === 'employee' && String(task.assignedTo._id) !== String(req.user._id)) {
    res.status(403);
    throw new Error('You do not have access to this task');
  }

  const timeLogs = await TaskTimeLog.find({ task: task._id }).sort({ createdAt: -1 });

  res.json({ success: true, task, timeLogs });
});

// @desc  Create task (admin assigns, or employee creates own daily task)
// @route POST /api/tasks
const createTask = asyncHandler(async (req, res) => {
  const { title, description, taskDate, priority, estimatedTimeMinutes, deadline, department, assignedTo } = req.body;

  const targetEmployee = req.user.role === 'admin' ? assignedTo : req.user._id;
  if (!targetEmployee) {
    res.status(400);
    throw new Error('assignedTo is required');
  }

  const task = await Task.create({
    title,
    description,
    taskDate: taskDate || toDateKey(),
    priority: priority || 'medium',
    estimatedTimeMinutes: estimatedTimeMinutes || 0,
    deadline,
    department,
    assignedTo: targetEmployee,
    createdBy: req.user._id,
  });

  if (req.user.role === 'admin' && String(targetEmployee) !== String(req.user._id)) {
    await notify({
      recipient: targetEmployee,
      title: 'New Task Assigned',
      message: `You have been assigned a new task: "${title}"`,
      type: 'task_assigned',
    });
  }

  res.status(201).json({ success: true, message: 'Task created successfully', task });
});

// @desc  Update task
// @route PUT /api/tasks/:id
const updateTask = asyncHandler(async (req, res) => {
  const task = await Task.findById(req.params.id);
  if (!task) {
    res.status(404);
    throw new Error('Task not found');
  }

  if (req.user.role === 'employee' && String(task.assignedTo) !== String(req.user._id)) {
    res.status(403);
    throw new Error('You do not have access to this task');
  }

  const employeeEditableFields = ['description', 'actualTimeMinutes'];
  const adminEditableFields = ['title', 'description', 'priority', 'estimatedTimeMinutes', 'deadline', 'department', 'assignedTo', 'taskDate'];
  const allowedFields = req.user.role === 'admin' ? adminEditableFields : employeeEditableFields;

  allowedFields.forEach((f) => {
    if (req.body[f] !== undefined) task[f] = req.body[f];
  });

  await task.save();

  if (req.user.role === 'admin') {
    await notify({
      recipient: task.assignedTo,
      title: 'Task Updated',
      message: `Your task "${task.title}" has been updated by admin`,
      type: 'task_updated',
    });
  }

  res.json({ success: true, message: 'Task updated successfully', task });
});

// @desc  Update task status
// @route PATCH /api/tasks/:id/status
const updateTaskStatus = asyncHandler(async (req, res) => {
  const { status } = req.body;
  if (!['pending', 'in_progress', 'completed'].includes(status)) {
    res.status(400);
    throw new Error('Invalid status');
  }

  const task = await Task.findById(req.params.id);
  if (!task) {
    res.status(404);
    throw new Error('Task not found');
  }

  if (req.user.role === 'employee' && String(task.assignedTo) !== String(req.user._id)) {
    res.status(403);
    throw new Error('You do not have access to this task');
  }

  task.status = status;
  if (status === 'completed') task.completedAt = new Date();
  await task.save();

  if (status === 'completed' && req.user.role === 'employee') {
    await notify({
      recipient: task.createdBy,
      title: 'Task Completed',
      message: `${req.user.fullName} completed the task "${task.title}"`,
      type: 'task_completed',
    });
  }

  res.json({ success: true, message: 'Task status updated', task });
});

// @desc  Delete task
// @route DELETE /api/tasks/:id
const deleteTask = asyncHandler(async (req, res) => {
  const task = await Task.findById(req.params.id);
  if (!task) {
    res.status(404);
    throw new Error('Task not found');
  }
  await task.deleteOne();
  await TaskTimeLog.deleteMany({ task: task._id });
  res.json({ success: true, message: 'Task deleted successfully' });
});

// @desc  Log time spent on a task
// @route POST /api/tasks/:id/time-log
const logTaskTime = asyncHandler(async (req, res) => {
  const { startTime, endTime, minutesSpent, note } = req.body;
  const task = await Task.findById(req.params.id);
  if (!task) {
    res.status(404);
    throw new Error('Task not found');
  }
  if (req.user.role === 'employee' && String(task.assignedTo) !== String(req.user._id)) {
    res.status(403);
    throw new Error('You do not have access to this task');
  }

  let minutes = minutesSpent;
  if (!minutes && startTime && endTime) {
    minutes = Math.max(0, Math.round((new Date(endTime) - new Date(startTime)) / 60000));
  }

  const log = await TaskTimeLog.create({
    task: task._id,
    employee: task.assignedTo,
    startTime,
    endTime,
    minutesSpent: minutes || 0,
    note,
  });

  task.actualTimeMinutes = (task.actualTimeMinutes || 0) + (minutes || 0);
  await task.save();

  res.status(201).json({ success: true, message: 'Time logged successfully', log, task });
});

module.exports = { getTasks, getTask, createTask, updateTask, updateTaskStatus, deleteTask, logTaskTime };

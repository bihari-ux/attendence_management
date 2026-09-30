const asyncHandler = require('../utils/asyncHandler');
const Department = require('../models/Department');

const getDepartments = asyncHandler(async (req, res) => {
  const departments = await Department.find({}).sort({ name: 1 });
  res.json({ success: true, departments });
});

const createDepartment = asyncHandler(async (req, res) => {
  const { name, description } = req.body;
  const exists = await Department.findOne({ name });
  if (exists) {
    res.status(400);
    throw new Error('Department already exists');
  }
  const department = await Department.create({ name, description });
  res.status(201).json({ success: true, department });
});

const deleteDepartment = asyncHandler(async (req, res) => {
  const dept = await Department.findById(req.params.id);
  if (!dept) {
    res.status(404);
    throw new Error('Department not found');
  }
  await dept.deleteOne();
  res.json({ success: true, message: 'Department deleted' });
});

module.exports = { getDepartments, createDepartment, deleteDepartment };

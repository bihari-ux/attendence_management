const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/authMiddleware');
const { getDepartments, createDepartment, deleteDepartment } = require('../controllers/departmentController');

router.get('/', protect, getDepartments);
router.post('/', protect, authorize('admin'), createDepartment);
router.delete('/:id', protect, authorize('admin'), deleteDepartment);

module.exports = router;

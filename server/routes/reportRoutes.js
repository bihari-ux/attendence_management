const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/authMiddleware');
const { attendanceReport, taskReport } = require('../controllers/reportController');

router.use(protect, authorize('admin'));
router.get('/attendance', attendanceReport);
router.get('/tasks', taskReport);

module.exports = router;

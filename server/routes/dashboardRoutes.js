const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/authMiddleware');
const { getAdminDashboard, getEmployeeDashboard } = require('../controllers/dashboardController');

router.get('/admin', protect, authorize('admin'), getAdminDashboard);
router.get('/employee', protect, getEmployeeDashboard);

module.exports = router;

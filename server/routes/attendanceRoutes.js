const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/authMiddleware');
const {
  startWork, startBreak, endBreak, stopWork, getTodayStatus,
  getMyHistory, getAllToday, getHistoryAdmin, getBreakHistory,
} = require('../controllers/attendanceController');

router.use(protect);

// Employee routes
router.post('/start', startWork);
router.post('/stop', stopWork);
router.post('/break/start', startBreak);
router.post('/break/end', endBreak);
router.get('/today', getTodayStatus);
router.get('/history', getMyHistory);

// Admin routes
router.get('/all-today', authorize('admin'), getAllToday);
router.get('/history-admin', authorize('admin'), getHistoryAdmin);
router.get('/:employeeId/breaks', authorize('admin'), getBreakHistory);

module.exports = router;

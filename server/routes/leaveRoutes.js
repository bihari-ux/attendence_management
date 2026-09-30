const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/authMiddleware');
const { getLeaves, applyLeave, approveLeave, rejectLeave } = require('../controllers/leaveController');

router.use(protect);

router.route('/').get(getLeaves).post(applyLeave);
router.patch('/:id/approve', authorize('admin'), approveLeave);
router.patch('/:id/reject', authorize('admin'), rejectLeave);

module.exports = router;

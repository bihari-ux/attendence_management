const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/authMiddleware');
const { getHolidays, createHoliday, updateHoliday, deleteHoliday } = require('../controllers/holidayController');

router.use(protect);

router.route('/').get(getHolidays).post(authorize('admin'), createHoliday);
router.route('/:id').put(authorize('admin'), updateHoliday).delete(authorize('admin'), deleteHoliday);

module.exports = router;

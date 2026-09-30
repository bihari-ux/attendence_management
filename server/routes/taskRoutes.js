const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { getTasks, getTask, createTask, updateTask, updateTaskStatus, deleteTask, logTaskTime } = require('../controllers/taskController');

router.use(protect);

router.route('/').get(getTasks).post(createTask);
router.route('/:id').get(getTask).put(updateTask).delete(deleteTask);
router.patch('/:id/status', updateTaskStatus);
router.post('/:id/time-log', logTaskTime);

module.exports = router;

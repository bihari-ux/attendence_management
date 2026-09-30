const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/authMiddleware');
const {
  getEmployees, getEmployee, createEmployee, updateEmployee,
  updateEmployeeStatus, deleteEmployee, resetEmployeePassword,
  resetAllEmployeesPassword,
} = require('../controllers/employeeController');

router.use(protect, authorize('admin'));

router.route('/').get(getEmployees).post(createEmployee);
router.post('/reset-all-passwords', resetAllEmployeesPassword);
router.route('/:id').get(getEmployee).put(updateEmployee).delete(deleteEmployee);
router.patch('/:id/status', updateEmployeeStatus);
router.patch('/:id/reset-password', resetEmployeePassword);

module.exports = router;


const express = require('express');
const { body } = require('express-validator');
const router = express.Router();
const validate = require('../middleware/validate');
const { protect } = require('../middleware/authMiddleware');
const {
  signupAdmin, login, getMe, logout, forgotPassword,
  changePassword, updateProfile, getAdminStatus,
} = require('../controllers/authController');

router.get('/admin-status', getAdminStatus);


router.post(
  '/signup',
  [
    body('fullName').trim().notEmpty().withMessage('Full name is required'),
    body('email').isEmail().withMessage('Valid email is required'),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  ],
  validate,
  signupAdmin
);

router.post(
  '/login',
  [
    body('emailOrId').trim().notEmpty().withMessage('Email or Employee ID is required'),
    body('password').notEmpty().withMessage('Password is required'),
  ],
  validate,
  login
);

router.post('/forgot-password', forgotPassword);
router.post('/logout', protect, logout);
router.get('/me', protect, getMe);

router.put(
  '/change-password',
  protect,
  [
    body('currentPassword').notEmpty().withMessage('Current password is required'),
    body('newPassword').isLength({ min: 6 }).withMessage('New password must be at least 6 characters'),
  ],
  validate,
  changePassword
);

// Update own profile (name, phone, avatar)
router.put('/profile', protect, updateProfile);

module.exports = router;

const asyncHandler = require('../utils/asyncHandler');
const generateToken = require('../utils/generateToken');
const User = require('../models/User');

// @desc   User signup (Admin setup if first user, else Employee registration)
// @route  POST /api/auth/signup
const signupAdmin = asyncHandler(async (req, res) => {
  const { fullName, email, password, phone, rolePreference } = req.body;

  const emailExists = await User.findOne({ email: email.toLowerCase() });
  if (emailExists) {
    res.status(400);
    throw new Error('Email already registered. Please sign in instead.');
  }

  const adminExists = await User.findOne({ role: 'admin' });
  let assignedRole = 'employee';
  let employeeId = 'EMP' + Math.floor(100000 + Math.random() * 900000);
  let designation = 'Team Member';

  if (!adminExists || rolePreference === 'admin') {
    if (!adminExists) {
      assignedRole = 'admin';
      employeeId = 'ADM' + Date.now().toString().slice(-6);
      designation = 'Administrator';
    } else {
      res.status(400);
      throw new Error('An administrator already exists. Please sign in or register as an employee.');
    }
  }

  const user = await User.create({
    fullName: fullName.trim(),
    email: email.toLowerCase().trim(),
    phone: phone || '',
    password,
    role: assignedRole,
    employeeId,
    designation,
    status: 'active',
  });

  res.status(201).json({
    success: true,
    message: assignedRole === 'admin' 
      ? 'Master Admin account initialized successfully!' 
      : `Account created successfully! Your Employee ID is ${employeeId}.`,
    token: generateToken(user._id, user.role),
    user: user.toSafeObject(),
  });
});

// @desc   Login (admin or employee)
// @route  POST /api/auth/login
const login = asyncHandler(async (req, res) => {
  const { emailOrId, password } = req.body;

  if (!emailOrId || !password) {
    res.status(400);
    throw new Error('Please provide email/employee ID and password');
  }

  const user = await User.findOne({
    $or: [{ email: emailOrId.toLowerCase() }, { employeeId: emailOrId }],
  }).select('+password').populate('department', 'name');

  if (!user) { res.status(401); throw new Error('Invalid credentials'); }

  const isMatch = await user.matchPassword(password);
  if (!isMatch) { res.status(401); throw new Error('Invalid credentials'); }

  if (user.status !== 'active') {
    res.status(403);
    throw new Error('Your account has been deactivated. Please contact administrator.');
  }

  // Extract client IP and device from request headers
  const clientIp = (
    req.headers['x-forwarded-for']?.split(',')[0] ||
    req.socket?.remoteAddress ||
    req.ip ||
    ''
  ).replace('::ffff:', '');
  const userAgent = req.headers['user-agent'] || '';

  const loc = req.body.locationInfo || {};
  const loginEntry = {
    ip: loc.ip || (clientIp === '::1' || clientIp === '127.0.0.1' ? '127.0.0.1 (Local)' : clientIp),
    city: loc.city || '',
    region: loc.region || '',
    country: loc.country || '',
    latitude: loc.latitude || null,
    longitude: loc.longitude || null,
    address: loc.address || (loc.city ? `${loc.city}, ${loc.country || ''}`.trim() : ''),
    device: loc.device || (userAgent.includes('Mobile') ? 'Mobile' : 'Desktop'),
    browser: loc.browser || '',
    os: loc.os || '',
    timestamp: new Date(),
  };

  user.lastLogin = new Date();
  user.lastLoginInfo = loginEntry;
  if (!user.loginHistory) user.loginHistory = [];
  user.loginHistory.unshift(loginEntry);
  if (user.loginHistory.length > 20) user.loginHistory = user.loginHistory.slice(0, 20);

  await user.save();

  res.json({
    success: true,
    message: 'Login successful',
    token: generateToken(user._id, user.role),
    user: user.toSafeObject(),
  });
});

// @desc   Get current logged in user
// @route  GET /api/auth/me
const getMe = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id).populate('department', 'name');
  res.json({ success: true, user });
});

// @desc   Logout
// @route  POST /api/auth/logout
const logout = asyncHandler(async (req, res) => {
  res.json({ success: true, message: 'Logged out successfully' });
});

// @desc   Forgot password
// @route  POST /api/auth/forgot-password
const forgotPassword = asyncHandler(async (req, res) => {
  const { email } = req.body;
  const user = await User.findOne({ email: (email || '').toLowerCase() });
  // Always respond success to avoid leaking which emails exist
  res.json({
    success: true,
    message: 'If an account exists with that email, password reset instructions have been sent.',
  });
});

// @desc   Change password (logged in user - Admin only)
// @route  PUT /api/auth/change-password
const changePassword = asyncHandler(async (req, res) => {
  // Employees cannot change their own password - only Admin can set/reset employee passwords
  if (req.user.role === 'employee') {
    res.status(403);
    throw new Error('Employees are not permitted to change passwords. Please contact your system administrator.');
  }

  const { currentPassword, newPassword } = req.body;
  const user = await User.findById(req.user._id).select('+password');

  const isMatch = await user.matchPassword(currentPassword);
  if (!isMatch) { res.status(400); throw new Error('Current password is incorrect'); }

  if (!newPassword || newPassword.length < 6) {
    res.status(400);
    throw new Error('New password must be at least 6 characters');
  }

  user.password = newPassword;
  user.mustChangePassword = false;
  await user.save();

  res.json({ success: true, message: 'Password changed successfully' });
});

// @desc   Update own profile (name, phone, avatar)
// @route  PUT /api/auth/profile
const updateProfile = asyncHandler(async (req, res) => {
  const { fullName, phone, avatar } = req.body;
  const user = await User.findById(req.user._id).populate('department', 'name');

  if (fullName && fullName.trim()) user.fullName = fullName.trim();
  if (phone !== undefined) user.phone = phone;
  if (avatar !== undefined) user.avatar = avatar; // base64 or URL

  await user.save();

  res.json({ success: true, message: 'Profile updated successfully', user: user.toSafeObject() });
});

// @desc   Check if any admin account exists
// @route  GET /api/auth/admin-status
const getAdminStatus = asyncHandler(async (req, res) => {
  const admin = await User.findOne({ role: 'admin' }).select('fullName email createdAt');
  res.json({
    success: true,
    adminExists: Boolean(admin),
    adminEmail: admin ? admin.email : null,
  });
});

module.exports = {
  signupAdmin,
  login,
  getMe,
  logout,
  forgotPassword,
  changePassword,
  updateProfile,
  getAdminStatus,
};


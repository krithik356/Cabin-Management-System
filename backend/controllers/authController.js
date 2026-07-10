const Admin = require('../models/Admin');
const jwt = require('jsonwebtoken');
const { AppError, catchAsync } = require('../utils/errorHandler');

/**
 * Auth Controller
 * Handles admin authentication
 */

/**
 * Sign JWT token
 */
const signToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'your-secret-key-change-in-production', {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  });
};

/**
 * Create and send token
 */
const createSendToken = (admin, statusCode, res) => {
  const token = signToken(admin._id);

  res.status(statusCode).json({
    status: 'success',
    token,
    data: {
      admin: {
        id: admin._id,
        email: admin.email,
      },
    },
  });
};

/**
 * Admin Signup
 * POST /api/auth/admin/signup
 */
exports.adminSignup = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return next(new AppError('Please provide email and password', 400));
  }

  if (password.length < 6) {
    return next(new AppError('Password must be at least 6 characters', 400));
  }

  // Check if admin already exists
  const existingAdmin = await Admin.findOne({ email });
  if (existingAdmin) {
    return next(new AppError('An admin with this email already exists', 400));
  }

  // Create the admin account
  const admin = await Admin.create({ email, password });

  createSendToken(admin, 201, res);
});

/**
 * Admin Login
 * POST /api/auth/admin/login
 */
exports.adminLogin = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;

  // Validate input
  if (!email || !password) {
    return next(new AppError('Please provide email and password', 400));
  }

  // Find admin and include password
  const admin = await Admin.findOne({ email }).select('+password');

  if (!admin || !(await admin.correctPassword(password, admin.password))) {
    return next(new AppError('Incorrect email or password', 401));
  }

  createSendToken(admin, 200, res);
});

/**
 * Protect admin routes - middleware
 */
exports.protect = catchAsync(async (req, res, next) => {
  // 1) Get token from header
  let token;
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return next(new AppError('You are not logged in! Please log in to get access.', 401));
  }

  // 2) Verify token
  const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key-change-in-production');

  // 3) Check if admin still exists
  const currentAdmin = await Admin.findById(decoded.id);
  if (!currentAdmin) {
    return next(new AppError('The admin belonging to this token no longer exists.', 401));
  }

  // 4) Grant access to protected route
  req.admin = currentAdmin;
  next();
});


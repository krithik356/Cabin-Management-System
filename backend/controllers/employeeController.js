const Employee = require('../models/Employee');
const { AppError, catchAsync } = require('../utils/errorHandler');

/**
 * Employee Controller
 * Handles employee CRUD operations
 */

/**
 * Get all employees
 * GET /api/employees
 */
exports.getAllEmployees = catchAsync(async (req, res, next) => {
  const employees = await Employee.find().populate('booking');
  
  res.status(200).json({
    status: 'success',
    results: employees.length,
    data: {
      employees,
    },
  });
});

/**
 * Create a new employee
 * POST /api/employees
 */
exports.createEmployee = catchAsync(async (req, res, next) => {
  const { name, email, role } = req.body;

  // Validate required fields
  if (!name || !email) {
    return next(new AppError('Name and email are required', 400));
  }

  const employee = await Employee.create({
    name,
    email,
    role: role || 'employee',
  });

  res.status(201).json({
    status: 'success',
    data: {
      employee,
    },
  });
});

/**
 * Get employee by ID
 * GET /api/employees/:id
 */
exports.getEmployee = catchAsync(async (req, res, next) => {
  const { id } = req.params;

  const employee = await Employee.findById(id).populate('booking');
  if (!employee) {
    return next(new AppError('Employee not found', 404));
  }

  res.status(200).json({
    status: 'success',
    data: {
      employee,
    },
  });
});


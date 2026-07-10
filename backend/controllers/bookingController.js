const mongoose = require('mongoose');
const Cabin = require('../models/Cabin');
const Employee = require('../models/Employee');
const { AppError, catchAsync } = require('../utils/errorHandler');

/**
 * Booking Controller
 * Handles all booking operations for employees
 */

/**
 * Get all available cabins
 * GET /api/cabins/available
 */
exports.getAvailableCabins = catchAsync(async (req, res, next) => {
  const cabins = await Cabin.find({
    status: 'available',
    isBooked: false,
  }).select('-bookedBy -isBooked');

  res.status(200).json({
    status: 'success',
    results: cabins.length,
    data: {
      cabins,
    },
  });
});

/**
 * Book a cabin
 * POST /api/cabins/book
 * Body: { cabinId, employeeId }
 */
exports.bookCabin = catchAsync(async (req, res, next) => {
  const { cabinId, employeeId } = req.body;

  // Validate input
  if (!cabinId || !employeeId) {
    return next(new AppError('Cabin ID and Employee ID are required', 400));
  }

  // Validate ObjectId format
  if (!mongoose.Types.ObjectId.isValid(cabinId)) {
    return next(new AppError('Invalid cabin ID format', 400));
  }

  if (!mongoose.Types.ObjectId.isValid(employeeId)) {
    return next(new AppError('Invalid employee ID format. Please use a valid employee ID from the system.', 400));
  }

  // Find cabin and employee
  const cabin = await Cabin.findById(cabinId);
  const employee = await Employee.findById(employeeId);

  if (!cabin) {
    return next(new AppError('Cabin not found', 404));
  }

  if (!employee) {
    return next(new AppError('Employee not found. Please create an employee account first.', 404));
  }

  // Check if cabin is available
  if (cabin.isBooked || cabin.status !== 'available') {
    return next(new AppError('Cabin is not available for booking', 400));
  }

  // Check if employee already has a booking
  if (employee.booking) {
    return next(new AppError('Employee already has an active booking. Please cancel it first.', 400));
  }

  // Book the cabin
  cabin.isBooked = true;
  cabin.status = 'booked';
  cabin.bookedBy = employeeId;
  await cabin.save();

  // Update employee booking
  employee.booking = cabinId;
  await employee.save();

  // Populate references for response
  const bookedCabin = await Cabin.findById(cabinId).populate('bookedBy', 'name email');
  const updatedEmployee = await Employee.findById(employeeId).populate('booking');

  res.status(200).json({
    status: 'success',
    message: 'Cabin booked successfully',
    data: {
      cabin: bookedCabin,
      employee: updatedEmployee,
    },
  });
});

/**
 * Cancel a booking
 * DELETE /api/cabins/cancel/:employeeId
 */
exports.cancelBooking = catchAsync(async (req, res, next) => {
  const { employeeId } = req.params;

  // Find employee
  const employee = await Employee.findById(employeeId);
  if (!employee) {
    return next(new AppError('Employee not found', 404));
  }

  // Check if employee has a booking
  if (!employee.booking) {
    return next(new AppError('Employee has no active booking', 400));
  }

  // Find the booked cabin
  const cabin = await Cabin.findById(employee.booking);
  if (!cabin) {
    // Cabin might have been deleted, just clear employee booking
    employee.booking = null;
    await employee.save();
    return next(new AppError('Cabin associated with booking not found', 404));
  }

  // Reset cabin booking fields
  cabin.isBooked = false;
  cabin.status = 'available';
  cabin.bookedBy = null;
  await cabin.save();

  // Clear employee booking
  employee.booking = null;
  await employee.save();

  res.status(200).json({
    status: 'success',
    message: 'Booking cancelled successfully',
    data: {
      cabin,
      employee,
    },
  });
});

/**
 * Get employee's current booking
 * GET /api/cabins/my-booking/:employeeId
 */
exports.getMyBooking = catchAsync(async (req, res, next) => {
  const { employeeId } = req.params;

  const employee = await Employee.findById(employeeId).populate('booking');
  if (!employee) {
    return next(new AppError('Employee not found', 404));
  }

  if (!employee.booking) {
    return res.status(200).json({
      status: 'success',
      message: 'No active booking',
      data: {
        booking: null,
      },
    });
  }

  res.status(200).json({
    status: 'success',
    data: {
      booking: employee.booking,
    },
  });
});


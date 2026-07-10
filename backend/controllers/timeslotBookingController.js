const mongoose = require('mongoose');
const Booking = require('../models/Booking');
const Cabin = require('../models/Cabin');
const Employee = require('../models/Employee');
const MaintenanceBlock = require('../models/MaintenanceBlock');
const checkConflict = require('../utils/bookingConflict');
const { AppError, catchAsync } = require('../utils/errorHandler');

/**
 * Helper to convert UTC Date to IST (UTC+5:30) date/time details
 */
const getISTDateTime = (date) => {
  const istMs = date.getTime() + (5.5 * 60 * 60 * 1000);
  const istDate = new Date(istMs);
  const hour = istDate.getUTCHours();
  const minute = istDate.getUTCMinutes();
  const year = istDate.getUTCFullYear();
  const month = String(istDate.getUTCMonth() + 1).padStart(2, '0');
  const day = String(istDate.getUTCDate()).padStart(2, '0');
  
  return {
    timeString: `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`,
    dateString: `${year}-${month}-${day}`,
    totalMinutes: hour * 60 + minute
  };
};

/**
 * Helper to parse "HH:MM" into total minutes from midnight
 */
const parseTimeToMinutes = (timeStr) => {
  const [h, m] = timeStr.split(':').map(Number);
  return h * 60 + m;
};

/**
 * Helper to format error details for conflict
 */
const formatConflictError = (conflictResult) => {
  const detail = conflictResult.detail;
  const startIST = getISTDateTime(detail.startTime);
  const endIST = getISTDateTime(detail.endTime);
  
  if (conflictResult.type === 'maintenance') {
    return {
      error: 'TIME_CONFLICT',
      message: `Cabin is blocked for maintenance from ${startIST.timeString} to ${endIST.timeString} on ${startIST.dateString}`,
      conflicting_block_id: detail._id
    };
  }
  
  const employeeName = detail.employeeId?.name || 'Another employee';
  return {
    error: 'TIME_CONFLICT',
    message: `Cabin is already booked by ${employeeName} from ${startIST.timeString} to ${endIST.timeString} on ${startIST.dateString}`,
    conflicting_booking_id: detail._id
  };
};

/**
 * Create a booking
 * POST /api/bookings
 */
exports.createBooking = catchAsync(async (req, res, next) => {
  const { cabinId, employeeId, startTime: startTimeStr, endTime: endTimeStr, purpose, notes, createdByRole } = req.body;

  if (!cabinId || !employeeId || !startTimeStr || !endTimeStr || !createdByRole) {
    return next(new AppError('Cabin ID, Employee ID, Start Time, End Time, and Creator Role are required', 400));
  }

  const startTime = new Date(startTimeStr);
  const endTime = new Date(endTimeStr);

  // 1. Reject if start_time >= end_time (invalid range)
  if (startTime.getTime() >= endTime.getTime()) {
    return next(new AppError('Start time must be before end time', 400));
  }

  // 2. Reject if start_time is in the past
  // Allow a 1-minute grace period to prevent client-server clock drift issues
  if (startTime.getTime() < Date.now() - 60000) {
    return next(new AppError('Cannot book in the past', 400));
  }

  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const cabin = await Cabin.findById(cabinId).session(session);
    const employee = await Employee.findById(employeeId).session(session);

    if (!cabin) {
      throw new AppError('Cabin not found', 404);
    }
    if (!employee) {
      throw new AppError('Employee not found', 404);
    }

    // 5. Reject if cabin status is under_maintenance or inactive
    if (cabin.status === 'maintenance' || cabin.status === 'inactive') {
      throw new AppError('Cabin is under maintenance or inactive', 400);
    }

    // Check IST time alignments
    const startIST = getISTDateTime(startTime);
    const endIST = getISTDateTime(endTime);

    // Reject if booking spans across multiple calendar days in IST
    if (startIST.dateString !== endIST.dateString) {
      throw new AppError('Booking must start and end on the same calendar day', 400);
    }

    // 3. Reject if requested range falls outside the cabin's business hours
    const bookingStartMin = startIST.totalMinutes;
    const bookingEndMin = endIST.totalMinutes;
    const businessStartMin = parseTimeToMinutes(cabin.businessHoursStart || '09:00');
    const businessEndMin = parseTimeToMinutes(cabin.businessHoursEnd || '19:00');

    if (bookingStartMin < businessStartMin || bookingEndMin > businessEndMin) {
      throw new AppError(`Booking must be within business hours (${cabin.businessHoursStart || '09:00'} - ${cabin.businessHoursEnd || '19:00'})`, 400);
    }

    // 4. Reject if duration is below min or above max
    const durationMinutes = (endTime.getTime() - startTime.getTime()) / (60 * 1000);
    if (durationMinutes < (cabin.minBookingMinutes || 30)) {
      throw new AppError(`Booking duration must be at least ${cabin.minBookingMinutes || 30} minutes`, 400);
    }
    if (durationMinutes > (cabin.maxBookingMinutes || 240)) {
      throw new AppError(`Booking duration cannot exceed ${cabin.maxBookingMinutes || 240} minutes (4 hours)`, 400);
    }

    // 11. Reject if employee has already booked a cabin today
    const dailyLimitQuery = {
      employeeId,
      bookingDate: startIST.dateString,
      status: 'confirmed'
    };
    const existingDailyBooking = await Booking.findOne(dailyLimitQuery).session(session);
    if (existingDailyBooking) {
      throw new AppError('Employees are limited to 1 cabin booking per day', 400);
    }

    // 6 & 7. Check conflicts (Bookings & MaintenanceBlocks)
    const conflictResult = await checkConflict(cabinId, startTime, endTime);
    if (conflictResult.conflict) {
      const formatted = formatConflictError(conflictResult);
      return res.status(409).json({
        status: 'fail',
        ...formatted
      });
    }

    // Create booking
    const [newBooking] = await Booking.create([{
      cabinId,
      employeeId,
      createdByRole,
      bookingDate: startIST.dateString,
      startTime,
      endTime,
      purpose,
      notes,
      status: 'confirmed'
    }], { session });

    await session.commitTransaction();

    // Populate response
    const populatedBooking = await Booking.findById(newBooking._id)
      .populate('cabinId')
      .populate('employeeId', 'name email');

    res.status(201).json({
      status: 'success',
      data: {
        booking: populatedBooking
      }
    });

  } catch (error) {
    await session.abortTransaction();
    next(error);
  } finally {
    session.endSession();
  }
});

/**
 * Edit a booking
 * PUT /api/bookings/:id
 */
exports.editBooking = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const { startTime: startTimeStr, endTime: endTimeStr, purpose, notes } = req.body;

  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const booking = await Booking.findById(id).session(session);
    if (!booking) {
      throw new AppError('Booking not found', 404);
    }

    if (booking.status !== 'confirmed') {
      throw new AppError('Can only edit confirmed bookings', 400);
    }

    const newStartTime = startTimeStr ? new Date(startTimeStr) : booking.startTime;
    const newEndTime = endTimeStr ? new Date(endTimeStr) : booking.endTime;

    // Validate times if they changed
    if (startTimeStr || endTimeStr) {
      if (newStartTime.getTime() >= newEndTime.getTime()) {
        throw new AppError('Start time must be before end time', 400);
      }

      if (newStartTime.getTime() < Date.now() - 60000) {
        throw new AppError('Cannot move booking to the past', 400);
      }

      const cabin = await Cabin.findById(booking.cabinId).session(session);
      const startIST = getISTDateTime(newStartTime);
      const endIST = getISTDateTime(newEndTime);

      if (startIST.dateString !== endIST.dateString) {
        throw new AppError('Booking must start and end on the same calendar day', 400);
      }

      const bookingStartMin = startIST.totalMinutes;
      const bookingEndMin = endIST.totalMinutes;
      const businessStartMin = parseTimeToMinutes(cabin.businessHoursStart || '09:00');
      const businessEndMin = parseTimeToMinutes(cabin.businessHoursEnd || '19:00');

      if (bookingStartMin < businessStartMin || bookingEndMin > businessEndMin) {
        throw new AppError(`Booking must be within business hours (${cabin.businessHoursStart || '09:00'} - ${cabin.businessHoursEnd || '19:00'})`, 400);
      }

      const durationMinutes = (newEndTime.getTime() - newStartTime.getTime()) / (60 * 1000);
      if (durationMinutes < (cabin.minBookingMinutes || 30)) {
        throw new AppError(`Booking duration must be at least ${cabin.minBookingMinutes || 30} minutes`, 400);
      }
      if (durationMinutes > (cabin.maxBookingMinutes || 240)) {
        throw new AppError(`Booking duration cannot exceed ${cabin.maxBookingMinutes || 240} minutes (4 hours)`, 400);
      }

      // Check daily limit constraint excluding self
      const dailyLimitQuery = {
        employeeId: booking.employeeId,
        bookingDate: startIST.dateString,
        status: 'confirmed',
        _id: { $ne: booking._id }
      };
      const existingDailyBooking = await Booking.findOne(dailyLimitQuery).session(session);
      if (existingDailyBooking) {
        throw new AppError('Employees are limited to 1 cabin booking per day', 400);
      }

      // Check conflicts excluding self
      const conflictResult = await checkConflict(booking.cabinId, newStartTime, newEndTime, booking._id);
      if (conflictResult.conflict) {
        const formatted = formatConflictError(conflictResult);
        return res.status(409).json({
          status: 'fail',
          ...formatted
        });
      }

      booking.startTime = newStartTime;
      booking.endTime = newEndTime;
      booking.bookingDate = startIST.dateString;
    }

    if (purpose !== undefined) booking.purpose = purpose;
    if (notes !== undefined) booking.notes = notes;

    await booking.save();
    await session.commitTransaction();

    const populated = await Booking.findById(booking._id)
      .populate('cabinId')
      .populate('employeeId', 'name email');

    res.status(200).json({
      status: 'success',
      data: {
        booking: populated
      }
    });

  } catch (error) {
    await session.abortTransaction();
    next(error);
  } finally {
    session.endSession();
  }
});

/**
 * Cancel a booking
 * POST /api/bookings/:id/cancel
 */
exports.cancelBooking = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const { cancelReason, employeeId, cancelledByRole } = req.body;

  if (!cancelledByRole) {
    return next(new AppError('Cancelled By Role is required', 400));
  }

  const booking = await Booking.findById(id);
  if (!booking) {
    return next(new AppError('Booking not found', 404));
  }

  if (booking.status !== 'confirmed') {
    return next(new AppError('Booking is already cancelled or completed', 400));
  }

  // Employee can only cancel their own booking
  if (cancelledByRole === 'employee') {
    if (!employeeId || booking.employeeId.toString() !== employeeId) {
      return next(new AppError('You are not authorized to cancel this booking', 403));
    }
    // Cannot cancel if start time has passed
    if (booking.startTime.getTime() < Date.now()) {
      return next(new AppError('Cannot cancel a booking that has already started or passed', 400));
    }
  }

  booking.status = 'cancelled';
  booking.cancelledAt = new Date();
  booking.cancelledBy = cancelledByRole === 'admin' ? 'admin' : employeeId;
  booking.cancelReason = cancelReason || 'Cancelled by user';

  await booking.save();

  res.status(200).json({
    status: 'success',
    message: 'Booking cancelled successfully',
    data: {
      booking
    }
  });
});

/**
 * Get filtered bookings list
 * GET /api/bookings
 */
exports.getBookings = catchAsync(async (req, res, next) => {
  const { cabinId, dateFrom, dateTo, status, employeeId } = req.query;

  const query = {};

  if (cabinId) query.cabinId = cabinId;
  if (employeeId) query.employeeId = employeeId;
  if (status) query.status = status;

  if (dateFrom || dateTo) {
    query.startTime = {};
    if (dateFrom) query.startTime.$gte = new Date(dateFrom);
    if (dateTo) query.startTime.$lte = new Date(dateTo);
  }

  const bookings = await Booking.find(query)
    .populate('cabinId')
    .populate('employeeId', 'name email')
    .sort({ startTime: 1 });

  res.status(200).json({
    status: 'success',
    results: bookings.length,
    data: {
      bookings
    }
  });
});

/**
 * Get cabin availability for a date
 * GET /api/cabins/:id/availability?date=YYYY-MM-DD
 */
exports.getCabinAvailability = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const { date } = req.query; // YYYY-MM-DD in IST

  if (!date) {
    return next(new AppError('Date query parameter (YYYY-MM-DD) is required', 400));
  }

  const cabin = await Cabin.findById(id);
  if (!cabin) {
    return next(new AppError('Cabin not found', 404));
  }

  // Get all bookings and maintenance blocks for this cabin on this IST date
  const bookings = await Booking.find({
    cabinId: id,
    bookingDate: date,
    status: 'confirmed'
  }).populate('employeeId', 'name email');

  // For maintenance blocks, find any that overlap the day's business hours
  // Day starts at date + businessHoursStart, ends at date + businessHoursEnd
  const businessStart = `${date}T${cabin.businessHoursStart || '09:00'}:00`;
  const businessEnd = `${date}T${cabin.businessHoursEnd || '19:00'}:00`;

  // Convert to UTC dates for querying database
  // We can convert using local offset of +5.5 hours:
  const getUTCDateFromISTString = (istStr) => {
    // istStr format "YYYY-MM-DDTHH:MM:SS"
    const localDate = new Date(istStr);
    // Subtract 5.5 hours to get UTC
    return new Date(localDate.getTime() - (5.5 * 60 * 60 * 1000));
  };

  const dayStartUTC = getUTCDateFromISTString(businessStart);
  const dayEndUTC = getUTCDateFromISTString(businessEnd);

  const maintenanceBlocks = await MaintenanceBlock.find({
    cabinId: id,
    endTime: { $gt: dayStartUTC },
    startTime: { $lt: dayEndUTC }
  });

  res.status(200).json({
    status: 'success',
    data: {
      cabin: {
        id: cabin._id,
        name: cabin.name,
        type: cabin.type,
        status: cabin.status,
        businessHoursStart: cabin.businessHoursStart || '09:00',
        businessHoursEnd: cabin.businessHoursEnd || '19:00',
        bufferMinutes: cabin.bufferMinutes || 0,
        minBookingMinutes: cabin.minBookingMinutes || 30,
        maxBookingMinutes: cabin.maxBookingMinutes || 240
      },
      bookings: bookings.map(b => ({
        id: b._id,
        startTime: b.startTime,
        endTime: b.endTime,
        employeeName: b.employeeId?.name || 'Unknown',
        employeeEmail: b.employeeId?.email || '',
        employeeId: b.employeeId?._id
      })),
      maintenanceBlocks: maintenanceBlocks.map(mb => ({
        id: mb._id,
        startTime: mb.startTime,
        endTime: mb.endTime,
        reason: mb.reason
      }))
    }
  });
});

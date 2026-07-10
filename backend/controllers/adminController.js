const Cabin = require('../models/Cabin');
const Employee = require('../models/Employee');
const Booking = require('../models/Booking');
const MaintenanceBlock = require('../models/MaintenanceBlock');
const checkConflict = require('../utils/bookingConflict');
const { AppError, catchAsync } = require('../utils/errorHandler');

/**
 * Helper to get IST date/time info
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
 * Get all cabins (admin only)
 * GET /api/admin/cabins
 */
exports.getAllCabins = catchAsync(async (req, res, next) => {
  const cabins = await Cabin.find().populate('bookedBy', 'name email');
  
  res.status(200).json({
    status: 'success',
    results: cabins.length,
    data: {
      cabins,
    },
  });
});

/**
 * Create a new cabin
 * POST /api/admin/cabins
 */
exports.createCabin = catchAsync(async (req, res, next) => {
  const { 
    name, type, capacity, status,
    businessHoursStart, businessHoursEnd,
    bufferMinutes, minBookingMinutes, maxBookingMinutes 
  } = req.body;

  // Validate required fields
  if (!name || !type) {
    return next(new AppError('Name and type are required', 400));
  }

  // Validate capacity for work cabins
  if (type === 'work' && !capacity) {
    return next(new AppError('Capacity is required for work cabins', 400));
  }

  // Create cabin data
  const cabinData = {
    name,
    type,
    status: status || 'available',
    businessHoursStart: businessHoursStart || '09:00',
    businessHoursEnd: businessHoursEnd || '19:00',
    bufferMinutes: bufferMinutes !== undefined ? parseInt(bufferMinutes) : 0,
    minBookingMinutes: minBookingMinutes !== undefined ? parseInt(minBookingMinutes) : 30,
    maxBookingMinutes: maxBookingMinutes !== undefined ? parseInt(maxBookingMinutes) : 240, // 4 hours
  };

  if (type === 'work') {
    cabinData.capacity = capacity;
  }

  const cabin = await Cabin.create(cabinData);

  res.status(201).json({
    status: 'success',
    data: {
      cabin,
    },
  });
});

/**
 * Update a cabin
 * PUT /api/admin/cabins/:id
 */
exports.updateCabin = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const { 
    name, type, capacity, status,
    businessHoursStart, businessHoursEnd,
    bufferMinutes, minBookingMinutes, maxBookingMinutes 
  } = req.body;

  // Find cabin
  const cabin = await Cabin.findById(id);
  if (!cabin) {
    return next(new AppError('Cabin not found', 404));
  }

  // Update fields
  if (name) cabin.name = name;
  if (type) {
    cabin.type = type;
    if (type === 'work' && capacity) {
      cabin.capacity = capacity;
    } else if (type === 'conference') {
      cabin.capacity = undefined;
    }
  }
  if (capacity && cabin.type === 'work') cabin.capacity = capacity;
  if (status) cabin.status = status;
  
  if (businessHoursStart) cabin.businessHoursStart = businessHoursStart;
  if (businessHoursEnd) cabin.businessHoursEnd = businessHoursEnd;
  if (bufferMinutes !== undefined) cabin.bufferMinutes = parseInt(bufferMinutes);
  if (minBookingMinutes !== undefined) cabin.minBookingMinutes = parseInt(minBookingMinutes);
  if (maxBookingMinutes !== undefined) cabin.maxBookingMinutes = parseInt(maxBookingMinutes);

  // If status is set to available, ensure old fields are reset (backward compatibility)
  if (status === 'available') {
    if (cabin.bookedBy) {
      await Employee.findByIdAndUpdate(cabin.bookedBy, { booking: null });
    }
    cabin.isBooked = false;
    cabin.bookedBy = null;
  }

  await cabin.save();

  res.status(200).json({
    status: 'success',
    data: {
      cabin,
    },
  });
});

/**
 * Delete a cabin
 * DELETE /api/admin/cabins/:id
 */
exports.deleteCabin = catchAsync(async (req, res, next) => {
  const { id } = req.params;

  const cabin = await Cabin.findById(id);
  if (!cabin) {
    return next(new AppError('Cabin not found', 404));
  }

  // Clean up employee links (backward compatibility)
  if (cabin.isBooked && cabin.bookedBy) {
    await Employee.findByIdAndUpdate(cabin.bookedBy, { booking: null });
  }

  // Cancel any bookings for this cabin from now onwards
  await Booking.updateMany(
    { cabinId: id, startTime: { $gte: new Date() }, status: 'confirmed' },
    { status: 'cancelled', cancelledAt: new Date(), cancelledBy: 'admin', cancelReason: 'Cabin deleted from system' }
  );

  // Delete maintenance blocks too
  await MaintenanceBlock.deleteMany({ cabinId: id });

  await Cabin.findByIdAndDelete(id);

  res.status(200).json({
    status: 'success',
    message: 'Cabin deleted successfully',
  });
});

/**
 * Create a maintenance block
 * POST /api/admin/cabins/:id/maintenance-block
 */
exports.createMaintenanceBlock = catchAsync(async (req, res, next) => {
  const { id: cabinId } = req.params;
  const { startTime: startTimeStr, endTime: endTimeStr, reason } = req.body;

  if (!startTimeStr || !endTimeStr || !reason) {
    return next(new AppError('Start time, end time, and reason are required', 400));
  }

  const startTime = new Date(startTimeStr);
  const endTime = new Date(endTimeStr);

  if (startTime.getTime() >= endTime.getTime()) {
    return next(new AppError('Start time must be before end time', 400));
  }

  // Find overlapping bookings
  const overlappingBookings = await Booking.find({
    cabinId,
    status: 'confirmed',
    endTime: { $gt: startTime },
    startTime: { $lt: endTime }
  }).populate('employeeId', 'name email');

  if (overlappingBookings.length > 0) {
    const bookingDetails = overlappingBookings.map(b => {
      const startIST = getISTDateTime(b.startTime);
      const endIST = getISTDateTime(b.endTime);
      return `${b.employeeId?.name || 'Unknown'} (${startIST.timeString} - ${endIST.timeString} on ${startIST.dateString})`;
    }).join(', ');

    return res.status(409).json({
      status: 'fail',
      error: 'MAINTENANCE_CONFLICT',
      message: `Cabin has existing bookings during this maintenance window: ${bookingDetails}. Please cancel these bookings first.`,
      bookings: overlappingBookings
    });
  }

  // Verify cabin exists
  const cabin = await Cabin.findById(cabinId);
  if (!cabin) {
    return next(new AppError('Cabin not found', 404));
  }

  const block = await MaintenanceBlock.create({
    cabinId,
    startTime,
    endTime,
    reason,
    createdByAdminId: req.admin._id // Set by authentication protect middleware
  });

  res.status(201).json({
    status: 'success',
    message: 'Maintenance block created successfully',
    data: {
      block
    }
  });
});

/**
 * Get Admin dashboard stats & utilization
 * GET /api/admin/dashboard
 */
exports.getDashboard = catchAsync(async (req, res, next) => {
  const todayIST = getISTDateTime(new Date()).dateString;

  const cabins = await Cabin.find();
  const bookingsToday = await Booking.find({
    bookingDate: todayIST,
    status: 'confirmed'
  });

  const now = new Date();
  const oneWeekLater = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
  const upcomingWeekCount = await Booking.countDocuments({
    startTime: { $gte: now, $lte: oneWeekLater },
    status: 'confirmed'
  });

  const maintenanceCount = await Cabin.countDocuments({ status: 'maintenance' });
  const employeeCount = await Employee.countDocuments();

  // Occupancy details per cabin today
  const occupancyMap = [];

  for (const cabin of cabins) {
    const cabinBookings = bookingsToday.filter(b => b.cabinId.toString() === cabin._id.toString());
    
    // Calculate total booked minutes
    let bookedMinutes = 0;
    cabinBookings.forEach(b => {
      bookedMinutes += (b.endTime.getTime() - b.startTime.getTime()) / (60 * 1000);
    });

    const busStartMin = parseTimeToMinutes(cabin.businessHoursStart || '09:00');
    const busEndMin = parseTimeToMinutes(cabin.businessHoursEnd || '19:00');
    const businessHoursMinutes = Math.max(1, busEndMin - busStartMin);

    const utilization = Math.min(100, Math.round((bookedMinutes / businessHoursMinutes) * 100));

    occupancyMap.push({
      cabinId: cabin._id,
      name: cabin.name,
      type: cabin.type,
      status: cabin.status,
      bookingsCount: cabinBookings.length,
      bookedMinutes,
      utilization
    });
  }

  // Recent activity logs (last 8 edits/creations/cancellations)
  const recentBookings = await Booking.find()
    .populate('cabinId', 'name type')
    .populate('employeeId', 'name email')
    .sort({ updatedAt: -1 })
    .limit(8);

  res.status(200).json({
    status: 'success',
    data: {
      stats: {
        totalBookingsToday: bookingsToday.length,
        upcomingWeekBookings: upcomingWeekCount,
        cabinsUnderMaintenance: maintenanceCount,
        totalEmployees: employeeCount
      },
      occupancy: occupancyMap,
      recentActivity: recentBookings
    }
  });
});

/**
 * Get detailed booking audit log
 * GET /api/admin/bookings/audit
 */
exports.getAuditLog = catchAsync(async (req, res, next) => {
  const auditLogs = await Booking.find()
    .populate('cabinId', 'name type')
    .populate('employeeId', 'name email')
    .sort({ updatedAt: -1 })
    .limit(100);

  res.status(200).json({
    status: 'success',
    data: {
      logs: auditLogs
    }
  });
});

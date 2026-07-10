const Booking = require('../models/Booking');
const MaintenanceBlock = require('../models/MaintenanceBlock');
const Cabin = require('../models/Cabin');

/**
 * Checks if a given time slot for a cabin has any overlapping bookings or maintenance blocks.
 * Uses the formula: A_start < B_end AND B_start < A_end (expanded by buffer time)
 * 
 * @param {string} cabinId - ID of the cabin
 * @param {Date} startTime - Requested start time (Date object)
 * @param {Date} endTime - Requested end time (Date object)
 * @param {string} [excludeBookingId] - ID of booking to exclude (for editing)
 * @returns {Promise<{conflict: boolean, type: 'booking'|'maintenance'|null, detail: any}>}
 */
const checkConflict = async (cabinId, startTime, endTime, excludeBookingId = null) => {
  const cabin = await Cabin.findById(cabinId);
  if (!cabin) {
    throw new Error('Cabin not found');
  }

  const bufferMinutes = cabin.bufferMinutes || 0;
  const bufferMs = bufferMinutes * 60 * 1000;

  // Find overlapping confirmed bookings
  // B.endTime > newStart - buffer AND B.startTime < newEnd + buffer
  const query = {
    cabinId,
    status: 'confirmed',
    endTime: { $gt: new Date(startTime.getTime() - bufferMs) },
    startTime: { $lt: new Date(endTime.getTime() + bufferMs) }
  };

  if (excludeBookingId) {
    query._id = { $ne: excludeBookingId };
  }

  const conflictingBooking = await Booking.findOne(query).populate('employeeId', 'name email');

  if (conflictingBooking) {
    return {
      conflict: true,
      type: 'booking',
      detail: conflictingBooking
    };
  }

  // Find overlapping maintenance blocks (no buffer required for maintenance blocks)
  const conflictingMaintenance = await MaintenanceBlock.findOne({
    cabinId,
    endTime: { $gt: startTime },
    startTime: { $lt: endTime }
  });

  if (conflictingMaintenance) {
    return {
      conflict: true,
      type: 'maintenance',
      detail: conflictingMaintenance
    };
  }

  return {
    conflict: false,
    type: null,
    detail: null
  };
};

module.exports = checkConflict;

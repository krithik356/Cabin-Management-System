const mongoose = require('mongoose');

/**
 * Booking Schema
 * Represents a specific time slot booking of a cabin by an employee
 */
const bookingSchema = new mongoose.Schema({
  cabinId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Cabin',
    required: [true, 'Cabin ID is required'],
  },
  employeeId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Employee',
    required: [true, 'Employee ID is required'],
  },
  createdByRole: {
    type: String,
    enum: ['admin', 'employee'],
    required: [true, 'Creator role is required'],
  },
  bookingDate: {
    type: String, // Format: YYYY-MM-DD
    required: [true, 'Booking date is required'],
  },
  startTime: {
    type: Date, // Full UTC date-time
    required: [true, 'Start time is required'],
  },
  endTime: {
    type: Date, // Full UTC date-time
    required: [true, 'End time is required'],
  },
  status: {
    type: String,
    enum: ['confirmed', 'cancelled', 'completed', 'no_show'],
    default: 'confirmed',
  },
  purpose: {
    type: String,
    trim: true,
  },
  notes: {
    type: String,
    trim: true,
  },
  cancelledAt: {
    type: Date,
  },
  cancelledBy: {
    type: String, // ID or Role
  },
  cancelReason: {
    type: String,
    trim: true,
  }
}, {
  timestamps: true,
});

// Indexes for conflict checks and status/date queries
bookingSchema.index({ cabinId: 1, startTime: 1, endTime: 1 });
bookingSchema.index({ employeeId: 1, bookingDate: 1 });
bookingSchema.index({ status: 1 });

module.exports = mongoose.model('Booking', bookingSchema);

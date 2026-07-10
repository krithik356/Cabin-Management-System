const mongoose = require('mongoose');

/**
 * Cabin Schema
 * Represents a cabin that can be booked by employees
 */
const cabinSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Cabin name is required'],
    trim: true,
    unique: true,
  },
  type: {
    type: String,
    enum: ['work', 'conference'],
    required: [true, 'Cabin type is required'],
  },
  // Capacity is only for work cabins
  capacity: {
    type: Number,
    required: function() {
      return this.type === 'work';
    },
    min: [1, 'Capacity must be at least 1'],
    validate: {
      validator: function(value) {
        // Capacity is only required for work cabins
        if (this.type === 'work') {
          return value != null && value > 0;
        }
        return true; // Conference cabins don't need capacity
      },
      message: 'Capacity is required for work cabins',
    },
  },
  status: {
    type: String,
    enum: ['available', 'booked', 'maintenance'],
    default: 'available',
  },
  isBooked: {
    type: Boolean,
    default: false,
  },
  // Reference to the employee who booked this cabin
  bookedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Employee',
    default: null,
  },
  businessHoursStart: {
    type: String,
    default: '09:00', // Format: HH:MM
  },
  businessHoursEnd: {
    type: String,
    default: '19:00', // Format: HH:MM
  },
  bufferMinutes: {
    type: Number,
    default: 0,
  },
  minBookingMinutes: {
    type: Number,
    default: 30,
  },
  maxBookingMinutes: {
    type: Number,
    default: 240, // 4 hours
  },
}, {
  timestamps: true, // Adds createdAt and updatedAt fields
});

// Index for faster queries
cabinSchema.index({ status: 1 });
cabinSchema.index({ isBooked: 1 });
cabinSchema.index({ bookedBy: 1 });

module.exports = mongoose.model('Cabin', cabinSchema);


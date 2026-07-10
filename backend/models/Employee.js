const mongoose = require('mongoose');

/**
 * Employee Schema
 * Represents an employee who can book cabins
 */
const employeeSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Employee name is required'],
    trim: true,
  },
  email: {
    type: String,
    required: [true, 'Employee email is required'],
    unique: true,
    lowercase: true,
    trim: true,
  },
  role: {
    type: String,
    enum: ['admin', 'employee'],
    default: 'employee',
  },
  // Reference to the cabin currently booked by this employee
  booking: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Cabin',
    default: null,
  },
}, {
  timestamps: true, // Adds createdAt and updatedAt fields
});

// Index for faster queries
employeeSchema.index({ email: 1 });
employeeSchema.index({ booking: 1 });

module.exports = mongoose.model('Employee', employeeSchema);


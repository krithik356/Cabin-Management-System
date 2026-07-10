const mongoose = require('mongoose');

/**
 * MaintenanceBlock Schema
 * Blocks a cabin's availability during a date/time range for maintenance
 */
const maintenanceBlockSchema = new mongoose.Schema({
  cabinId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Cabin',
    required: [true, 'Cabin ID is required'],
  },
  startTime: {
    type: Date,
    required: [true, 'Start time is required'],
  },
  endTime: {
    type: Date,
    required: [true, 'End time is required'],
  },
  reason: {
    type: String,
    required: [true, 'Reason is required'],
    trim: true,
  },
  createdByAdminId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Admin',
    required: [true, 'Admin ID is required'],
  }
}, {
  timestamps: true,
});

maintenanceBlockSchema.index({ cabinId: 1, startTime: 1, endTime: 1 });

module.exports = mongoose.model('MaintenanceBlock', maintenanceBlockSchema);

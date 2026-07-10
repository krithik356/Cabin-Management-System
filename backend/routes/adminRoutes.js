const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const authController = require('../controllers/authController');

// Protect all admin routes
router.use(authController.protect);

/**
 * Admin Routes
 * All routes for admin cabin management
 */

// Get all cabins
router.get('/cabins', adminController.getAllCabins);

// Create a new cabin
router.post('/cabins', adminController.createCabin);

// Update a cabin
router.put('/cabins/:id', adminController.updateCabin);

// Delete a cabin
router.delete('/cabins/:id', adminController.deleteCabin);

// Create maintenance block for a cabin
router.post('/cabins/:id/maintenance-block', adminController.createMaintenanceBlock);

// Get dashboard stats
router.get('/dashboard', adminController.getDashboard);

// Get audit log
router.get('/audit-log', adminController.getAuditLog);

module.exports = router;


const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

/**
 * Auth Routes
 * Handles authentication endpoints
 */

// Admin signup (first time setup)
router.post('/admin/signup', authController.adminSignup);

// Admin login
router.post('/admin/login', authController.adminLogin);

module.exports = router;


const express = require('express');
const router = express.Router();
const employeeController = require('../controllers/employeeController');

/**
 * Employee Routes
 * Routes for employee management
 */

// Get all employees
router.get('/', employeeController.getAllEmployees);

// Create a new employee
router.post('/', employeeController.createEmployee);

// Get employee by ID
router.get('/:id', employeeController.getEmployee);

module.exports = router;


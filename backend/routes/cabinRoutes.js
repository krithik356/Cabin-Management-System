const express = require('express');
const router = express.Router();
const bookingController = require('../controllers/bookingController');

/**
 * Cabin Routes
 * Routes for employees to view and book cabins
 */

// Get all available cabins
router.get('/available', bookingController.getAvailableCabins);

// Book a cabin
router.post('/book', bookingController.bookCabin);

// Cancel a booking
router.delete('/cancel/:employeeId', bookingController.cancelBooking);

// Get employee's current booking
router.get('/my-booking/:employeeId', bookingController.getMyBooking);

// Get cabin availability for a given date YYYY-MM-DD
const timeslotBookingController = require('../controllers/timeslotBookingController');
router.get('/:id/availability', timeslotBookingController.getCabinAvailability);

module.exports = router;


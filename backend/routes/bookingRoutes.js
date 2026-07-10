const express = require('express');
const router = express.Router();
const timeslotBookingController = require('../controllers/timeslotBookingController');

/**
 * Booking Routes
 * Handles all date/time slot bookings
 */

router.post('/', timeslotBookingController.createBooking);
router.get('/', timeslotBookingController.getBookings);
router.put('/:id', timeslotBookingController.editBooking);
router.post('/:id/cancel', timeslotBookingController.cancelBooking);

module.exports = router;

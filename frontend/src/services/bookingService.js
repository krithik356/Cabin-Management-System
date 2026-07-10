import api from './api';

/**
 * Booking Service
 * Handles all date/time timeslot booking API calls
 */

/**
 * Create a new booking
 */
export const createBooking = async (bookingData) => {
  const response = await api.post('/bookings', bookingData);
  return response.data;
};

/**
 * Get all bookings based on filters
 */
export const getBookings = async (filters = {}) => {
  const response = await api.get('/bookings', { params: filters });
  return response.data;
};

/**
 * Edit an existing booking
 */
export const editBooking = async (bookingId, bookingData) => {
  const response = await api.put(`/bookings/${bookingId}`, bookingData);
  return response.data;
};

/**
 * Cancel a booking
 */
export const cancelBooking = async (bookingId, employeeId, cancelledByRole, cancelReason = '') => {
  const response = await api.post(`/bookings/${bookingId}/cancel`, {
    employeeId,
    cancelledByRole,
    cancelReason
  });
  return response.data;
};

/**
 * Get cabin availability for a date (YYYY-MM-DD)
 */
export const getCabinAvailability = async (cabinId, date) => {
  const response = await api.get(`/cabins/${cabinId}/availability`, { params: { date } });
  return response.data;
};

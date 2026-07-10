import api from './api';

/**
 * Cabin Service
 * Handles all cabin-related API calls
 */

/**
 * Get all available cabins
 */
export const getAvailableCabins = async () => {
  const response = await api.get('/cabins/available');
  return response.data;
};

/**
 * Book a cabin
 * @param {string} cabinId - ID of the cabin to book
 * @param {string} employeeId - ID of the employee booking
 */
export const bookCabin = async (cabinId, employeeId) => {
  const response = await api.post('/cabins/book', { cabinId, employeeId });
  return response.data;
};

/**
 * Cancel a booking
 * @param {string} employeeId - ID of the employee
 */
export const cancelBooking = async (employeeId) => {
  const response = await api.delete(`/cabins/cancel/${employeeId}`);
  return response.data;
};

/**
 * Get employee's current booking
 * @param {string} employeeId - ID of the employee
 */
export const getMyBooking = async (employeeId) => {
  const response = await api.get(`/cabins/my-booking/${employeeId}`);
  return response.data;
};


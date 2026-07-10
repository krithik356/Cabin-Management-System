import api from './api';

/**
 * Admin Service
 * Handles all admin-related API calls for cabin management
 */

/**
 * Get all cabins (admin only)
 */
export const getAllCabins = async () => {
  const response = await api.get('/admin/cabins');
  return response.data;
};

/**
 * Create a new cabin
 * @param {Object} cabinData - Cabin data (name, type, capacity, status)
 */
export const createCabin = async (cabinData) => {
  const response = await api.post('/admin/cabins', cabinData);
  return response.data;
};

/**
 * Update a cabin
 * @param {string} cabinId - ID of the cabin to update
 * @param {Object} cabinData - Updated cabin data
 */
export const updateCabin = async (cabinId, cabinData) => {
  const response = await api.put(`/admin/cabins/${cabinId}`, cabinData);
  return response.data;
};

/**
 * Delete a cabin
 * @param {string} cabinId - ID of the cabin to delete
 */
export const deleteCabin = async (cabinId) => {
  const response = await api.delete(`/admin/cabins/${cabinId}`);
  return response.data;
};

/**
 * Create a maintenance block for a cabin
 */
export const createMaintenanceBlock = async (cabinId, blockData) => {
  const response = await api.post(`/admin/cabins/${cabinId}/maintenance-block`, blockData);
  return response.data;
};

/**
 * Get dashboard stats and utilization map
 */
export const getDashboard = async () => {
  const response = await api.get('/admin/dashboard');
  return response.data;
};

/**
 * Get audit logs for bookings
 */
export const getAuditLog = async () => {
  const response = await api.get('/admin/audit-log');
  return response.data;
};



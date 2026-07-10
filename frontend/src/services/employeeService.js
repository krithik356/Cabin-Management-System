import api from './api';

/**
 * Employee Service
 * Handles all employee-related API calls
 */

/**
 * Get all employees
 */
export const getAllEmployees = async () => {
  const response = await api.get('/employees');
  return response.data;
};

/**
 * Create a new employee
 * @param {Object} employeeData - Employee data (name, email, role)
 */
export const createEmployee = async (employeeData) => {
  const response = await api.post('/employees', employeeData);
  return response.data;
};

/**
 * Get employee by ID
 * @param {string} employeeId - ID of the employee
 */
export const getEmployee = async (employeeId) => {
  const response = await api.get(`/employees/${employeeId}`);
  return response.data;
};


import api from './api';

/**
 * Auth Service
 * Handles authentication API calls
 */

/**
 * Admin login
 * @param {Object} credentials - { email, password }
 */
export const adminLogin = async (credentials) => {
  const response = await api.post('/auth/admin/login', credentials);
  return response.data;
};

/**
 * Admin signup
 * @param {Object} credentials - { email, password }
 */
export const adminSignup = async (credentials) => {
  const response = await api.post('/auth/admin/signup', credentials);
  return response.data;
};


// api.js
import axios from 'axios';

const api = axios.create({
  baseURL: 'https://excel-analytics-platform-backend.onrender.com'
});

// Add a request interceptor to attach token automatically
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken'); // <-- Use the correct key 'authToken'
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    // Handle request errors (less common)
    return Promise.reject(error);
  }
);

// Add a response interceptor to handle expired tokens
api.interceptors.response.use(
  (response) => response, // Pass through successful responses
  (error) => {
    // Check if the error is due to an expired/invalid token (401 or 403)
    if (error.response && (error.response.status === 401 || error.response.status === 403)) {
      localStorage.removeItem('authToken'); // Clear the expired token
      window.location.href = '/login'; // Redirect to login page
    }
    return Promise.reject(error); // Pass the error along
  }
);

export default api;
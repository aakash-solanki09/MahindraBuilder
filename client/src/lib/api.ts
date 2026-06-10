import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5011/api';

const api = axios.create({
  baseURL: API_URL,
});

// Add token to requests if exists
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
export { API_URL };

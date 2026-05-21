import axios from 'axios';

// Use relative URL so Vite proxy handles routing in dev; in production, set VITE_API_BASE_URL
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 15000,
});

// Add request interceptor for JWT
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Add response interceptor for auth errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // If 401, clear token and redirect to login (unless already on auth pages)
    if (error.response?.status === 401) {
      const isAuthRoute = window.location.pathname.startsWith('/login') ||
                          window.location.pathname.startsWith('/register');
      if (!isAuthRoute) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default api;

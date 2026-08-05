import axios from 'axios';

const API = axios.create({
  baseURL: '/api',
  headers: { 'Content-Type': 'application/json' },
  timeout: 10000,
});

API.interceptors.request.use((config) => {
  const token = localStorage.getItem('jwt_token');
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

API.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      if (error.response.status === 401) {
        localStorage.removeItem('jwt_token');
      } else if (error.response.status === 429) {
        alert('Batas laju terlampaui. Silakan coba lagi beberapa detik.');
      }
    }
    return Promise.reject(error);
  }
);

export default API;

// ============= ============= ============= ============= =============


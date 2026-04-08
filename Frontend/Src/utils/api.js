import axios from 'axios';

const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const api = axios.create({ baseURL: API_BASE });

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('cc_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('cc_token');
      localStorage.removeItem('cc_user');
      window.location.href = '/login';
    }
    return Promise.reject(err);
  }
);

export const authApi = {
  register: (data) => api.post('/register', data),
  login: (data) => api.post('/login', data),
  getMe: () => api.get('/me'),
  updateProfile: (data) => api.put('/me', data),
};

export const taskApi = {
  getAll: (params) => api.get('/tasks', { params }),
  getOne: (id) => api.get(`/tasks/${id}`),
  create: (data) => api.post('/tasks', data),
  accept: (id) => api.post(`/tasks/${id}/accept`),
  complete: (id) => api.post(`/tasks/${id}/complete`),
  cancel: (id) => api.post(`/tasks/${id}/cancel`),
};

export const statsApi = {
  get: () => api.get('/stats'),
  transactions: () => api.get('/transactions'),
  leaderboard: () => api.get('/leaderboard'),
};

export default api;
import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  timeout: 30000,
  headers: { 'Content-Type': 'application/json' },
});

// Request interceptor: attach token
api.interceptors.request.use(config => {
  const token = localStorage.getItem('agridiag_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Response interceptor: handle 401
api.interceptors.response.use(
  res => res,
  err => {
    if (err.response?.status === 401) {
      localStorage.removeItem('agridiag_token');
      window.location.href = '/login';
    }
    return Promise.reject(err);
  }
);

export default api;

// ── Convenience helpers ────────────────────────────────────────────────────

export const diagnosisApi = {
  predict: (formData) => api.post('/diagnosis/predict', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
    timeout: 60000, // 60s for ML inference
  }),
  getById: (id) => api.get(`/diagnosis/${id}`),
  delete: (id) => api.delete(`/diagnosis/${id}`),
};

export const historyApi = {
  list: (skip = 0, limit = 20) => api.get(`/history?skip=${skip}&limit=${limit}`),
  search: (q) => api.get(`/history/search?q=${encodeURIComponent(q)}`),
  filter: (params) => api.get('/history/filter', { params }),
  delete: (id) => api.delete(`/history/${id}`),
};

export const plantsApi = {
  list: (search = '', skip = 0, limit = 20) =>
    api.get('/plants', { params: { search, skip, limit } }),
  search: (q) => api.get(`/plants/search?q=${encodeURIComponent(q)}`),
  getById: (id) => api.get(`/plants/${id}`),
  listDiseases: (search = '') => api.get('/plants/diseases/all', { params: { search } }),
  getDiseaseById: (id) => api.get(`/plants/diseases/${id}`),
};

export const feedbackApi = {
  submit: (data) => api.post('/feedback', data),
  myFeedback: () => api.get('/feedback/my'),
};

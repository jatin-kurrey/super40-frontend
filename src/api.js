import axios from 'axios';

let API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8081/api/v1/';

// Normalize API_URL to have exactly one trailing slash and prevent double slashes (including trimming newlines/whitespace)
API_URL = API_URL.trim().replace(/\/+$/, '') + '/';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor for adding JWT
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('super40_admin_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor for handling 401
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('super40_admin_token');
      if (!window.location.pathname.includes('/admin/login')) {
        window.location.href = '/admin/login';
      }
    }
    return Promise.reject(error);
  }
);

export const applicationService = {
  submit: (data) => api.post('applications', data),
  getAll: (params) => api.get('admin/applications', { params }),
  updateStatus: (id, status) => api.put(`admin/applications/${id}/status`, { status }),
};

export const uploadService = {
  upload: (file) => {
    const formData = new FormData();
    formData.append('file', file);
    return api.post('admin/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },
};

export const authService = {
  login: (credentials) => api.post('auth/login', credentials),
  logout: () => localStorage.removeItem('super40_admin_token'),
};

export const examService = {
  // Public
  getActive: () => api.get('exams/active'),
  getDetails: (id) => api.get(`exams/${id}`),
  submitResponse: (data) => api.post('exams/submit', data),
  getResults: (email, phone) => api.get(`exams/results?email=${email}&phone=${phone}`),
  
  // Admin
  create: (data) => api.post('admin/exams', data),
  getAllAdmin: () => api.get('admin/exams'),
  update: (id, data) => api.put(`admin/exams/${id}`, data),
  delete: (id) => api.delete(`admin/exams/${id}`),
  getResponses: (id) => api.get(`admin/exams/${id}/responses`),
  getDetailedResponse: (id) => api.get(`admin/responses/${id}`),
  activate: (id) => api.post(`admin/exams/${id}/activate`),
};

export const settingsService = {
  get: () => api.get('settings'),
  update: (key, value) => api.put('admin/settings', { key, value }),
};

export default api;

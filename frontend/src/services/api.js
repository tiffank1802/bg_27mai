import axios from 'axios';

const API_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8001';

// Create axios instance
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests if available
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle response errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Books API
export const booksApi = {
  getAll: () => api.get('/api/books'),
  getById: (id) => api.get(`/api/books/${id}`),
  create: (bookData) => api.post('/api/books', bookData),
  update: (id, bookData) => api.put(`/api/books/${id}`, bookData),
  delete: (id) => api.delete(`/api/books/${id}`),
};

// Authors API
export const authorsApi = {
  getAll: () => api.get('/api/authors'),
  getById: (id) => api.get(`/api/authors/${id}`),
  create: (authorData) => api.post('/api/authors', authorData),
  update: (id, authorData) => api.put(`/api/authors/${id}`, authorData),
  delete: (id) => api.delete(`/api/authors/${id}`),
};

// Editors API
export const editorsApi = {
  getAll: () => api.get('/api/editors'),
  getById: (id) => api.get(`/api/editors/${id}`),
  create: (editorData) => api.post('/api/editors', editorData),
  update: (id, editorData) => api.put(`/api/editors/${id}`, editorData),
  delete: (id) => api.delete(`/api/editors/${id}`),
};

// Comments API
export const commentsApi = {
  getByBookId: (bookId) => api.get(`/api/books/${bookId}/comments`),
  create: (bookId, commentData) => api.post(`/api/books/${bookId}/comments`, commentData),
  update: (id, commentData) => api.put(`/api/comments/${id}`, commentData),
  delete: (id) => api.delete(`/api/comments/${id}`),
};

export default api;
import api from './api';

export const feedbackService = {
  create: (formData) =>
    api.post('/feedback', formData, { headers: { 'Content-Type': 'multipart/form-data' } }).then((r) => r.data),
  getAll: (params) => api.get('/feedback', { params }).then((r) => r.data),
  getMine: (params) => api.get('/feedback/my', { params }).then((r) => r.data),
  getById: (id) => api.get(`/feedback/${id}`).then((r) => r.data),
  update: (id, data) => api.put(`/feedback/${id}`, data).then((r) => r.data),
  remove: (id) => api.delete(`/feedback/${id}`).then((r) => r.data),
  approve: (id, decision) => api.put(`/feedback/${id}/approve`, { decision }).then((r) => r.data),
};

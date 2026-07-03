import api from './api';

export const lookupService = {
  getDepartments: (params) => api.get('/departments', { params }).then((r) => r.data),
  getCategories: (params) => api.get('/categories', { params }).then((r) => r.data),
  getPolicies: (params) => api.get('/policies', { params }).then((r) => r.data),
  getPolicyById: (id) => api.get(`/policies/${id}`).then((r) => r.data),
};

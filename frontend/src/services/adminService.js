import api from './api';

export const adminService = {
  // Citizens
  getUsers: (params) => api.get('/admin/users', { params }).then((r) => r.data),
  updateUserStatus: (id, isActive) => api.put(`/admin/users/${id}/status`, { isActive }).then((r) => r.data),
  deleteUser: (id) => api.delete(`/admin/users/${id}`).then((r) => r.data),

  // Officers
  getOfficers: (params) => api.get('/admin/officers', { params }).then((r) => r.data),
  createOfficer: (data) => api.post('/admin/officers', data).then((r) => r.data),
  approveOfficer: (id, approve) => api.put(`/admin/officers/${id}/approve`, { approve }).then((r) => r.data),
  updateOfficer: (id, data) => api.put(`/admin/officers/${id}`, data).then((r) => r.data),
  deleteOfficer: (id) => api.delete(`/admin/officers/${id}`).then((r) => r.data),

  // Analytics & Logs
  getAnalytics: () => api.get('/admin/analytics').then((r) => r.data),
  getLogs: (params) => api.get('/admin/logs', { params }).then((r) => r.data),

  // Settings
  getSettings: () => api.get('/admin/settings').then((r) => r.data),
  updateSettings: (data) => api.put('/admin/settings', data).then((r) => r.data),

  // Departments
  createDepartment: (data) => api.post('/departments', data).then((r) => r.data),
  updateDepartment: (id, data) => api.put(`/departments/${id}`, data).then((r) => r.data),
  deleteDepartment: (id) => api.delete(`/departments/${id}`).then((r) => r.data),

  // Categories
  createCategory: (data) => api.post('/categories', data).then((r) => r.data),
  updateCategory: (id, data) => api.put(`/categories/${id}`, data).then((r) => r.data),
  deleteCategory: (id) => api.delete(`/categories/${id}`).then((r) => r.data),

  // Policies
  createPolicy: (data) => api.post('/policies', data).then((r) => r.data),
  updatePolicy: (id, data) => api.put(`/policies/${id}`, data).then((r) => r.data),
  deletePolicy: (id) => api.delete(`/policies/${id}`).then((r) => r.data),
};

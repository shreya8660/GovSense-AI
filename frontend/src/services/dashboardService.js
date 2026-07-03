import api from './api';

export const dashboardService = {
  getStats: (params) => api.get('/dashboard/stats', { params }).then((r) => r.data),
  getCharts: (params) => api.get('/dashboard/charts', { params }).then((r) => r.data),
};

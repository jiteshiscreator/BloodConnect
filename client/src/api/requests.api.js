import api from './axios';

export const requestsApi = {
  create: (data) => api.post('/requests', data),
  getAll: (params) => api.get('/requests', { params }),
  getNearby: (params) => api.get('/requests/nearby', { params }),
  getById: (id) => api.get(`/requests/${id}`),
  updateStatus: (id, data) => api.put(`/requests/${id}/status`, data),
  cancel: (id) => api.delete(`/requests/${id}`),
  getStats: () => api.get('/requests/stats'),
};

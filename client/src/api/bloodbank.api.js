import api from './axios';

export const bloodbankApi = {
  create: (data) => api.post('/bloodbanks', data),
  getAll: (params) => api.get('/bloodbanks', { params }),
  getNearby: (params) => api.get('/bloodbanks/nearby', { params }),
  getById: (id) => api.get(`/bloodbanks/${id}`),
  getMyBank: () => api.get('/bloodbanks/admin/my'),
  update: (id, data) => api.put(`/bloodbanks/${id}`, data),
  updateInventory: (id, updates) => api.put(`/bloodbanks/${id}/inventory`, { updates }),
};

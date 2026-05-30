import api from './axios';

export const donationsApi = {
  log: (data) => api.post('/donations', data),
  getMy: (params) => api.get('/donations/my', { params }),
  getAll: (params) => api.get('/donations', { params }),
};

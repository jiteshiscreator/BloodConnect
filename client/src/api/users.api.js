import api from './axios';

export const usersApi = {
  getProfile: () => api.get('/users/profile'),
  updateProfile: (data) => api.put('/users/profile', data),
  searchDonors: (params) => api.get('/users/donors/search', { params }),
  getEligibility: () => api.get('/users/eligibility'),
  getAll: (params) => api.get('/users', { params }),
  updateStatus: (id, isActive) => api.put(`/users/${id}/status`, { isActive }),
  getStats: () => api.get('/users/stats'),
};

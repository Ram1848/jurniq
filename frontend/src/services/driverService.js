import api from './api';

export const getRideRequests = async () => {
  const response = await api.get('/driver/ride-requests');
  return response.data;
};

export const acceptRide = async (id) => {
  const response = await api.put(`/driver/accept/${id}`);
  return response.data;
};

export const startRide = async (id) => {
  const response = await api.put(`/driver/start/${id}`);
  return response.data;
};

export const completeRide = async (id) => {
  const response = await api.put(`/driver/complete/${id}`);
  return response.data;
};

export const getActiveRide = async () => {
  const response = await api.get('/driver/active-ride');
  return response.data;
};

export const getRideHistory = async (page = 1, limit = 10) => {
  const response = await api.get(`/driver/history?page=${page}&limit=${limit}`);
  return response.data;
};

export const getEarnings = async () => {
  const response = await api.get('/driver/earnings');
  return response.data;
};

export const getDriverDashboardStats = async () => {
  const response = await api.get('/driver/dashboard/stats');
  return response.data;
};

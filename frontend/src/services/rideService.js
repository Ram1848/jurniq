import api from './api';

export const bookRide = async (rideData) => {
  const response = await api.post('/rides/book', rideData);
  return response.data;
};

export const getHistory = async (page = 1, limit = 10) => {
  const response = await api.get(`/rides/history?page=${page}&limit=${limit}`);
  return response.data;
};

export const getRideById = async (id) => {
  const response = await api.get(`/rides/${id}`);
  return response.data;
};

export const cancelRide = async (id) => {
  const response = await api.delete(`/rides/cancel/${id}`);
  return response.data;
};

export const getDashboardStats = async () => {
  const response = await api.get('/rides/dashboard/stats');
  return response.data;
};

export const getActiveRide = async () => {
  const response = await api.get('/rides/active-ride');
  return response.data;
};

export const calculateFare = async (data) => {
  const response = await api.post('/maps/calculate-fare', data);
  return response.data;
};

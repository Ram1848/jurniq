import api from './api';

export const getDashboardStats = async () => {
  const response = await api.get('/admin/dashboard');
  return response.data;
};

export const getAllUsers = async (page = 1, limit = 10, search = '') => {
  const response = await api.get(`/admin/users?page=${page}&limit=${limit}&search=${encodeURIComponent(search)}`);
  return response.data;
};

export const getAllDrivers = async (page = 1, limit = 10, search = '') => {
  const response = await api.get(`/admin/drivers?page=${page}&limit=${limit}&search=${encodeURIComponent(search)}`);
  return response.data;
};

export const getAllRides = async (page = 1, limit = 10, search = '') => {
  const response = await api.get(`/admin/rides?page=${page}&limit=${limit}&search=${encodeURIComponent(search)}`);
  return response.data;
};

export const blockUser = async (id) => {
  const response = await api.put(`/admin/block-user/${id}`);
  return response.data;
};

export const activateUser = async (id) => {
  const response = await api.put(`/admin/activate-user/${id}`);
  return response.data;
};

export const deleteUser = async (id) => {
  const response = await api.delete(`/admin/delete-user/${id}`);
  return response.data;
};

export const getAnalytics = async () => {
  const response = await api.get('/admin/analytics');
  return response.data;
};

export const getReports = async (type = 'daily') => {
  const response = await api.get(`/admin/reports?type=${type}`);
  return response.data;
};

export const changePassword = async (data) => {
  const response = await api.put('/admin/change-password', data);
  return response.data;
};

export const updateProfile = async (data) => {
  const response = await api.put('/admin/update-profile', data);
  return response.data;
};

export const cancelRide = async (id) => {
  const response = await api.put(`/admin/cancel-ride/${id}`);
  return response.data;
};

const adminService = require('../services/adminService');

const getDashboardStats = async (req, res) => {
  const stats = await adminService.getDashboardStats();
  res.status(200).json({ success: true, stats });
};

const getAllUsers = async (req, res) => {
  try {
    const { page, limit, search } = req.query;
    const users = await adminService.getAllUsers(page, limit, search);
    res.status(200).json({ success: true, users });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const getAllDrivers = async (req, res) => {
  try {
    const { page, limit, search } = req.query;
    const drivers = await adminService.getAllDrivers(page, limit, search);
    res.status(200).json({ success: true, drivers });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const getAllRides = async (req, res) => {
  try {
    const { page, limit, search } = req.query;
    const rides = await adminService.getAllRides(page, limit, search);
    res.status(200).json({ success: true, rides });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const blockUser = async (req, res) => {
  try {
    await adminService.updateUserStatus(req.params.id, 'blocked');
    res.status(200).json({ success: true, message: 'User blocked successfully' });
  } catch (error) {
    res.status(400);
    throw error;
  }
};

const activateUser = async (req, res) => {
  try {
    await adminService.updateUserStatus(req.params.id, 'active');
    res.status(200).json({ success: true, message: 'User activated successfully' });
  } catch (error) {
    res.status(400);
    throw error;
  }
};

const deleteUser = async (req, res) => {
  try {
    await adminService.deleteUser(req.params.id);
    res.status(200).json({ success: true, message: 'User deleted successfully' });
  } catch (error) {
    res.status(400);
    throw error;
  }
};

const getAnalytics = async (req, res) => {
  const analytics = await adminService.getAnalytics();
  res.status(200).json({ success: true, analytics });
};

const getReports = async (req, res) => {
  const report = await adminService.getReports(req.query.type);
  res.status(200).json({ success: true, report });
};

const changePassword = async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  if (!currentPassword || !newPassword) {
    res.status(400);
    throw new Error('Current and new passwords are required');
  }
  try {
    await adminService.changeAdminPassword(req.user.user_id, currentPassword, newPassword);
    res.status(200).json({ success: true, message: 'Password changed successfully' });
  } catch (error) {
    res.status(400);
    throw error;
  }
};

const updateProfile = async (req, res) => {
  const { full_name, phone } = req.body;
  if (!full_name || !phone) {
    res.status(400);
    throw new Error('Name and phone are required');
  }
  await adminService.updateAdminProfile(req.user.user_id, full_name, phone);
  res.status(200).json({ success: true, message: 'Profile updated successfully' });
};

const cancelRide = async (req, res) => {
  try {
    await adminService.cancelRideOverride(req.params.id);
    res.status(200).json({ success: true, message: 'Ride cancelled successfully' });
  } catch (error) {
    res.status(400);
    throw error;
  }
};

module.exports = {
  getDashboardStats,
  getAllUsers,
  getAllDrivers,
  getAllRides,
  blockUser,
  activateUser,
  deleteUser,
  getAnalytics,
  getReports,
  changePassword,
  updateProfile,
  cancelRide,
};

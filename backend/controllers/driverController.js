const driverService = require('../services/driverService');

const getRideRequests = async (req, res) => {
  const rides = await driverService.getPendingRequests();
  res.status(200).json({ success: true, rides });
};

const acceptRide = async (req, res) => {
  try {
    await driverService.acceptRideRequest(req.params.id, req.user.user_id);
    res.status(200).json({ success: true, message: 'Ride Accepted Successfully' });
  } catch (error) {
    res.status(error.message === 'Ride not found' ? 404 : 400);
    throw error;
  }
};

const startRide = async (req, res) => {
  try {
    await driverService.updateRideStatus(req.params.id, req.user.user_id, 'accepted', 'in_progress');
    res.status(200).json({ success: true, message: 'Ride Started Successfully' });
  } catch (error) {
    res.status(error.message === 'Ride not found' ? 404 : 400);
    throw error;
  }
};

const completeRide = async (req, res) => {
  try {
    await driverService.updateRideStatus(req.params.id, req.user.user_id, 'in_progress', 'completed');
    res.status(200).json({ success: true, message: 'Ride Completed Successfully' });
  } catch (error) {
    res.status(error.message === 'Ride not found' ? 404 : 400);
    throw error;
  }
};

const getDriverHistory = async (req, res) => {
  try {
    const { page, limit } = req.query;
    const rides = await driverService.getHistory(req.user.user_id, page, limit);
    res.status(200).json({ success: true, rides });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const getActiveRide = async (req, res) => {
  const ride = await driverService.getActiveRide(req.user.user_id);
  res.status(200).json({ success: true, ride });
};

const getEarnings = async (req, res) => {
  const earnings = await driverService.getEarningsStats(req.user.user_id);
  res.status(200).json({ success: true, earnings });
};

const getDashboardStats = async (req, res) => {
  const stats = await driverService.getDashboardStats(req.user.user_id);
  res.status(200).json({ success: true, stats });
};

module.exports = {
  getRideRequests,
  acceptRide,
  startRide,
  completeRide,
  getDriverHistory,
  getActiveRide,
  getEarnings,
  getDashboardStats,
};

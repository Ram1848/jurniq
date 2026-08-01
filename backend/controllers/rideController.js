const rideService = require('../services/rideService');

const bookRide = async (req, res) => {
  const { pickup_location, drop_location, vehicle_type, payment_method } = req.body;

  if (!pickup_location || !drop_location) {
    res.status(400);
    throw new Error('Pickup and drop locations are required');
  }

  const ride = await rideService.bookRide({
    rider_id: req.user.user_id,
    pickup_location,
    drop_location,
    vehicle_type,
    payment_method
  });

  res.status(201).json({
    success: true,
    message: 'Ride Booked Successfully',
    ride,
  });
};

const getRideHistory = async (req, res) => {
  try {
    const { page, limit } = req.query;
    const rides = await rideService.getHistory(req.user.user_id, page, limit);
    res.status(200).json({ success: true, rides });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const getRideById = async (req, res) => {
  try {
    const ride = await rideService.getById(req.params.id, req.user.user_id);
    res.status(200).json({ success: true, ride });
  } catch (error) {
    res.status(404);
    throw error;
  }
};

const cancelRide = async (req, res) => {
  try {
    await rideService.cancel(req.params.id, req.user.user_id);
    res.status(200).json({ success: true, message: 'Ride Cancelled Successfully' });
  } catch (error) {
    res.status(400);
    throw error;
  }
};

const getDashboardStats = async (req, res) => {
  const stats = await rideService.getStats(req.user.user_id);
  res.status(200).json({ success: true, stats });
};

const getActiveRide = async (req, res) => {
  try {
    const ride = await rideService.getActiveRide(req.user.user_id);
    res.status(200).json({ success: true, ride });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { bookRide, getRideHistory, getRideById, cancelRide, getDashboardStats, getActiveRide };

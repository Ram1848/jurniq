const { pool } = require('../config/db');
const emailService = require('./emailService');

const getPendingRequests = async () => {
  const [rides] = await pool.query(
    `SELECT r.*, u.full_name AS rider_name, u.phone AS rider_phone
     FROM rides r
     JOIN users u ON r.rider_id = u.user_id
     WHERE r.status = 'pending'
     ORDER BY r.created_at DESC`
  );
  return rides;
};

const updateDriverStatus = async (driver_id, status) => {
  await pool.query(
    "UPDATE drivers SET availability_status = ? WHERE user_id = ?",
    [status, driver_id]
  );
};

const acceptRideRequest = async (ride_id, driver_id) => {
  const [rides] = await pool.query('SELECT * FROM rides WHERE ride_id = ?', [ride_id]);

  if (rides.length === 0) {
    throw new Error('Ride not found');
  }
  if (rides[0].status !== 'pending') {
    throw new Error('Ride is no longer available');
  }

  await pool.query(
    "UPDATE rides SET status = 'accepted', driver_id = ? WHERE ride_id = ?",
    [driver_id, ride_id]
  );

  const [rideDetails] = await pool.query(
    'SELECT r.*, u.email as rider_email, u.full_name as rider_name FROM rides r JOIN users u ON r.rider_id = u.user_id WHERE r.ride_id = ?',
    [ride_id]
  );
  const rideInfo = rideDetails[0];

  if (rideInfo && rideInfo.rider_email) {
    const html = emailService.getEmailTemplate(
      'Driver Accepted',
      `Hi ${rideInfo.rider_name}, a driver has accepted your ride and is on the way!`,
      { pickup: rideInfo.pickup_location, drop: rideInfo.drop_location }
    );
    emailService.sendEmail(rideInfo.rider_email, 'Driver is on the way - RideShare', html).catch(() => {});
  }
};

const updateRideStatus = async (ride_id, driver_id, currentStatus, newStatus) => {
  const [rides] = await pool.query(
    'SELECT * FROM rides WHERE ride_id = ? AND driver_id = ?',
    [ride_id, driver_id]
  );

  if (rides.length === 0) {
    throw new Error('Ride not found');
  }
  if (rides[0].status !== currentStatus) {
    throw new Error(`Ride must be ${currentStatus} before updating to ${newStatus}`);
  }

  await pool.query(
    "UPDATE rides SET status = ? WHERE ride_id = ?",
    [newStatus, ride_id]
  );

  const [rideDetails] = await pool.query(
    'SELECT r.*, u.email as rider_email, u.full_name as rider_name FROM rides r JOIN users u ON r.rider_id = u.user_id WHERE r.ride_id = ?',
    [ride_id]
  );
  const rideInfo = rideDetails[0];

  if (rideInfo && rideInfo.rider_email) {
    if (newStatus === 'in_progress') {
      const html = emailService.getEmailTemplate(
        'Ride Started',
        `Hi ${rideInfo.rider_name}, your ride has started. Enjoy the journey!`,
        { pickup: rideInfo.pickup_location, drop: rideInfo.drop_location }
      );
      emailService.sendEmail(rideInfo.rider_email, 'Ride Started - RideShare', html).catch(() => {});
    } else if (newStatus === 'completed') {
      // Update driver metrics for completion
      await pool.query('UPDATE drivers SET completed_rides = completed_rides + 1 WHERE user_id = ?', [driver_id]);
      try {
        const { recalculateScore } = require('./safetyScoreService');
        await recalculateScore(driver_id);
      } catch (err) { console.error('Failed to update safety score', err); }

      const html = emailService.getEmailTemplate(
        'Ride Completed',
        `Hi ${rideInfo.rider_name}, your ride is complete. Thank you for riding with us!`,
        { pickup: rideInfo.pickup_location, drop: rideInfo.drop_location, fare: rideInfo.fare }
      );
      emailService.sendEmail(rideInfo.rider_email, 'Ride Completed - RideShare', html).catch(() => {});
    } else if (newStatus === 'cancelled') {
      // Update driver metrics for cancellation
      await pool.query('UPDATE drivers SET cancelled_rides = cancelled_rides + 1 WHERE user_id = ?', [driver_id]);
      try {
        const { recalculateScore } = require('./safetyScoreService');
        await recalculateScore(driver_id);
      } catch (err) { console.error('Failed to update safety score', err); }
    }
  }
};

const getHistory = async (driver_id, page = 1, limit = 10) => {
  const offset = (page - 1) * limit;
  const [countResult] = await pool.query('SELECT COUNT(*) as total FROM rides WHERE driver_id = ?', [driver_id]);
  const total = countResult[0].total;

  const [rides] = await pool.query(
    `SELECT r.*, u.full_name AS rider_name, u.phone AS rider_phone
     FROM rides r
     JOIN users u ON r.rider_id = u.user_id
     WHERE r.driver_id = ?
     ORDER BY r.created_at DESC LIMIT ? OFFSET ?`,
    [driver_id, parseInt(limit), parseInt(offset)]
  );
  return { data: rides, total, page: parseInt(page), totalPages: Math.ceil(total / limit) };
};

const getActiveRide = async (driver_id) => {
  const [rides] = await pool.query(
    `SELECT r.*, u.full_name AS rider_name, u.phone AS rider_phone, u.email AS rider_email
     FROM rides r
     JOIN users u ON r.rider_id = u.user_id
     WHERE r.driver_id = ? AND r.status IN ('accepted', 'in_progress')
     ORDER BY r.created_at DESC
     LIMIT 1`,
    [driver_id]
  );
  return rides.length > 0 ? rides[0] : null;
};

const getEarningsStats = async (driver_id) => {
  const [[{ todayEarnings }]] = await pool.query(
    `SELECT COALESCE(SUM(fare), 0) AS todayEarnings FROM rides
     WHERE driver_id = ? AND status = 'completed' AND DATE(created_at) = CURDATE()`,
    [driver_id]
  );

  const [[{ weeklyEarnings }]] = await pool.query(
    `SELECT COALESCE(SUM(fare), 0) AS weeklyEarnings FROM rides
     WHERE driver_id = ? AND status = 'completed' AND YEARWEEK(created_at, 1) = YEARWEEK(CURDATE(), 1)`,
    [driver_id]
  );

  const [[{ monthlyEarnings }]] = await pool.query(
    `SELECT COALESCE(SUM(fare), 0) AS monthlyEarnings FROM rides
     WHERE driver_id = ? AND status = 'completed' AND MONTH(created_at) = MONTH(CURDATE()) AND YEAR(created_at) = YEAR(CURDATE())`,
    [driver_id]
  );

  const [[{ totalEarnings }]] = await pool.query(
    `SELECT COALESCE(SUM(fare), 0) AS totalEarnings FROM rides
     WHERE driver_id = ? AND status = 'completed'`,
    [driver_id]
  );

  const [[{ totalTrips }]] = await pool.query(
    `SELECT COUNT(*) AS totalTrips FROM rides
     WHERE driver_id = ? AND status = 'completed'`,
    [driver_id]
  );

  const [[{ avgRating }]] = await pool.query(
    `SELECT COALESCE(AVG(stars), 0) AS avgRating FROM ratings
     WHERE driver_id = ?`,
    [driver_id]
  );

  return {
    todayEarnings: parseFloat(todayEarnings),
    weeklyEarnings: parseFloat(weeklyEarnings),
    monthlyEarnings: parseFloat(monthlyEarnings),
    totalEarnings: parseFloat(totalEarnings),
    totalTrips,
    avgRating: parseFloat(parseFloat(avgRating).toFixed(1)),
  };
};

const getDashboardStats = async (driver_id) => {
  const [[{ totalTrips }]] = await pool.query(
    "SELECT COUNT(*) AS totalTrips FROM rides WHERE driver_id = ?",
    [driver_id]
  );

  const [[{ completedTrips }]] = await pool.query(
    "SELECT COUNT(*) AS completedTrips FROM rides WHERE driver_id = ? AND status = 'completed'",
    [driver_id]
  );

  const [[{ totalEarnings }]] = await pool.query(
    "SELECT COALESCE(SUM(fare), 0) AS totalEarnings FROM rides WHERE driver_id = ? AND status = 'completed'",
    [driver_id]
  );

  const [[{ avgRating }]] = await pool.query(
    "SELECT COALESCE(AVG(stars), 0) AS avgRating FROM ratings WHERE driver_id = ?",
    [driver_id]
  );

  // Fetch driver specific metrics for Safety Score
  const [[driverMetrics]] = await pool.query(
    "SELECT driver_rating, completed_rides, cancelled_rides, complaints, late_arrivals, safety_score FROM drivers WHERE user_id = ?",
    [driver_id]
  );

  return {
    totalTrips,
    completedTrips,
    totalEarnings: parseFloat(totalEarnings),
    avgRating: parseFloat(parseFloat(avgRating).toFixed(1)),
    metrics: driverMetrics || {
      driver_rating: 5.0,
      completed_rides: 0,
      cancelled_rides: 0,
      complaints: 0,
      late_arrivals: 0,
      safety_score: 100
    }
  };
};

module.exports = {
  getPendingRequests,
  acceptRideRequest,
  updateRideStatus,
  getHistory,
  getActiveRide,
  getEarningsStats,
  getDashboardStats,
  updateDriverStatus,
};

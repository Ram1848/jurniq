const { pool } = require('../config/db');
const { calculateFare } = require('./fareService');
const emailService = require('./emailService');

const bookRide = async ({ rider_id, pickup_location, drop_location, vehicle_type, payment_method }) => {
  const vType = vehicle_type || 'mini';
  const pMethod = payment_method || 'cash';

  // Simulate distance calculation (3–25 km)
  const distance = parseFloat((Math.random() * 22 + 3).toFixed(2));
  
  // Calculate fare using the fare service
  const fare = calculateFare(distance, 0, vType);

  const [result] = await pool.query(
    `INSERT INTO rides (rider_id, pickup_location, drop_location, distance, fare, status, vehicle_type, payment_method)
     VALUES (?, ?, ?, ?, ?, 'pending', ?, ?)`,
    [rider_id, pickup_location, drop_location, distance, fare, vType, pMethod]
  );

  const [rides] = await pool.query(
    'SELECT r.*, u.email as rider_email, u.full_name as rider_name FROM rides r JOIN users u ON r.rider_id = u.user_id WHERE r.ride_id = ?', 
    [result.insertId]
  );
  
  const ride = rides[0];
  
  // Send Email Notification
  if (ride && ride.rider_email) {
    const html = emailService.getEmailTemplate(
      'Ride Confirmed',
      `Hi ${ride.rider_name}, your ride request has been confirmed. We are looking for a driver nearby.`,
      { pickup: ride.pickup_location, drop: ride.drop_location, fare: ride.fare }
    );
    emailService.sendEmail(ride.rider_email, 'Ride Confirmed - RideShare', html).catch(() => {});
  }

  return ride;
};

const getHistory = async (rider_id, page = 1, limit = 10) => {
  const offset = (page - 1) * limit;
  const [countResult] = await pool.query('SELECT COUNT(*) as total FROM rides WHERE rider_id = ?', [rider_id]);
  const total = countResult[0].total;

  const [rides] = await pool.query(
    'SELECT * FROM rides WHERE rider_id = ? ORDER BY created_at DESC LIMIT ? OFFSET ?',
    [rider_id, parseInt(limit), parseInt(offset)]
  );
  return { data: rides, total, page: parseInt(page), totalPages: Math.ceil(total / limit) };
};

const getById = async (ride_id, rider_id) => {
  const [rides] = await pool.query(
    'SELECT * FROM rides WHERE ride_id = ? AND rider_id = ?',
    [ride_id, rider_id]
  );
  if (rides.length === 0) {
    throw new Error('Ride not found');
  }
  return rides[0];
};

const cancel = async (ride_id, rider_id) => {
  const ride = await getById(ride_id, rider_id);

  if (ride.status !== 'pending') {
    throw new Error('Only pending rides can be cancelled');
  }

  await pool.query("UPDATE rides SET status = 'cancelled' WHERE ride_id = ?", [ride_id]);
  return true;
};

const getStats = async (rider_id) => {
  const [[{ totalRides }]] = await pool.query(
    'SELECT COUNT(*) as totalRides FROM rides WHERE rider_id = ?',
    [rider_id]
  );

  const [[{ activeRides }]] = await pool.query(
    "SELECT COUNT(*) as activeRides FROM rides WHERE rider_id = ? AND status IN ('pending', 'accepted', 'in_progress')",
    [rider_id]
  );

  const [[{ completedRides }]] = await pool.query(
    "SELECT COUNT(*) as completedRides FROM rides WHERE rider_id = ? AND status = 'completed'",
    [rider_id]
  );

  const [[{ cancelledRides }]] = await pool.query(
    "SELECT COUNT(*) as cancelledRides FROM rides WHERE rider_id = ? AND status = 'cancelled'",
    [rider_id]
  );

  return { totalRides, activeRides, completedRides, cancelledRides };
};

const getActiveRide = async (rider_id) => {
  const [rides] = await pool.query(
    `SELECT r.*, d.vehicle_number, d.vehicle_type, u.full_name AS driver_name, u.phone AS driver_phone
     FROM rides r
     LEFT JOIN drivers d ON r.driver_id = d.user_id
     LEFT JOIN users u ON d.user_id = u.user_id
     WHERE r.rider_id = ? AND r.status IN ('accepted', 'in_progress')
     ORDER BY r.created_at DESC
     LIMIT 1`,
    [rider_id]
  );
  return rides.length > 0 ? rides[0] : null;
};

module.exports = { bookRide, getHistory, getById, cancel, getStats, getActiveRide };

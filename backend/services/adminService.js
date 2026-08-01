const { pool } = require('../config/db');
const bcrypt = require('bcryptjs');

const getDashboardStats = async () => {
  const [[{ totalUsers }]] = await pool.query("SELECT COUNT(*) AS totalUsers FROM users WHERE role = 'rider'");
  const [[{ totalDrivers }]] = await pool.query("SELECT COUNT(*) AS totalDrivers FROM users WHERE role = 'driver'");
  const [[{ totalRides }]] = await pool.query('SELECT COUNT(*) AS totalRides FROM rides');
  const [[{ activeRides }]] = await pool.query("SELECT COUNT(*) AS activeRides FROM rides WHERE status IN ('pending', 'accepted', 'in_progress')");
  const [[{ completedRides }]] = await pool.query("SELECT COUNT(*) AS completedRides FROM rides WHERE status = 'completed'");
  const [[{ revenue }]] = await pool.query("SELECT COALESCE(SUM(fare), 0) AS revenue FROM rides WHERE status = 'completed'");

  return {
    totalUsers,
    totalDrivers,
    totalRides,
    activeRides,
    completedRides,
    revenue: parseFloat(revenue),
  };
};

const getAllUsers = async (page = 1, limit = 10, search = '') => {
  const offset = (page - 1) * limit;
  let query = "SELECT user_id, full_name, email, phone, role, COALESCE(status, 'active') AS status, created_at FROM users WHERE role = 'rider'";
  const queryParams = [];

  if (search) {
    query += " AND (full_name LIKE ? OR email LIKE ? OR phone LIKE ?)";
    const searchPattern = `%${search}%`;
    queryParams.push(searchPattern, searchPattern, searchPattern);
  }

  const [countResult] = await pool.query(`SELECT COUNT(*) as total FROM (${query}) AS subquery`, queryParams);
  const total = countResult[0].total;

  query += " ORDER BY created_at DESC LIMIT ? OFFSET ?";
  queryParams.push(parseInt(limit), parseInt(offset));

  const [users] = await pool.query(query, queryParams);
  return { data: users, total, page: parseInt(page), totalPages: Math.ceil(total / limit) };
};

const getAllDrivers = async (page = 1, limit = 10, search = '') => {
  const offset = (page - 1) * limit;
  let query = `
    SELECT u.user_id, u.full_name, u.email, u.phone, COALESCE(u.status, 'active') AS status, u.created_at,
           COALESCE(d.vehicle_type, 'N/A') AS vehicle_type,
           COALESCE(d.vehicle_number, 'N/A') AS vehicle_number,
           COALESCE(d.availability_status, 'offline') AS availability_status,
           COALESCE(AVG(rt.stars), 0) AS avg_rating,
           COUNT(DISTINCT r.ride_id) AS total_rides
    FROM users u
    LEFT JOIN drivers d ON u.user_id = d.user_id
    LEFT JOIN rides r ON u.user_id = r.driver_id
    LEFT JOIN ratings rt ON u.user_id = rt.driver_id
    WHERE u.role = 'driver'
  `;
  const queryParams = [];

  if (search) {
    query += " AND (u.full_name LIKE ? OR u.email LIKE ? OR u.phone LIKE ?)";
    const searchPattern = `%${search}%`;
    queryParams.push(searchPattern, searchPattern, searchPattern);
  }

  query += " GROUP BY u.user_id";

  const [countResult] = await pool.query(`SELECT COUNT(*) as total FROM (${query}) AS subquery`, queryParams);
  const total = countResult[0].total;

  query += " ORDER BY u.created_at DESC LIMIT ? OFFSET ?";
  queryParams.push(parseInt(limit), parseInt(offset));

  const [drivers] = await pool.query(query, queryParams);
  return { data: drivers, total, page: parseInt(page), totalPages: Math.ceil(total / limit) };
};

const getAllRides = async (page = 1, limit = 10, search = '') => {
  const offset = (page - 1) * limit;
  let query = `
    SELECT r.*,
           rider.full_name AS rider_name,
           COALESCE(driver.full_name, 'Unassigned') AS driver_name
    FROM rides r
    JOIN users rider ON r.rider_id = rider.user_id
    LEFT JOIN users driver ON r.driver_id = driver.user_id
  `;
  const queryParams = [];

  if (search) {
    query += " WHERE (rider.full_name LIKE ? OR driver.full_name LIKE ? OR r.pickup_location LIKE ? OR r.drop_location LIKE ?)";
    const searchPattern = `%${search}%`;
    queryParams.push(searchPattern, searchPattern, searchPattern, searchPattern);
  }

  const [countResult] = await pool.query(`SELECT COUNT(*) as total FROM (${query}) AS subquery`, queryParams);
  const total = countResult[0].total;

  query += " ORDER BY r.created_at DESC LIMIT ? OFFSET ?";
  queryParams.push(parseInt(limit), parseInt(offset));

  const [rides] = await pool.query(query, queryParams);
  return { data: rides, total, page: parseInt(page), totalPages: Math.ceil(total / limit) };
};

const updateUserStatus = async (user_id, newStatus) => {
  const [users] = await pool.query('SELECT * FROM users WHERE user_id = ?', [user_id]);
  if (users.length === 0) {
    throw new Error('User not found');
  }
  if (users[0].role === 'admin') {
    throw new Error(`Cannot ${newStatus === 'blocked' ? 'block' : 'modify'} an admin user`);
  }
  await pool.query("UPDATE users SET status = ? WHERE user_id = ?", [newStatus, user_id]);
};

const deleteUser = async (user_id) => {
  const [users] = await pool.query('SELECT * FROM users WHERE user_id = ?', [user_id]);
  if (users.length === 0) {
    throw new Error('User not found');
  }
  if (users[0].role === 'admin') {
    throw new Error('Cannot delete an admin user');
  }
  await pool.query('DELETE FROM users WHERE user_id = ?', [user_id]);
};

const getAnalytics = async () => {
  const [dailyRides] = await pool.query(
    `SELECT DATE(created_at) AS date, COUNT(*) AS count
     FROM rides WHERE created_at >= DATE_SUB(CURDATE(), INTERVAL 7 DAY)
     GROUP BY DATE(created_at) ORDER BY date ASC`
  );

  const [weeklyRides] = await pool.query(
    `SELECT YEARWEEK(created_at, 1) AS week, COUNT(*) AS count
     FROM rides WHERE created_at >= DATE_SUB(CURDATE(), INTERVAL 4 WEEK)
     GROUP BY YEARWEEK(created_at, 1) ORDER BY week ASC`
  );

  const [monthlyRides] = await pool.query(
    `SELECT DATE_FORMAT(created_at, '%Y-%m') AS month, COUNT(*) AS count
     FROM rides WHERE created_at >= DATE_SUB(CURDATE(), INTERVAL 6 MONTH)
     GROUP BY DATE_FORMAT(created_at, '%Y-%m') ORDER BY month ASC`
  );

  const [statusDistribution] = await pool.query(`SELECT status, COUNT(*) AS count FROM rides GROUP BY status`);

  const [revenueTrend] = await pool.query(
    `SELECT DATE_FORMAT(created_at, '%Y-%m') AS month, COALESCE(SUM(fare), 0) AS revenue
     FROM rides WHERE status = 'completed' AND created_at >= DATE_SUB(CURDATE(), INTERVAL 6 MONTH)
     GROUP BY DATE_FORMAT(created_at, '%Y-%m') ORDER BY month ASC`
  );

  const [topDrivers] = await pool.query(
    `SELECT u.user_id, u.full_name, COUNT(r.ride_id) AS total_rides, COALESCE(SUM(r.fare), 0) AS total_earnings, COALESCE(AVG(rt.stars), 0) AS avg_rating
     FROM users u
     JOIN rides r ON u.user_id = r.driver_id AND r.status = 'completed'
     LEFT JOIN ratings rt ON u.user_id = rt.driver_id
     WHERE u.role = 'driver'
     GROUP BY u.user_id ORDER BY total_rides DESC LIMIT 5`
  );

  const [activeUsers] = await pool.query(
    `SELECT u.user_id, u.full_name, COUNT(r.ride_id) AS total_rides, COALESCE(SUM(r.fare), 0) AS total_spent
     FROM users u JOIN rides r ON u.user_id = r.rider_id
     WHERE u.role = 'rider'
     GROUP BY u.user_id ORDER BY total_rides DESC LIMIT 5`
  );

  return { dailyRides, weeklyRides, monthlyRides, statusDistribution, revenueTrend, topDrivers, activeUsers };
};

const getReports = async (type) => {
  let dateFilter = 'DATE(created_at) = CURDATE()';
  if (type === 'weekly') {
    dateFilter = 'YEARWEEK(created_at, 1) = YEARWEEK(CURDATE(), 1)';
  } else if (type === 'monthly') {
    dateFilter = 'MONTH(created_at) = MONTH(CURDATE()) AND YEAR(created_at) = YEAR(CURDATE())';
  }

  const [rides] = await pool.query(
    `SELECT r.ride_id, rider.full_name AS rider_name, COALESCE(driver.full_name, 'Unassigned') AS driver_name,
            r.pickup_location, r.drop_location, r.distance, r.fare, r.status, r.vehicle_type, r.payment_method, r.created_at
     FROM rides r JOIN users rider ON r.rider_id = rider.user_id LEFT JOIN users driver ON r.driver_id = driver.user_id
     WHERE ${dateFilter} ORDER BY r.created_at DESC`
  );

  const [[{ totalRides }]] = await pool.query(`SELECT COUNT(*) AS totalRides FROM rides WHERE ${dateFilter}`);
  const [[{ totalRevenue }]] = await pool.query(`SELECT COALESCE(SUM(fare), 0) AS totalRevenue FROM rides WHERE status = 'completed' AND ${dateFilter}`);
  const [[{ completedCount }]] = await pool.query(`SELECT COUNT(*) AS completedCount FROM rides WHERE status = 'completed' AND ${dateFilter}`);
  const [[{ cancelledCount }]] = await pool.query(`SELECT COUNT(*) AS cancelledCount FROM rides WHERE status = 'cancelled' AND ${dateFilter}`);

  return { type: type || 'daily', totalRides, totalRevenue: parseFloat(totalRevenue), completedCount, cancelledCount, rides };
};

const changeAdminPassword = async (admin_id, currentPassword, newPassword) => {
  const [users] = await pool.query('SELECT * FROM users WHERE user_id = ?', [admin_id]);
  const isMatch = await bcrypt.compare(currentPassword, users[0].password);

  if (!isMatch) {
    throw new Error('Current password is incorrect');
  }

  const hashedPassword = await bcrypt.hash(newPassword, 10);
  await pool.query('UPDATE users SET password = ? WHERE user_id = ?', [hashedPassword, admin_id]);
};

const updateAdminProfile = async (admin_id, full_name, phone) => {
  await pool.query('UPDATE users SET full_name = ?, phone = ? WHERE user_id = ?', [full_name, phone, admin_id]);
};

const cancelRideOverride = async (ride_id) => {
  const [rides] = await pool.query('SELECT * FROM rides WHERE ride_id = ?', [ride_id]);
  if (rides.length === 0) throw new Error('Ride not found');
  if (rides[0].status === 'completed' || rides[0].status === 'cancelled') {
    throw new Error('Ride cannot be cancelled');
  }
  await pool.query("UPDATE rides SET status = 'cancelled' WHERE ride_id = ?", [ride_id]);
};

module.exports = {
  getDashboardStats,
  getAllUsers,
  getAllDrivers,
  getAllRides,
  updateUserStatus,
  deleteUser,
  getAnalytics,
  getReports,
  changeAdminPassword,
  updateAdminProfile,
  cancelRideOverride
};

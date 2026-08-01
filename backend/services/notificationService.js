const { pool } = require('../config/db');

const createNotification = async (user_id, title, message, type = 'admin') => {
  const [result] = await pool.query(
    `INSERT INTO notifications (user_id, title, message, type) VALUES (?, ?, ?, ?)`,
    [user_id, title, message, type]
  );
  return result.insertId;
};

const getUserNotifications = async (user_id) => {
  const [notifications] = await pool.query(
    `SELECT * FROM notifications WHERE user_id = ? ORDER BY created_at DESC LIMIT 50`,
    [user_id]
  );
  return notifications;
};

const markAsRead = async (notification_id, user_id) => {
  await pool.query(
    `UPDATE notifications SET is_read = TRUE WHERE notification_id = ? AND user_id = ?`,
    [notification_id, user_id]
  );
  return true;
};

const markAllAsRead = async (user_id) => {
  await pool.query(
    `UPDATE notifications SET is_read = TRUE WHERE user_id = ?`,
    [user_id]
  );
  return true;
};

module.exports = {
  createNotification,
  getUserNotifications,
  markAsRead,
  markAllAsRead
};

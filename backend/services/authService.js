const bcrypt = require('bcryptjs');
const { pool } = require('../config/db');

const registerUser = async ({ full_name, email, phone, password, role }) => {
  const [existing] = await pool.query('SELECT user_id FROM users WHERE email = ?', [email]);
  
  if (existing.length > 0) {
    throw new Error('User with this email already exists');
  }

  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);

  const [result] = await pool.query(
    'INSERT INTO users (full_name, email, phone, password, role) VALUES (?, ?, ?, ?, ?)',
    [full_name, email, phone, hashedPassword, role || 'rider']
  );

  if (result.affectedRows === 0) {
    throw new Error('Registration failed, please try again');
  }

  return { success: true };
};

const loginUser = async ({ email, password }) => {
  const [rows] = await pool.query('SELECT * FROM users WHERE email = ?', [email]);
  
  if (rows.length === 0) {
    throw new Error('Invalid email or password');
  }

  const user = rows[0];
  const isMatch = await bcrypt.compare(password, user.password);

  if (!isMatch) {
    throw new Error('Invalid email or password');
  }

  return {
    user_id: user.user_id,
    full_name: user.full_name,
    email: user.email,
    phone: user.phone,
    role: user.role,
  };
};

const updateProfile = async (user_id, { full_name, phone }) => {
  const [result] = await pool.query(
    'UPDATE users SET full_name = ?, phone = ? WHERE user_id = ?',
    [full_name, phone, user_id]
  );
  if (result.affectedRows === 0) {
    throw new Error('Profile update failed');
  }
  const [userRows] = await pool.query('SELECT user_id, full_name, email, phone, role FROM users WHERE user_id = ?', [user_id]);
  return userRows[0];
};

module.exports = {
  registerUser,
  loginUser,
  updateProfile,
};

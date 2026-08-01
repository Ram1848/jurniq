const jwt = require('jsonwebtoken');
const { pool } = require('../config/db');

/**
 * Protect middleware — guards routes that require authentication.
 *
 * Flow:
 *  1. Extract the Bearer token from the Authorization header.
 *  2. Verify the token signature and decode the payload.
 *  3. Fetch the user row (excluding password) and attach it to req.user.
 *  4. Reject with 401 if anything fails.
 */
const protect = async (req, res, next) => {
  let token;

  // Check for Bearer token in Authorization header
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  }

  // No token found — unauthorized
  if (!token) {
    res.status(401);
    throw new Error('Not authorized, no token provided');
  }

  // Verify token and fetch user
  const decoded = jwt.verify(token, process.env.JWT_SECRET);

  const [rows] = await pool.query(
    'SELECT user_id, full_name, email, phone, role, created_at FROM users WHERE user_id = ?',
    [decoded.user_id]
  );

  if (rows.length === 0) {
    res.status(401);
    throw new Error('Not authorized, user not found');
  }

  // Attach user to request object for downstream handlers
  req.user = rows[0];
  next();
};

module.exports = { protect };

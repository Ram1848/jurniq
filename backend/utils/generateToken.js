const jwt = require('jsonwebtoken');

/**
 * Generate a signed JWT for the given user ID.
 * Token is valid for 30 days.
 *
 * @param {number} user_id - The ID of the authenticated user
 * @returns {string} Signed JWT string
 */
const generateToken = (user_id) => {
  return jwt.sign({ user_id }, process.env.JWT_SECRET, {
    expiresIn: '30d',
  });
};

module.exports = generateToken;

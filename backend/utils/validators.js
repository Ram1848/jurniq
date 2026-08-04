// Basic validation utility and response helpers

const isEmail = (email) => {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(email);
};

const isPhone = (phone) => {
  const regex = /^\+?[1-9]\d{1,14}$/; // Basic E.164
  return regex.test(phone);
};

const validateRegistration = (data) => {
  const errors = [];
  if (!data.full_name) errors.push('Full name is required');
  if (!data.email || !isEmail(data.email)) errors.push('Valid email is required');
  if (!data.phone || !isPhone(data.phone)) errors.push('Valid phone number is required');
  if (!data.password || data.password.length < 6) errors.push('Password must be at least 6 characters');
  return errors;
};

const sendResponse = (res, statusCode, message, data = {}) => {
  return res.status(statusCode).json({
    success: true,
    message,
    ...data,
  });
};

const sendError = (res, statusCode, message) => {
  return res.status(statusCode).json({
    success: false,
    message,
  });
};

module.exports = {
  isEmail,
  isPhone,
  validateRegistration,
  sendResponse,
  sendError,
};

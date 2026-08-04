const bcrypt = require('bcryptjs');
const { pool } = require('../config/db');
const emailService = require('./emailService');

/**
 * Validates password strength according to security guidelines
 */
const validatePasswordStrength = (password) => {
  if (!password || password.length < 8) {
    return 'Password must be at least 8 characters long.';
  }
  if (!/[A-Z]/.test(password)) {
    return 'Password must contain at least one uppercase letter.';
  }
  if (!/[a-z]/.test(password)) {
    return 'Password must contain at least one lowercase letter.';
  }
  if (!/[0-9]/.test(password)) {
    return 'Password must contain at least one number.';
  }
  if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    return 'Password must contain at least one special character.';
  }
  return null;
};

/**
 * Generate a random 6-digit OTP, store hashed in DB with 5 min expiry, and send via email
 */
const generateAndSendOTP = async (email) => {
  const [users] = await pool.query('SELECT user_id, full_name, email FROM users WHERE email = ?', [email]);
  
  if (users.length === 0) {
    throw new Error('Account not found.');
  }

  const user = users[0];

  // Generate 6-digit numeric OTP
  const otpCode = Math.floor(100000 + Math.random() * 900000).toString();

  // Hash OTP for secure storage
  const salt = await bcrypt.genSalt(10);
  const hashedOTP = await bcrypt.hash(otpCode, salt);

  // Set 5-minute expiry
  const expiryTime = new Date(Date.now() + 5 * 60 * 1000);

  // Update user with hashed OTP, expiry, and reset attempts to 0
  await pool.query(
    'UPDATE users SET reset_otp = ?, otp_expiry = ?, otp_attempts = 0 WHERE email = ?',
    [hashedOTP, expiryTime, email]
  );

  // Send email via Nodemailer
  await emailService.sendOTPEmail(user.email, user.full_name, otpCode);

  return {
    success: true,
    message: 'OTP sent to your email.'
  };
};

/**
 * Verify provided OTP against hashed OTP in DB
 */
const verifyOTP = async (email, otpCode) => {
  if (!email || !otpCode) {
    throw new Error('Email and OTP are required.');
  }

  const [users] = await pool.query(
    'SELECT user_id, reset_otp, otp_expiry, otp_attempts FROM users WHERE email = ?',
    [email]
  );

  if (users.length === 0) {
    throw new Error('Account not found.');
  }

  const user = users[0];

  if (!user.reset_otp || !user.otp_expiry) {
    throw new Error('No active OTP request found.');
  }

  // Check attempt limit
  if (user.otp_attempts >= 3) {
    throw new Error('Maximum OTP verification attempts exceeded. Please request a new OTP.');
  }

  // Check expiry
  const now = new Date();
  const expiry = new Date(user.otp_expiry);
  if (now > expiry) {
    throw new Error('OTP Expired');
  }

  // Increment attempts counter
  await pool.query('UPDATE users SET otp_attempts = otp_attempts + 1 WHERE email = ?', [email]);

  // Verify OTP hash
  const isMatch = await bcrypt.compare(otpCode, user.reset_otp);
  if (!isMatch) {
    throw new Error('Invalid OTP');
  }

  return {
    success: true,
    message: 'OTP verified successfully.'
  };
};

/**
 * Resend OTP to user email
 */
const resendOTP = async (email) => {
  return await generateAndSendOTP(email);
};

/**
 * Reset user password after verifying OTP and password strength
 */
const resetPassword = async (email, otpCode, newPassword, confirmPassword) => {
  if (!newPassword || !confirmPassword) {
    throw new Error('Please provide both new password and confirm password.');
  }

  if (newPassword !== confirmPassword) {
    throw new Error('Passwords do not match.');
  }

  const strengthError = validatePasswordStrength(newPassword);
  if (strengthError) {
    throw new Error(strengthError);
  }

  // Verify OTP first
  await verifyOTP(email, otpCode);

  // Hash new password
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(newPassword, salt);

  // Update password and clear OTP fields
  await pool.query(
    'UPDATE users SET password = ?, reset_otp = NULL, otp_expiry = NULL, otp_attempts = 0 WHERE email = ?',
    [hashedPassword, email]
  );

  return {
    success: true,
    message: 'Password reset successfully. Please login with your new password.'
  };
};

module.exports = {
  validatePasswordStrength,
  generateAndSendOTP,
  verifyOTP,
  resendOTP,
  resetPassword
};

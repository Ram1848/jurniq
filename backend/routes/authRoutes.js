const express = require('express');
const router = express.Router();
const {
  register,
  login,
  getProfile,
  updateProfile,
  forgotPassword,
  verifyOTP,
  resendOTP,
  resetPassword,
  testEmail
} = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');
const { validateEmail, otpRateLimiter } = require('../middleware/validation');

// Public routes
router.post('/register', register);
router.post('/login', login);

// Forgot Password / OTP Public Routes
router.post('/forgot-password', validateEmail, otpRateLimiter, forgotPassword);
router.post('/verify-otp', validateEmail, verifyOTP);
router.post('/resend-otp', validateEmail, otpRateLimiter, resendOTP);
router.post('/reset-password', validateEmail, resetPassword);
router.post('/test-email', validateEmail, testEmail);

// Protected routes
router.get('/profile', protect, getProfile);
router.put('/profile', protect, updateProfile);

module.exports = router;

const authService = require('../services/authService');
const otpService = require('../services/otpService');
const generateToken = require('../utils/generateToken');

const register = async (req, res) => {
  const { full_name, email, phone, password, role } = req.body;

  if (!full_name || !email || !phone || !password) {
    res.status(400);
    throw new Error('Please provide all required fields: full_name, email, phone, password');
  }

  try {
    await authService.registerUser({ full_name, email, phone, password, role });
    res.status(201).json({
      success: true,
      message: 'Registration Successful',
    });
  } catch (error) {
    res.status(400);
    throw error;
  }
};

const login = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    res.status(400);
    throw new Error('Please provide email and password');
  }

  try {
    const user = await authService.loginUser({ email, password });
    const token = generateToken(user.user_id);

    res.status(200).json({
      success: true,
      token,
      user,
    });
  } catch (error) {
    res.status(401);
    throw error;
  }
};

const getProfile = async (req, res) => {
  res.status(200).json({
    success: true,
    user: req.user,
  });
};

const updateProfile = async (req, res) => {
  const { full_name, phone } = req.body;
  if (!full_name || !phone) {
    res.status(400);
    throw new Error('Please provide full_name and phone');
  }
  try {
    const updatedUser = await authService.updateProfile(req.user.user_id, { full_name, phone });
    res.status(200).json({ success: true, message: 'Profile updated successfully', user: updatedUser });
  } catch (error) {
    res.status(400);
    throw error;
  }
};

const forgotPassword = async (req, res) => {
  const { email } = req.body;
  try {
    const result = await otpService.generateAndSendOTP(email);
    res.status(200).json(result);
  } catch (error) {
    const status = error.message === 'Account not found.' ? 404 : 400;
    res.status(status).json({
      success: false,
      message: error.message
    });
  }
};

const verifyOTP = async (req, res) => {
  const { email, otp } = req.body;
  try {
    const result = await otpService.verifyOTP(email, otp);
    res.status(200).json(result);
  } catch (error) {
    const status = error.message.includes('attempts exceeded') ? 429 : 400;
    res.status(status).json({
      success: false,
      message: error.message
    });
  }
};

const resendOTP = async (req, res) => {
  const { email } = req.body;
  try {
    const result = await otpService.resendOTP(email);
    res.status(200).json(result);
  } catch (error) {
    const status = error.message === 'Account not found.' ? 404 : 400;
    res.status(status).json({
      success: false,
      message: error.message
    });
  }
};

const resetPassword = async (req, res) => {
  const { email, otp, newPassword, confirmPassword } = req.body;
  try {
    const result = await otpService.resetPassword(email, otp, newPassword, confirmPassword);
    res.status(200).json(result);
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

const testEmail = async (req, res) => {
  const { email } = req.body;
  const emailService = require('../services/emailService');

  if (!email) {
    return res.status(400).json({
      success: false,
      message: 'Please provide a target email address.'
    });
  }

  try {
    const configStatus = await emailService.verifyEmailConfig();
    const sendInfo = await emailService.sendTestEmail(email);

    res.status(200).json({
      success: true,
      message: `Test email successfully dispatched to ${email}`,
      config: configStatus,
      messageId: sendInfo.messageId,
      response: sendInfo.response || 'Dispatched'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: `Test email delivery failed: ${error.message}`,
      error: error.message
    });
  }
};

module.exports = {
  register,
  login,
  getProfile,
  updateProfile,
  forgotPassword,
  verifyOTP,
  resendOTP,
  resetPassword,
  testEmail
};

const authService = require('../services/authService');
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

module.exports = { register, login, getProfile, updateProfile };

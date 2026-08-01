const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { adminOnly } = require('../middleware/roleMiddleware');
const {
  getDashboardStats,
  getAllUsers,
  getAllDrivers,
  getAllRides,
  blockUser,
  activateUser,
  deleteUser,
  getAnalytics,
  getReports,
  changePassword,
  updateProfile,
  cancelRide,
} = require('../controllers/adminController');

// All admin routes require authentication + admin role
router.use(protect, adminOnly);

router.get('/dashboard', getDashboardStats);
router.get('/users', getAllUsers);
router.get('/drivers', getAllDrivers);
router.get('/rides', getAllRides);
router.put('/block-user/:id', blockUser);
router.put('/activate-user/:id', activateUser);
router.delete('/delete-user/:id', deleteUser);
router.get('/analytics', getAnalytics);
router.get('/reports', getReports);
router.put('/change-password', changePassword);
router.put('/update-profile', updateProfile);
router.put('/cancel-ride/:id', cancelRide);

module.exports = router;

const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const {
  getRideRequests,
  acceptRide,
  startRide,
  completeRide,
  getDriverHistory,
  getActiveRide,
  getEarnings,
  getDashboardStats,
} = require('../controllers/driverController');

// All driver routes require authentication
router.use(protect);

router.get('/ride-requests', getRideRequests);
router.put('/accept/:id', acceptRide);
router.put('/start/:id', startRide);
router.put('/complete/:id', completeRide);
router.get('/active-ride', getActiveRide);
router.get('/history', getDriverHistory);
router.get('/earnings', getEarnings);
router.get('/dashboard/stats', getDashboardStats);

module.exports = router;

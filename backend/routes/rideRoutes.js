const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const {
  bookRide,
  getRideHistory,
  getRideById,
  cancelRide,
  getDashboardStats,
  getActiveRide,
} = require('../controllers/rideController');

// All ride routes require authentication
router.use(protect);

router.post('/book', bookRide);
router.get('/history', getRideHistory);
router.get('/dashboard/stats', getDashboardStats);
router.get('/active-ride', getActiveRide);
router.get('/:id', getRideById);
router.delete('/cancel/:id', cancelRide);

module.exports = router;

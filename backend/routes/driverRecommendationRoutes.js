const express = require('express');
const router = express.Router();
const driverRecommendationController = require('../controllers/driverRecommendationController');
const { protect } = require('../middleware/authMiddleware');

// Route is protected so only logged-in users (riders) can request recommendations
router.post('/', protect, driverRecommendationController.getRecommendations);

module.exports = router;

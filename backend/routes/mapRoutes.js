const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { getFareEstimate } = require('../controllers/mapController');

router.post('/calculate-fare', protect, getFareEstimate);

module.exports = router;

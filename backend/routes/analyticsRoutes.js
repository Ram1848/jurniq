const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { adminOnly } = require('../middleware/roleMiddleware');
const { getPersonalDashboard, getAdminDashboard } = require('../controllers/analyticsController');

router.use(protect);

router.get('/personal', getPersonalDashboard);
router.get('/admin', adminOnly, getAdminDashboard);

module.exports = router;

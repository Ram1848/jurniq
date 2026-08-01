const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const notificationController = require('../controllers/notificationController');

// All routes are protected
router.use(protect);

router.get('/', notificationController.getNotifications);
router.put('/mark-all-read', notificationController.markAllRead);
router.put('/:id/read', notificationController.markRead);

module.exports = router;

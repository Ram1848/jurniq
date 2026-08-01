const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { adminOnly } = require('../middleware/roleMiddleware');
const {
  triggerSOS,
  resolveSOS,
  getActiveAlerts,
  getEmergencyContacts,
  addEmergencyContact,
  deleteEmergencyContact
} = require('../controllers/sosController');

// All SOS routes require authentication
router.use(protect);

// User endpoints
router.post('/trigger', triggerSOS);
router.get('/contacts', getEmergencyContacts);
router.post('/contacts', addEmergencyContact);
router.delete('/contacts/:id', deleteEmergencyContact);

// Admin endpoints
router.get('/alerts', adminOnly, getActiveAlerts);
router.put('/resolve/:id', adminOnly, resolveSOS);

module.exports = router;

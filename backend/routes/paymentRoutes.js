const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const paymentController = require('../controllers/paymentController');

// All payment routes require authentication
router.use(protect);

router.post('/create-checkout-session', paymentController.createCheckoutSession);
router.post('/process', paymentController.processPayment);
router.post('/success', paymentController.paymentSuccess);
router.get('/history', paymentController.getPaymentHistory);

module.exports = router;

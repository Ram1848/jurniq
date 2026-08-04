const paymentService = require('../services/paymentService');
const emailService = require('../services/emailService');
const { getById } = require('../services/rideService');
const { sendResponse, sendError } = require('../utils/validators');

const createCheckoutSession = async (req, res) => {
  try {
    const { ride_id, amount } = req.body;
    const url = await paymentService.createCheckoutSession(ride_id, amount, req.user.user_id);
    sendResponse(res, 200, 'Checkout session created', { url });
  } catch (error) {
    sendError(res, 500, error.message);
  }
};

const processPayment = async (req, res) => {
  try {
    const { ride_id, amount, method, upi_id, card_details, transaction_id } = req.body;

    if (!ride_id || !amount || !method) {
      return sendError(res, 400, 'Missing required payment details (ride_id, amount, method)');
    }

    const validMethods = ['cash', 'upi', 'card'];
    if (!validMethods.includes(method.toLowerCase())) {
      return sendError(res, 400, 'Invalid payment method. Allowed: cash, upi, card');
    }

    // Server-side validation for UPI
    if (method === 'upi' && upi_id) {
      const upiRegex = /^[a-zA-Z0-9.\-_]{2,256}@[a-zA-Z]{2,64}$/;
      if (!upiRegex.test(upi_id)) {
        return sendError(res, 400, 'Invalid UPI ID format (e.g. username@bank)');
      }
    }

    // Generate transaction ID if not provided
    const txnId = transaction_id || `TXN_${method.toUpperCase()}_${Date.now()}_${Math.floor(1000 + Math.random() * 9000)}`;

    // Record payment in DB
    const { payment_id, transaction_id: finalTxnId } = await paymentService.recordPayment(
      ride_id,
      amount,
      method.toLowerCase(),
      'completed',
      txnId
    );

    // Fetch ride details for invoice email
    let ride = null;
    try {
      ride = await getById(ride_id, req.user.user_id);
    } catch {
      /* ride details fetch optional if admin or callback */
    }

    // Send Invoice Email Notification
    if (req.user && req.user.email) {
      const html = emailService.getEmailTemplate(
        'Payment Successful',
        `Thank you for your payment of ₹${amount} via ${method.toUpperCase()}. Transaction ID: ${finalTxnId}`,
        ride ? { pickup: ride.pickup_location, drop: ride.drop_location, fare: amount } : null
      );
      emailService.sendEmail(req.user.email, `Ride Invoice #${ride_id} - RideShare`, html).catch(() => {});
    }

    sendResponse(res, 200, 'Payment completed successfully', {
      payment: {
        payment_id,
        ride_id,
        amount,
        payment_method: method.toLowerCase(),
        payment_status: 'completed',
        transaction_id: finalTxnId,
        created_at: new Date(),
      },
    });
  } catch (error) {
    sendError(res, 500, error.message);
  }
};

const paymentSuccess = async (req, res) => {
  return processPayment(req, res);
};

const getPaymentHistory = async (req, res) => {
  try {
    const { page, limit, search } = req.query;
    const payments = await paymentService.getPaymentHistory(req.user.user_id, page, limit, search);
    sendResponse(res, 200, 'Payment history retrieved', { payments });
  } catch (error) {
    sendError(res, 500, error.message);
  }
};

module.exports = {
  createCheckoutSession,
  processPayment,
  paymentSuccess,
  getPaymentHistory,
};

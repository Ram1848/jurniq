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

const paymentSuccess = async (req, res) => {
  try {
    const { ride_id, amount, method } = req.body;
    
    // Record payment in DB
    await paymentService.recordPayment(ride_id, amount, method, 'completed');

    // Get ride details for invoice
    const ride = await getById(ride_id, req.user.user_id);

    // Send Invoice Email
    const html = emailService.getEmailTemplate(
      'Payment Successful',
      `Thank you for your payment of ₹${amount}. Here is your ride invoice.`,
      { pickup: ride.pickup_location, drop: ride.drop_location, fare: amount }
    );
    emailService.sendEmail(req.user.email, 'Ride Invoice - RideShare', html).catch(() => {});

    sendResponse(res, 200, 'Payment recorded successfully');
  } catch (error) {
    sendError(res, 500, error.message);
  }
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
  paymentSuccess,
  getPaymentHistory
};

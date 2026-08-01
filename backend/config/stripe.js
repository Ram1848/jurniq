const Stripe = require('stripe');

// Initialize Stripe with secret key
const stripe = Stripe(process.env.STRIPE_SECRET_KEY || 'sk_test_placeholder');

module.exports = stripe;

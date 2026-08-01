const Stripe = require('stripe');
const stripe = Stripe(process.env.STRIPE_SECRET_KEY);

const { pool } = require('../config/db');

const createCheckoutSession = async (ride_id, amount, rider_id) => {
  try {
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'inr',
            product_data: {
              name: `Ride #${ride_id}`,
              description: 'RideShare Payment',
            },
            unit_amount: Math.round(amount * 100),
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `http://localhost:5173/payment/${ride_id}?status=success&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `http://localhost:5173/payment/${ride_id}?status=cancelled`,
      metadata: {
        ride_id: ride_id.toString(),
        rider_id: rider_id.toString(),
      },
    });

    return session.url;
  } catch (error) {
    throw new Error(`Failed to create Stripe session: ${error.message}`);
  }
};

const recordPayment = async (ride_id, amount, method, status) => {
  const [result] = await pool.query(
    `INSERT INTO payments (ride_id, amount, payment_method, payment_status)
     VALUES (?, ?, ?, ?)`,
    [ride_id, amount, method, status]
  );

  return result.insertId;
};

const getPaymentHistory = async (
  user_id,
  page = 1,
  limit = 10,
  search = ''
) => {
  const offset = (page - 1) * limit;

  let query = `
    SELECT
      p.*,
      r.pickup_location,
      r.drop_location,
      r.created_at AS ride_date
    FROM payments p
    JOIN rides r ON p.ride_id = r.ride_id
    WHERE r.rider_id = ?
  `;

  const queryParams = [user_id];

  if (search) {
    query += `
      AND (
        r.pickup_location LIKE ?
        OR r.drop_location LIKE ?
        OR p.payment_method LIKE ?
      )
    `;

    const searchPattern = `%${search}%`;
    queryParams.push(searchPattern, searchPattern, searchPattern);
  }

  const [countResult] = await pool.query(
    `SELECT COUNT(*) AS total FROM (${query}) AS subquery`,
    queryParams
  );

  const total = countResult[0].total;

  query += ` ORDER BY p.created_at DESC LIMIT ? OFFSET ?`;

  queryParams.push(parseInt(limit), parseInt(offset));

  const [payments] = await pool.query(query, queryParams);

  return {
    data: payments,
    total,
    page: parseInt(page),
    totalPages: Math.ceil(total / limit),
  };
};

module.exports = {
  createCheckoutSession,
  recordPayment,
  getPaymentHistory,
};
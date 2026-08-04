const stripe = require('../config/stripe');
const { pool } = require('../config/db');

/**
 * Create Stripe Checkout Session (for Stripe Card redirect flow)
 */
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

/**
 * Record Payment in Database and Update Ride Status & Payment Method
 */
const recordPayment = async (ride_id, amount, method, status = 'completed', transaction_id = null) => {
  const txnId = transaction_id || `TXN_${method.toUpperCase()}_${Date.now()}_${Math.floor(1000 + Math.random() * 9000)}`;

  const [result] = await pool.query(
    `INSERT INTO payments (ride_id, amount, payment_method, payment_status, stripe_transaction_id, transaction_id)
     VALUES (?, ?, ?, ?, ?, ?)`,
    [ride_id, amount, method, status, txnId, txnId]
  );

  // Update ride payment_method and set status to completed if pending/accepted/in_progress
  await pool.query(
    `UPDATE rides 
     SET payment_method = ?,
         status = CASE WHEN status IN ('pending', 'accepted', 'in_progress') THEN 'completed' ELSE status END
     WHERE ride_id = ?`,
    [method, ride_id]
  );

  return {
    payment_id: result.insertId,
    transaction_id: txnId,
  };
};

/**
 * Get Paginated Payment History with Search Support
 */
const getPaymentHistory = async (
  user_id,
  page = 1,
  limit = 10,
  search = ''
) => {
  const offset = (page - 1) * limit;

  let query = `
    SELECT
      p.payment_id,
      p.ride_id,
      p.amount,
      p.payment_status,
      p.payment_method,
      COALESCE(p.transaction_id, p.stripe_transaction_id) AS transaction_id,
      p.created_at,
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
        OR p.transaction_id LIKE ?
      )
    `;

    const searchPattern = `%${search}%`;
    queryParams.push(searchPattern, searchPattern, searchPattern, searchPattern);
  }

  const [countResult] = await pool.query(
    `SELECT COUNT(*) AS total FROM (${query}) AS subquery`,
    queryParams
  );

  const total = countResult[0]?.total || 0;

  query += ` ORDER BY p.created_at DESC LIMIT ? OFFSET ?`;
  queryParams.push(parseInt(limit), parseInt(offset));

  const [payments] = await pool.query(query, queryParams);

  return {
    data: payments,
    total,
    page: parseInt(page),
    totalPages: Math.ceil(total / limit) || 1,
  };
};

module.exports = {
  createCheckoutSession,
  recordPayment,
  getPaymentHistory,
};
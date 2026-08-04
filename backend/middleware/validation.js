// Rate limiting store for OTP requests (in-memory per email / IP)
const otpRequestTracker = new Map();

/**
 * Validates email format
 */
const validateEmail = (req, res, next) => {
  const { email } = req.body;
  if (!email || !/\S+@\S+\.\S+/.test(email.trim())) {
    return res.status(400).json({
      success: false,
      message: 'Please provide a valid email address.'
    });
  }
  req.body.email = email.trim().toLowerCase();
  next();
};

/**
 * Rate limiter middleware for OTP generation/resend requests
 * Limits to 3 requests per 15 minutes per email address
 */
const otpRateLimiter = (req, res, next) => {
  const email = (req.body.email || '').toLowerCase();
  if (!email) return next();

  const now = Date.now();
  const windowMs = 15 * 60 * 1000; // 15 minutes
  const maxRequests = 3;

  const record = otpRequestTracker.get(email) || { count: 0, resetTime: now + windowMs };

  if (now > record.resetTime) {
    record.count = 0;
    record.resetTime = now + windowMs;
  }

  if (record.count >= maxRequests) {
    const minutesLeft = Math.ceil((record.resetTime - now) / 60000);
    return res.status(429).json({
      success: false,
      message: `Too many OTP requests. Please try again after ${minutesLeft} minutes.`
    });
  }

  record.count += 1;
  otpRequestTracker.set(email, record);
  next();
};

module.exports = {
  validateEmail,
  otpRateLimiter
};

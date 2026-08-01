/**
 * Global error-handling middleware.
 *
 * Express v5 automatically forwards async errors here, so individual
 * route handlers don't need try-catch wrappers.
 *
 * Response shape:
 *  { success: false, message: string, stack?: string }
 */
// eslint-disable-next-line no-unused-vars
const errorHandler = (err, req, res, next) => {
  // Default to 500 if status code hasn't been set
  const statusCode = res.statusCode === 200 ? 500 : res.statusCode;

  res.status(statusCode).json({
    success: false,
    message: err.message,
    // Include stack trace only in development
    stack: process.env.NODE_ENV === 'production' ? undefined : err.stack,
  });
};

module.exports = errorHandler;

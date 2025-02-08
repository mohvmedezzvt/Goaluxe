/**
 * Centralized error-handling middleware.
 * Logs error details and sends an HTTP error response.
 *
 * @param {Error} err - The error object.
 * @param {Request} req - The Express request object.
 * @param {Response} res - The Express response object.
 * @param {Function} next - The next middleware function.
 */
/* eslint-disable no-unused-vars */
const errorHandler = (err, req, res, next) => {
  // Log the error stack trace for debugging purposes.
  console.error(err.stack);

  // Respond with the error message and appropriate HTTP status code.
  res.status(err.status || 500).json({
    error: {
      message: err.message || 'Internal Server Error',
    },
  });
};

export default errorHandler;

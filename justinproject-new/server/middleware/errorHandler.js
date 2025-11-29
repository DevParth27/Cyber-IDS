import { logger } from '../utils/logger.js';

/**
 * Global error handling middleware
 * @param {Error} err - Error object
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 * @returns {void}
 */
export const errorHandler = (err, req, res, next) => {
  // Log the error
  logger.error(err.message, {
    stack: err.stack,
    path: req.path,
    method: req.method,
    ip: req.ip
  });
  
  // Determine status code
  const statusCode = err.statusCode || 500;
  
  // Send generic error message in production
  const message = process.env.NODE_ENV === 'production' 
    ? 'An unexpected error occurred. Please try again later.'
    : err.message || 'Something went wrong';
  
  // Return error response
  res.status(statusCode).json({
    success: false,
    message,
    // Only include stack trace in development
    ...(process.env.NODE_ENV !== 'production' && { stack: err.stack })
  });
};

/**
 * 404 Not Found handler
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @returns {void}
 */
export const notFoundHandler = (req, res) => {
  res.status(404).json({
    success: false,
    message: 'Resource not found'
  });
};

export default {
  errorHandler,
  notFoundHandler
};
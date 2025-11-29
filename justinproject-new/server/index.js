import 'dotenv/config';
import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { rateLimit } from 'express-rate-limit';
import { errorHandler, notFoundHandler } from './middleware/errorHandler.js';
import { securityHeaders } from './middleware/securityMiddleware.js';
import { authRoutes } from './routes/authRoutes.js';
import { idsRoutes } from './routes/idsRoutes.js';
import { twoFactorRoutes } from './routes/twoFactorRoutes.js';
import { logger } from './utils/logger.js';

// Initialize Express app
const app = express();
const PORT = process.env.PORT || 3001;

// Security middleware
app.use(helmet()); // Set security headers
app.use(securityHeaders); // Custom security headers
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true
}));

// Rate limiting middleware to prevent brute force attacks
const apiLimiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, // 15 minutes
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100, // Limit each IP to 100 requests per window
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  message: {
    status: 429,
    message: 'Too many requests, please try again later.'
  },
  handler: (req, res, next, options) => {
    logger.warn(`Rate limit exceeded for IP: ${req.ip}`);
    res.status(options.statusCode).json(options.message);
  }
});

// Apply rate limiting to all routes
app.use(apiLimiter);

// Parse cookies
app.use(cookieParser());

// Parse JSON request body
app.use(express.json({ limit: '10kb' })); // Limit payload size to prevent abuse

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/ids', idsRoutes);
app.use('/api/2fa', twoFactorRoutes);

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok' });
});

// Error handling middleware
app.use(notFoundHandler);
app.use(errorHandler);

// Start the server
app.listen(PORT, () => {
  logger.info(`Server running on port ${PORT}`);
});

export default app;
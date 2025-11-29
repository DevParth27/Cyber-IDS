import winston from 'winston';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Get directory name
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Create logs directory if it doesn't exist
const logsDir = path.join(__dirname, '../../logs');
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}

// Define log format
const logFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.errors({ stack: true }),
  winston.format.splat(),
  winston.format.json()
);

// Create logger instance
export const logger = winston.createLogger({
  level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
  format: logFormat,
  defaultMeta: { service: 'auth-service' },
  transports: [
    // Write all logs with level 'error' and below to error.log
    new winston.transports.File({ 
      filename: path.join(logsDir, 'error.log'), 
      level: 'error',
      maxsize: 5242880, // 5MB
      maxFiles: 5,
    }),
    // Write all logs with level 'info' and below to combined.log
    new winston.transports.File({ 
      filename: path.join(logsDir, 'combined.log'),
      maxsize: 5242880, // 5MB
      maxFiles: 5,
    }),
    // Write security-specific logs to security.log
    new winston.transports.File({ 
      filename: path.join(logsDir, 'security.log'),
      level: 'info',
      maxsize: 5242880, // 5MB
      maxFiles: 10,
    }),
  ],
});

// Add console transport for non-production environments
if (process.env.NODE_ENV !== 'production') {
  logger.add(new winston.transports.Console({
    format: winston.format.combine(
      winston.format.colorize(),
      winston.format.simple()
    ),
  }));
}

// Security logging specific function
export const securityLogger = {
  info: (message, meta = {}) => {
    logger.info(message, { ...meta, securityEvent: true });
  },
  warn: (message, meta = {}) => {
    logger.warn(message, { ...meta, securityEvent: true });
  },
  error: (message, meta = {}) => {
    logger.error(message, { ...meta, securityEvent: true });
  },
  critical: (message, meta = {}) => {
    logger.error(message, { ...meta, securityEvent: true, level: 'critical' });
  },
  // Log a security event to both logger and database
  async logSecurityEvent(prisma, eventData) {
    const { level, event, ipAddress, userId, userEmail, description, metadata } = eventData;
    
    // Log to winston
    this[level](description, { 
      event, 
      ipAddress, 
      userId, 
      userEmail, 
      metadata 
    });
    
    // Log to database if prisma instance is provided
    if (prisma) {
      try {
        await prisma.securityLog.create({
          data: {
            level,
            event,
            ipAddress,
            userId,
            userEmail,
            description,
            metadata: metadata ? JSON.stringify(metadata) : null
          }
        });
      } catch (error) {
        logger.error('Failed to write security log to database', { error });
      }
    }
  }
};

export default logger;
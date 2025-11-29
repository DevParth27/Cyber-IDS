import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';
import { securityLogger } from '../utils/logger.js';

const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || 'default-secret-change-this-in-production';

/**
 * Middleware to verify JWT token and attach user to request
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 * @returns {Promise<void>}
 */
export const authenticate = async (req, res, next) => {
  try {
    let token;
    
    // Get token from Authorization header or cookie
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      // Get token from header
      token = req.headers.authorization.split(' ')[1];
    } else if (req.cookies && req.cookies.token) {
      // Get token from cookie
      token = req.cookies.token;
    }
    
    // Check if token exists
    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Not authenticated. Please log in.'
      });
    }
    
    // Verify token
    const decoded = jwt.verify(token, JWT_SECRET);
    
    // Get user from database
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId }
    });
    
    // Check if user exists
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'User no longer exists.'
      });
    }
    
    // Check if account is locked
    if (user.accountLocked) {
      const now = new Date();
      
      if (user.lockUntil && user.lockUntil > now) {
        // Account is still locked
        return res.status(403).json({
          success: false,
          message: 'Account is temporarily locked. Please try again later.'
        });
      } else {
        // Lock duration has passed, unlock the account
        await prisma.user.update({
          where: { id: user.id },
          data: {
            accountLocked: false,
            lockUntil: null,
            failedLoginAttempts: 0
          }
        });
      }
    }
    
    // Attach user to request
    req.user = {
      id: user.id,
      email: user.email
    };
    
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Token expired. Please log in again.'
      });
    }
    
    if (error.name === 'JsonWebTokenError') {
      // Log potential token tampering
      await securityLogger.logSecurityEvent(prisma, {
        level: 'warn',
        event: 'invalid_token',
        ipAddress: req.ip || req.headers['x-forwarded-for'] || 'unknown',
        description: 'Invalid token provided',
        metadata: JSON.stringify({
          error: error.message,
          token: token ? `${token.substring(0, 10)}...` : null
        })
      });
      
      return res.status(401).json({
        success: false,
        message: 'Invalid token. Please log in again.'
      });
    }
    
    return res.status(500).json({
      success: false,
      message: 'Authentication error. Please try again.'
    });
  }
};

const authMiddleware = {
  authenticate
};

export { authMiddleware };
export default authMiddleware;
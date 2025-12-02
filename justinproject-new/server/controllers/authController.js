import { authService } from '../services/authService.js';
import { securityUtils } from '../utils/securityUtils.js';
import { logger, securityLogger } from '../utils/logger.js';
import twoFactorService from '../services/twoFactorService.js';
import idsService from '../services/idsService.js';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * Handle user registration
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @returns {Promise<void>}
 */
export const register = async (req, res) => {
  try {
    // Sanitize inputs
    const sanitizedData = securityUtils.sanitizeObject(req.body);
    
    // Check for SQL injection patterns
    const detectionResult = securityUtils.detectSqlInjection(req.body);
    if (detectionResult.detected) {
      await securityUtils.handleSqlInjectionAttempt(req, detectionResult);
      return res.status(400).json({ 
        success: false, 
        message: 'Invalid input detected.' 
      });
    }
    
    // Register user
    const newUser = await authService.registerUser(sanitizedData);
    
    // Return success response
    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      data: {
        id: newUser.id,
        email: newUser.email
      }
    });
  } catch (error) {
    logger.error('Registration error', { error: error.message, stack: error.stack });
    
    // Return generic error to client
    res.status(400).json({
      success: false,
      message: error.message === 'User with this email already exists' 
        ? 'User with this email already exists' 
        : 'Registration failed. Please check your information and try again.'
    });
  }
};

/**
 * Handle user login
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @returns {Promise<void>}
 */
export const login = async (req, res) => {
  try {
    // Get IP address
    const ipAddress = req.ip || req.headers['x-forwarded-for'] || 'unknown';
    
    // Sanitize inputs
    const sanitizedData = securityUtils.sanitizeObject(req.body);
    
    // Check for SQL injection patterns
    const detectionResult = securityUtils.detectSqlInjection(req.body);
    if (detectionResult.detected) {
      await securityUtils.handleSqlInjectionAttempt(req, detectionResult);
      
      // Create IDS alert for SQL injection attempt on login
      try {
        await idsService.createAlert({
          severity: 'critical',
          alertType: 'sql_injection',
          title: 'SQL Injection Attempt on Login Endpoint',
          description: `SQL injection attempt detected on login endpoint from IP ${ipAddress}. Payload: ${detectionResult.value?.substring(0, 100) || 'N/A'}`,
          ipAddress,
          metadata: {
            endpoint: '/api/auth/login',
            method: 'POST',
            field: detectionResult.field,
            pattern: detectionResult.pattern,
            payload: detectionResult.value,
            userAgent: req.headers['user-agent']
          }
        });
      } catch (alertError) {
        logger.error('Failed to create IDS alert for SQL injection', {
          error: alertError.message,
          stack: alertError.stack
        });
      }
      
      return res.status(400).json({ 
        success: false, 
        message: 'Invalid input detected.' 
      });
    }
    
    // Authenticate user (first factor)
    const authResult = await authService.loginUser(sanitizedData, ipAddress);
    
    // Check if 2FA is enabled for this user
    const is2FAEnabled = await twoFactorService.is2FAEnabled(authResult.user.id);
    
    // If 2FA is enabled, require 2FA token
    if (is2FAEnabled) {
      const { twoFactorToken } = sanitizedData;
      
      if (!twoFactorToken) {
        // Return response indicating 2FA is required
        return res.status(200).json({
          success: false,
          requires2FA: true,
          message: 'Two-factor authentication required',
          data: {
            userId: authResult.user.id
          }
        });
      }
      
      // Verify 2FA token
      const isValidToken = await twoFactorService.verifyToken(authResult.user.id, twoFactorToken);
      
      if (!isValidToken) {
        return res.status(401).json({
          success: false,
          message: 'Invalid two-factor authentication code.'
        });
      }
    }
    
    // Set JWT as HTTP-only cookie
    res.cookie('token', authResult.token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 3600000, // 1 hour
      sameSite: 'strict'
    });
    
    // Return success response
    res.status(200).json({
      success: true,
      message: 'Login successful',
      data: {
        user: authResult.user,
        token: authResult.token
      }
    });
  } catch (error) {
    logger.error('Login error', { error: error.message });
    
    // Return generic error to client
    res.status(401).json({
      success: false,
      message: 'Invalid email or password.'
    });
  }
};

/**
 * Handle user logout
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @returns {void}
 */
export const logout = (req, res) => {
  // Clear the JWT cookie
  res.clearCookie('token');
  
  // Return success response
  res.status(200).json({
    success: true,
    message: 'Logout successful'
  });
};

/**
 * Get current user profile
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @returns {Promise<void>}
 */
export const getProfile = async (req, res) => {
  try {
    // User should be attached to request by authentication middleware
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized'
      });
    }
    
    // Return user data
    res.status(200).json({
      success: true,
      data: {
        user: req.user
      }
    });
  } catch (error) {
    logger.error('Get profile error', { error: error.message });
    
    // Return generic error to client
    res.status(500).json({
      success: false,
      message: 'An error occurred while fetching your profile.'
    });
  }
};

/**
 * Handle admin login
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @returns {Promise<void>}
 */
export const adminLogin = async (req, res) => {
  try {
    // Get IP address
    const ipAddress = req.ip || req.headers['x-forwarded-for'] || 'unknown';
    
    // Sanitize inputs
    const sanitizedData = securityUtils.sanitizeObject(req.body);
    
    // Check for SQL injection patterns
    const detectionResult = securityUtils.detectSqlInjection(req.body);
    if (detectionResult.detected) {
      await securityUtils.handleSqlInjectionAttempt(req, detectionResult);
      
      // Create IDS alert for SQL injection attempt on admin login
      try {
        await idsService.createAlert({
          severity: 'critical',
          alertType: 'sql_injection',
          title: 'SQL Injection Attempt on Admin Login Endpoint',
          description: `SQL injection attempt detected on admin login endpoint from IP ${ipAddress}. Payload: ${detectionResult.value?.substring(0, 100) || 'N/A'}`,
          ipAddress,
          metadata: {
            endpoint: '/api/auth/admin/login',
            method: 'POST',
            field: detectionResult.field,
            pattern: detectionResult.pattern,
            payload: detectionResult.value,
            userAgent: req.headers['user-agent']
          }
        });
      } catch (alertError) {
        logger.error('Failed to create IDS alert for SQL injection on admin login', {
          error: alertError.message,
          stack: alertError.stack
        });
      }
      
      return res.status(400).json({ 
        success: false, 
        message: 'Invalid input detected.' 
      });
    }
    
    const { username, password } = sanitizedData;
    
    // Hardcoded admin credentials (in production, use environment variables or database)
    const ADMIN_USERNAME = process.env.ADMIN_USERNAME || 'admin';
    const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'admin@123';
    
    // Check credentials
    if (username === ADMIN_USERNAME && password === ADMIN_PASSWORD) {
      // Log successful admin login
      await securityLogger.logSecurityEvent(prisma, {
        level: 'info',
        event: 'admin_login_success',
        ipAddress,
        description: `Successful admin login from IP ${ipAddress}`
      });
      
      return res.status(200).json({
        success: true,
        message: 'Admin login successful',
        data: {
          authenticated: true
        }
      });
    } else {
      // Log failed admin login attempt
      await securityLogger.logSecurityEvent(prisma, {
        level: 'warn',
        event: 'admin_login_failure',
        ipAddress,
        description: `Failed admin login attempt from IP ${ipAddress}`
      });
      
      // Check for multiple failed admin login attempts
      const oneHourAgo = new Date();
      oneHourAgo.setHours(oneHourAgo.getHours() - 1);
      const recentFailures = await prisma.securityLog.count({
        where: {
          ipAddress,
          event: 'admin_login_failure',
          timestamp: { gte: oneHourAgo }
        }
      });
      
      // Create IDS alert for multiple failed admin login attempts
      if (recentFailures >= 3) {
        try {
          await idsService.createAlert({
            severity: recentFailures >= 10 ? 'critical' : 'high',
            alertType: 'brute_force',
            title: `Multiple Failed Admin Login Attempts from IP ${ipAddress}`,
            description: `${recentFailures + 1} failed admin login attempts detected from IP ${ipAddress} in the last hour`,
            ipAddress,
            metadata: {
              failedAttempts: recentFailures + 1,
              timeframe: '1 hour',
              endpoint: '/api/auth/admin/login'
            }
          });
        } catch (alertError) {
          logger.error('Failed to create IDS alert for failed admin login', {
            error: alertError.message
          });
        }
      }
      
      return res.status(401).json({
        success: false,
        message: 'Invalid admin credentials.'
      });
    }
  } catch (error) {
    logger.error('Admin login error', { error: error.message });
    
    return res.status(500).json({
      success: false,
      message: 'An error occurred during admin login.'
    });
  }
};

const authController = {
  register,
  login,
  logout,
  getProfile,
  adminLogin
};

export { authController };
export default authController;
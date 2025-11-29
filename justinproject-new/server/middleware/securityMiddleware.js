import { securityUtils } from '../utils/securityUtils.js';
import { securityLogger } from '../utils/logger.js';
import honeypotService from '../services/honeypotService.js';
import idsService from '../services/idsService.js';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * Middleware to detect and prevent SQL injection attempts
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 * @returns {Promise<void>}
 */
export const sqlInjectionProtection = async (req, res, next) => {
  try {
    // Skip for GET requests as they typically don't modify data
    if (req.method === 'GET') {
      return next();
    }
    
    // Check request body for SQL injection patterns
    if (req.body) {
      const bodyDetectionResult = securityUtils.detectSqlInjection(req.body);
      if (bodyDetectionResult.detected) {
        // Redirect to honeypot instead of blocking
        return await redirectToHoneypot(req, res, bodyDetectionResult);
      }
    }
    
    // Check URL query parameters for SQL injection patterns
    if (req.query) {
      const queryDetectionResult = securityUtils.detectSqlInjection(req.query);
      if (queryDetectionResult.detected) {
        // Redirect to honeypot instead of blocking
        return await redirectToHoneypot(req, res, queryDetectionResult);
      }
    }
    
    // Check URL parameters for SQL injection patterns
    if (req.params) {
      const paramsDetectionResult = securityUtils.detectSqlInjection(req.params);
      if (paramsDetectionResult.detected) {
        // Redirect to honeypot instead of blocking
        return await redirectToHoneypot(req, res, paramsDetectionResult);
      }
    }
    
    next();
  } catch (error) {
    // Log the error
    securityLogger.error('Error in SQL injection protection middleware', {
      error: error.message,
      stack: error.stack,
      ipAddress: req.ip || req.headers['x-forwarded-for'] || 'unknown',
      endpoint: req.originalUrl || req.url || 'unknown',
      method: req.method || 'unknown'
    });
    
    // Continue to next middleware
    next();
  }
};

/**
 * Middleware to set additional security headers
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 * @returns {void}
 */
export const securityHeaders = (req, res, next) => {
  // Content Security Policy
  res.setHeader(
    'Content-Security-Policy',
    "default-src 'self'; script-src 'self'; style-src 'self'; img-src 'self' data:; font-src 'self'; connect-src 'self'"
  );
  
  // X-Content-Type-Options
  res.setHeader('X-Content-Type-Options', 'nosniff');
  
  // X-Frame-Options
  res.setHeader('X-Frame-Options', 'DENY');
  
  // X-XSS-Protection
  res.setHeader('X-XSS-Protection', '1; mode=block');
  
  // Referrer-Policy
  res.setHeader('Referrer-Policy', 'same-origin');
  
  // Feature-Policy
  res.setHeader(
    'Permissions-Policy',
    'geolocation=(), microphone=(), camera=()'
  );
  
  next();
};

/**
 * Middleware to sanitize request inputs
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 * @returns {void}
 */
export const sanitizeInputs = (req, res, next) => {
  // Sanitize request body
  if (req.body) {
    req.body = securityUtils.sanitizeObject(req.body);
  }
  
  // Sanitize query parameters
  if (req.query) {
    req.query = securityUtils.sanitizeObject(req.query);
  }
  
  // Sanitize URL parameters
  if (req.params) {
    req.params = securityUtils.sanitizeObject(req.params);
  }
  
  next();
};

/**
 * Redirect SQL injection attempts to honeypot database
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Object} detectionResult - SQL injection detection result
 * @returns {Promise<void>}
 */
const redirectToHoneypot = async (req, res, detectionResult) => {
  // Log the original attempt
  await securityUtils.handleSqlInjectionAttempt(req, detectionResult);
  
  // Simulate fake database query based on the payload
  const fakeResponse = honeypotService.simulateFakeQuery(
    detectionResult.value || JSON.stringify(req.body)
  );
  
  // Log honeypot interaction and create IDS alert
  await honeypotService.logHoneypotInteraction(req, detectionResult, fakeResponse);
  
  // Create IDS alert for blue hat team
  await idsService.createAlert({
    severity: 'critical',
    alertType: 'sql_injection',
    title: `SQL Injection Attack - Honeypot Activated`,
    description: `Attacker from IP ${req.ip || 'unknown'} attempted SQL injection. Redirected to honeypot.`,
    ipAddress: req.ip || req.headers['x-forwarded-for'] || 'unknown',
    metadata: {
      payload: detectionResult.value,
      endpoint: req.originalUrl || req.url,
      method: req.method,
      userAgent: req.headers['user-agent']
    }
  });
  
  // Return fake database response to attacker
  // This makes them think they successfully bypassed security
  return res.status(200).json({
    success: true,
    message: 'Query executed successfully',
    ...fakeResponse
  });
};

const securityMiddleware = {
  sqlInjectionProtection,
  securityHeaders,
  sanitizeInputs
};

export { securityMiddleware };
export default securityMiddleware;
import { securityLogger } from './logger.js';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Common SQL injection patterns to detect
const SQL_INJECTION_PATTERNS = [
  /(\%27)|(\')|(\-\-)|(\%23)|(#)/i,
  /((\%3D)|(=))[^\n]*((\%27)|(\')|(\-\-)|(\%3B)|(;))/i,
  /\w*((\%27)|(\'))((\%6F)|o|(\%4F))((\%72)|r|(\%52))/i,
  /((\%27)|(\'))union/i,
  /exec(\s|\+)+(s|x)p\w+/i,
  /UNION(\s+)ALL(\s+)SELECT/i,
  /INSERT|UPDATE|DELETE|DROP|ALTER|TRUNCATE/i,
  /SELECT.*FROM/i,
  /SLEEP\(\d+\)/i,
  /BENCHMARK\(\d+,.*\)/i,
  /WAITFOR DELAY/i
];

/**
 * Detects potential SQL injection patterns in user input
 * @param {Object} input - Object containing user inputs to check
 * @returns {Object} - Object with detection result and details
 */
export const detectSqlInjection = (input) => {
  const detectionResult = {
    detected: false,
    field: null,
    pattern: null,
    value: null
  };

  // Skip checking if input is null or undefined
  if (!input) return detectionResult;

  // Check each field in the input object
  Object.entries(input).forEach(([field, value]) => {
    // Only check string values
    if (typeof value !== 'string') return;
    
    // Check against known SQL injection patterns
    for (const pattern of SQL_INJECTION_PATTERNS) {
      if (pattern.test(value)) {
        detectionResult.detected = true;
        detectionResult.field = field;
        detectionResult.pattern = pattern.toString();
        detectionResult.value = value;
        break;
      }
    }
    
    // Stop checking if detection found
    if (detectionResult.detected) return;
  });

  return detectionResult;
};

/**
 * Logs and handles potential SQL injection attempts
 * @param {Object} req - Express request object
 * @param {Object} detectionResult - Result from detectSqlInjection
 * @returns {Promise<void>}
 */
export const handleSqlInjectionAttempt = async (req, detectionResult) => {
  if (!detectionResult.detected) return;
  
  const ipAddress = req.ip || req.headers['x-forwarded-for'] || 'unknown';
  const userAgent = req.headers['user-agent'] || 'unknown';
  const endpoint = req.originalUrl || req.url || 'unknown';
  const method = req.method || 'unknown';
  
  // Log the SQL injection attempt
  await securityLogger.logSecurityEvent(prisma, {
    level: 'critical',
    event: 'sql_injection_attempt',
    ipAddress,
    userId: req.user?.id,
    userEmail: req.user?.email,
    description: `Potential SQL injection attempt detected from IP ${ipAddress}`,
    metadata: JSON.stringify({
      field: detectionResult.field,
      pattern: detectionResult.pattern,
      value: detectionResult.value,
      userAgent,
      endpoint,
      method,
      headers: JSON.stringify(req.headers)
    })
  });
  
  // In a production system, you might want to:
  // 1. Implement temporary IP blocking
  // 2. Flag the account for review
  // 3. Send alerts to security team
};

/**
 * Sanitizes strings to prevent XSS and other injection attacks
 * This is a basic implementation - in production you might use a library like DOMPurify
 * @param {string} str - String to sanitize
 * @returns {string} - Sanitized string
 */
export const sanitizeString = (str) => {
  if (typeof str !== 'string') return str;
  
  return str
    .replace(/[&<>"']/g, (match) => {
      const replacements = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#x27;'
      };
      return replacements[match];
    })
    .trim();
};

/**
 * Sanitizes an object's string properties to prevent injection attacks
 * @param {Object} obj - Object to sanitize
 * @returns {Object} - Sanitized object
 */
export const sanitizeObject = (obj) => {
  if (!obj || typeof obj !== 'object') return obj;
  
  const sanitized = {};
  
  Object.entries(obj).forEach(([key, value]) => {
    if (typeof value === 'string') {
      sanitized[key] = sanitizeString(value);
    } else if (typeof value === 'object' && value !== null) {
      sanitized[key] = sanitizeObject(value);
    } else {
      sanitized[key] = value;
    }
  });
  
  return sanitized;
};

const securityUtils = {
  detectSqlInjection,
  handleSqlInjectionAttempt,
  sanitizeString,
  sanitizeObject
};

export { securityUtils };
export default securityUtils;
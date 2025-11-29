import { PrismaClient } from '@prisma/client';
import { securityLogger } from '../utils/logger.js';

const prisma = new PrismaClient();

// Fake database with honeytrap data
const HONEYPOT_DATABASE = {
  users: [
    { id: 1, username: 'admin', password: 'admin123', email: 'admin@company.com', role: 'Administrator', salary: 150000, ssn: '123-45-6789' },
    { id: 2, username: 'ceo', password: 'ceo2024', email: 'ceo@company.com', role: 'CEO', salary: 500000, ssn: '987-65-4321' },
    { id: 3, username: 'finance', password: 'finance2024', email: 'finance@company.com', role: 'CFO', salary: 300000, ssn: '555-12-3456' },
    { id: 4, username: 'hr', password: 'hr2024', email: 'hr@company.com', role: 'HR Director', salary: 120000, ssn: '444-33-2222' },
    { id: 5, username: 'it', password: 'it2024', email: 'it@company.com', role: 'IT Director', salary: 140000, ssn: '777-88-9999' },
  ],
  employees: [
    { id: 1, firstName: 'John', lastName: 'Doe', email: 'john.doe@company.com', department: 'Engineering', salary: 95000, phone: '555-0101', address: '123 Main St' },
    { id: 2, firstName: 'Jane', lastName: 'Smith', email: 'jane.smith@company.com', department: 'Marketing', salary: 85000, phone: '555-0102', address: '456 Oak Ave' },
    { id: 3, firstName: 'Bob', lastName: 'Johnson', email: 'bob.johnson@company.com', department: 'Sales', salary: 75000, phone: '555-0103', address: '789 Pine Rd' },
  ],
  financial: [
    { id: 1, account: 'ACCT-001', balance: 5000000, accountType: 'Operating', bank: 'First National Bank' },
    { id: 2, account: 'ACCT-002', balance: 2500000, accountType: 'Payroll', bank: 'Chase Bank' },
    { id: 3, account: 'ACCT-003', balance: 1000000, accountType: 'Emergency', bank: 'Wells Fargo' },
  ],
  secrets: [
    { id: 1, key: 'API_SECRET_KEY', value: 'FAKE-API-KEY-12345-DO-NOT-USE', description: 'Main API Secret' },
    { id: 2, key: 'DATABASE_PASSWORD', value: 'FAKE-DB-PASSWORD-67890', description: 'Database Credentials' },
    { id: 3, key: 'ENCRYPTION_KEY', value: 'FAKE-ENCRYPTION-KEY-ABCDE', description: 'Data Encryption Key' },
  ]
};

/**
 * Simulates a fake database query based on SQL injection payload
 * @param {string} payload - The SQL injection payload
 * @returns {Object} - Fake query results
 */
export const simulateFakeQuery = (payload) => {
  const payloadLower = payload.toLowerCase();
  
  // Detect what the attacker is trying to query
  if (payloadLower.includes('select') && payloadLower.includes('users')) {
    return {
      success: true,
      message: 'Query executed successfully',
      data: HONEYPOT_DATABASE.users,
      rowCount: HONEYPOT_DATABASE.users.length
    };
  }
  
  if (payloadLower.includes('select') && payloadLower.includes('employee')) {
    return {
      success: true,
      message: 'Query executed successfully',
      data: HONEYPOT_DATABASE.employees,
      rowCount: HONEYPOT_DATABASE.employees.length
    };
  }
  
  if (payloadLower.includes('select') && payloadLower.includes('financial') || payloadLower.includes('account')) {
    return {
      success: true,
      message: 'Query executed successfully',
      data: HONEYPOT_DATABASE.financial,
      rowCount: HONEYPOT_DATABASE.financial.length
    };
  }
  
  if (payloadLower.includes('select') && payloadLower.includes('secret') || payloadLower.includes('key')) {
    return {
      success: true,
      message: 'Query executed successfully',
      data: HONEYPOT_DATABASE.secrets,
      rowCount: HONEYPOT_DATABASE.secrets.length
    };
  }
  
  // Default: return all users (most common attack)
  return {
    success: true,
    message: 'Query executed successfully',
    data: HONEYPOT_DATABASE.users,
    rowCount: HONEYPOT_DATABASE.users.length
  };
};

/**
 * Logs honeypot interaction and creates IDS alert
 * @param {Object} req - Express request object
 * @param {Object} detectionResult - SQL injection detection result
 * @param {Object} fakeResponse - The fake data returned
 * @returns {Promise<void>}
 */
export const logHoneypotInteraction = async (req, detectionResult, fakeResponse) => {
  const ipAddress = req.ip || req.headers['x-forwarded-for'] || 'unknown';
  const userAgent = req.headers['user-agent'] || 'unknown';
  const endpoint = req.originalUrl || req.url || 'unknown';
  const method = req.method || 'unknown';
  
  // Log honeypot interaction
  const interaction = await prisma.honeypotInteraction.create({
    data: {
      ipAddress,
      userAgent,
      attackType: 'sql_injection',
      payload: detectionResult.value || JSON.stringify(req.body),
      endpoint,
      method,
      response: JSON.stringify(fakeResponse),
      metadata: JSON.stringify({
        field: detectionResult.field,
        pattern: detectionResult.pattern,
        headers: req.headers
      })
    }
  });
  
  // Create IDS alert for blue hat team
  await prisma.iDSAlert.create({
    data: {
      severity: 'critical',
      alertType: 'sql_injection',
      title: `SQL Injection Attack Detected - Honeypot Activated`,
      description: `Attacker from IP ${ipAddress} attempted SQL injection. Redirected to honeypot database. Payload: ${detectionResult.value?.substring(0, 100)}`,
      ipAddress,
      metadata: JSON.stringify({
        interactionId: interaction.id,
        payload: detectionResult.value,
        endpoint,
        method,
        userAgent
      })
    }
  });
  
  // Log to security log
  await securityLogger.logSecurityEvent(prisma, {
    level: 'critical',
    event: 'honeypot_activated',
    ipAddress,
    description: `Honeypot activated for SQL injection attempt from IP ${ipAddress}`,
    metadata: JSON.stringify({
      interactionId: interaction.id,
      payload: detectionResult.value,
      fakeDataReturned: true
    })
  });
};

/**
 * Get all honeypot interactions (for IDS dashboard)
 * @param {Object} options - Query options
 * @returns {Promise<Array>}
 */
export const getHoneypotInteractions = async (options = {}) => {
  const { limit = 100, offset = 0, ipAddress } = options;
  
  const where = {};
  if (ipAddress) {
    where.ipAddress = ipAddress;
  }
  
  return await prisma.honeypotInteraction.findMany({
    where,
    orderBy: { timestamp: 'desc' },
    take: limit,
    skip: offset
  });
};

export default {
  simulateFakeQuery,
  logHoneypotInteraction,
  getHoneypotInteractions
};



import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';
import { securityLogger } from '../utils/logger.js';
import idsService from './idsService.js';

const prisma = new PrismaClient();

// Get environment variables with defaults
const JWT_SECRET = process.env.JWT_SECRET || 'default-secret-change-this-in-production';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '1h';
const SALT_ROUNDS = parseInt(process.env.PASSWORD_SALT_ROUNDS) || 12;
const LOCKOUT_THRESHOLD = parseInt(process.env.ACCOUNT_LOCKOUT_THRESHOLD) || 5;
const LOCKOUT_DURATION = parseInt(process.env.ACCOUNT_LOCKOUT_DURATION_MINUTES) || 15;

/**
 * Register a new user
 * @param {Object} userData - User registration data
 * @returns {Promise<Object>} - Newly created user (without password)
 */
export const registerUser = async (userData) => {
  const { email, password } = userData;
  
  // Check if user already exists
  const existingUser = await prisma.user.findUnique({
    where: { email }
  });
  
  if (existingUser) {
    throw new Error('User with this email already exists');
  }
  
  // Hash the password
  const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);
  
  // Create the user
  const newUser = await prisma.user.create({
    data: {
      email,
      passwordHash
    }
  });
  
  // Log the registration
  await securityLogger.logSecurityEvent(prisma, {
    level: 'info',
    event: 'user_registered',
    userId: newUser.id,
    userEmail: newUser.email,
    description: `New user registered: ${newUser.email}`
  });
  
  // Return user without sensitive data
  const { passwordHash: _, ...userWithoutPassword } = newUser;
  return userWithoutPassword;
};

/**
 * Authenticate a user and generate JWT token
 * @param {Object} credentials - User login credentials
 * @param {string} ipAddress - IP address of the request
 * @returns {Promise<Object>} - Authentication result with token
 */
export const loginUser = async (credentials, ipAddress) => {
  const { email, password } = credentials;
  
  // Find the user
  const user = await prisma.user.findUnique({
    where: { email }
  });
  
  // Check if user exists
  if (!user) {
    // Log failed login attempt
    await securityLogger.logSecurityEvent(prisma, {
      level: 'warn',
      event: 'login_failure',
      ipAddress,
      userEmail: email,
      description: `Failed login attempt for non-existent user: ${email}`
    });
    
    // Check for multiple failed login attempts from same IP
    const oneHourAgo = new Date();
    oneHourAgo.setHours(oneHourAgo.getHours() - 1);
    const recentFailures = await prisma.securityLog.count({
      where: {
        ipAddress,
        event: 'login_failure',
        timestamp: { gte: oneHourAgo }
      }
    });
    
    // Create IDS alert if multiple failed attempts from same IP
    if (recentFailures >= 3) {
      try {
        await idsService.createAlert({
          severity: recentFailures >= 10 ? 'high' : 'medium',
          alertType: 'brute_force',
          title: `Multiple Failed Login Attempts from IP ${ipAddress}`,
          description: `${recentFailures + 1} failed login attempts detected from IP ${ipAddress} in the last hour. Latest attempt for non-existent user: ${email}`,
          ipAddress,
          metadata: {
            failedAttempts: recentFailures + 1,
            latestEmail: email,
            timeframe: '1 hour'
          }
        });
      } catch (alertError) {
        securityLogger.error('Failed to create IDS alert for brute force', {
          error: alertError.message
        });
      }
    }
    
    // Use same error message to prevent user enumeration
    throw new Error('Invalid email or password');
  }
  
  // Check if account is locked
  if (user.accountLocked) {
    const now = new Date();
    
    if (user.lockUntil && user.lockUntil > now) {
      // Account is still locked
      await securityLogger.logSecurityEvent(prisma, {
        level: 'warn',
        event: 'login_attempt_locked_account',
        ipAddress,
        userId: user.id,
        userEmail: user.email,
        description: `Login attempt on locked account: ${user.email}`
      });
      
      // Create IDS alert for attempt on locked account
      try {
        await idsService.createAlert({
          severity: 'medium',
          alertType: 'suspicious_activity',
          title: `Login Attempt on Locked Account`,
          description: `Login attempt detected on locked account ${user.email} from IP ${ipAddress}. Account locked until ${user.lockUntil.toISOString()}`,
          ipAddress,
          userId: user.id,
          metadata: {
            userEmail: user.email,
            lockUntil: user.lockUntil.toISOString(),
            accountLocked: true
          }
        });
      } catch (alertError) {
        securityLogger.error('Failed to create IDS alert for locked account attempt', {
          error: alertError.message
        });
      }
      
      throw new Error('Account is temporarily locked. Please try again later.');
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
  
  // Verify password
  const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
  
  if (!isPasswordValid) {
    // Increment failed login attempts
    const failedAttempts = user.failedLoginAttempts + 1;
    const updateData = {
      failedLoginAttempts: failedAttempts,
      lastFailedLogin: new Date()
    };
    
    // Lock account if threshold reached
    if (failedAttempts >= LOCKOUT_THRESHOLD) {
      const lockUntil = new Date();
      lockUntil.setMinutes(lockUntil.getMinutes() + LOCKOUT_DURATION);
      
      updateData.accountLocked = true;
      updateData.lockUntil = lockUntil;
      
      await securityLogger.logSecurityEvent(prisma, {
        level: 'warn',
        event: 'account_locked',
        ipAddress,
        userId: user.id,
        userEmail: user.email,
        description: `Account locked after ${failedAttempts} failed login attempts: ${user.email}`
      });
      
      // Create IDS alert for account lockout
      try {
        await idsService.createAlert({
          severity: 'high',
          alertType: 'brute_force',
          title: `Account Locked - Brute Force Attempt Detected`,
          description: `Account ${user.email} has been locked after ${failedAttempts} consecutive failed login attempts from IP ${ipAddress}`,
          ipAddress,
          userId: user.id,
          metadata: {
            userEmail: user.email,
            failedAttempts,
            lockoutDuration: LOCKOUT_DURATION,
            lockUntil: lockUntil.toISOString()
          }
        });
      } catch (alertError) {
        securityLogger.error('Failed to create IDS alert for account lockout', {
          error: alertError.message
        });
      }
    } else if (failedAttempts >= 3) {
      // Create medium severity alert for suspicious activity
      try {
        await idsService.createAlert({
          severity: 'medium',
          alertType: 'suspicious_activity',
          title: `Multiple Failed Login Attempts - ${user.email}`,
          description: `${failedAttempts} failed login attempts detected for account ${user.email} from IP ${ipAddress}`,
          ipAddress,
          userId: user.id,
          metadata: {
            userEmail: user.email,
            failedAttempts,
            threshold: LOCKOUT_THRESHOLD
          }
        });
      } catch (alertError) {
        securityLogger.error('Failed to create IDS alert for suspicious activity', {
          error: alertError.message
        });
      }
    }
    
    // Update user record
    await prisma.user.update({
      where: { id: user.id },
      data: updateData
    });
    
    // Log failed login
    await securityLogger.logSecurityEvent(prisma, {
      level: 'warn',
      event: 'login_failure',
      ipAddress,
      userId: user.id,
      userEmail: user.email,
      description: `Failed login attempt (${failedAttempts}/${LOCKOUT_THRESHOLD}): ${user.email}`
    });
    
    throw new Error('Invalid email or password');
  }
  
  // Reset failed login attempts on successful login
  await prisma.user.update({
    where: { id: user.id },
    data: {
      failedLoginAttempts: 0,
      lastLoginAt: new Date(),
      lastLoginIp: ipAddress
    }
  });
  
  // Generate JWT token
  const token = jwt.sign(
    { 
      userId: user.id,
      email: user.email
    },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRES_IN }
  );
  
  // Log successful login
  await securityLogger.logSecurityEvent(prisma, {
    level: 'info',
    event: 'login_success',
    ipAddress,
    userId: user.id,
    userEmail: user.email,
    description: `Successful login: ${user.email}`
  });
  
  return {
    user: {
      id: user.id,
      email: user.email
    },
    token
  };
};

/**
 * Verify JWT token and get user data
 * @param {string} token - JWT token to verify
 * @returns {Promise<Object>} - User data
 */
export const verifyToken = async (token) => {
  try {
    // Verify the token
    const decoded = jwt.verify(token, JWT_SECRET);
    
    // Get user from database
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId }
    });
    
    if (!user) {
      throw new Error('User not found');
    }
    
    // Return user without sensitive data
    const { passwordHash, ...userWithoutPassword } = user;
    return userWithoutPassword;
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      throw new Error('Token expired');
    }
    
    if (error.name === 'JsonWebTokenError') {
      throw new Error('Invalid token');
    }
    
    throw error;
  }
};

const authService = {
  registerUser,
  loginUser,
  verifyToken
};

export { authService };
export default authService;
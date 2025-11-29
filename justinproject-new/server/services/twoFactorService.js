import speakeasy from 'speakeasy';
import QRCode from 'qrcode';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * Generate a secret for 2FA setup
 * @param {string} userId - User ID
 * @param {string} email - User email
 * @returns {Promise<Object>} - Secret and QR code data URL
 */
export const generateSecret = async (userId, email) => {
  const secret = speakeasy.generateSecret({
    name: `SecureAuth (${email})`,
    issuer: 'Secure Authentication System',
    length: 32
  });
  
  // Save secret to database
  await prisma.user.update({
    where: { id: userId },
    data: {
      twoFactorSecret: secret.base32,
      twoFactorEnabled: false // Not enabled until verified
    }
  });
  
  // Generate QR code
  const qrCodeUrl = await QRCode.toDataURL(secret.otpauth_url);
  
  return {
    secret: secret.base32,
    qrCode: qrCodeUrl,
    manualEntryKey: secret.base32
  };
};

/**
 * Verify 2FA token
 * @param {string} userId - User ID
 * @param {string} token - 2FA token from user
 * @returns {Promise<boolean>} - True if token is valid
 */
export const verifyToken = async (userId, token) => {
  const user = await prisma.user.findUnique({
    where: { id: userId }
  });
  
  if (!user || !user.twoFactorSecret) {
    return false;
  }
  
  const verified = speakeasy.totp.verify({
    secret: user.twoFactorSecret,
    encoding: 'base32',
    token: token,
    window: 2 // Allow 2 time steps (60 seconds) before/after current time
  });
  
  return verified;
};

/**
 * Enable 2FA for a user (after verification)
 * @param {string} userId - User ID
 * @returns {Promise<void>}
 */
export const enable2FA = async (userId) => {
  await prisma.user.update({
    where: { id: userId },
    data: {
      twoFactorEnabled: true
    }
  });
};

/**
 * Disable 2FA for a user
 * @param {string} userId - User ID
 * @returns {Promise<void>}
 */
export const disable2FA = async (userId) => {
  await prisma.user.update({
    where: { id: userId },
    data: {
      twoFactorEnabled: false,
      twoFactorSecret: null
    }
  });
};

/**
 * Check if user has 2FA enabled
 * @param {string} userId - User ID
 * @returns {Promise<boolean>}
 */
export const is2FAEnabled = async (userId) => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { twoFactorEnabled: true }
  });
  
  return user?.twoFactorEnabled || false;
};

export default {
  generateSecret,
  verifyToken,
  enable2FA,
  disable2FA,
  is2FAEnabled
};



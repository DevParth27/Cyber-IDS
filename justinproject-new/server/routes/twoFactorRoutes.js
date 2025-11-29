import express from 'express';
import twoFactorService from '../services/twoFactorService.js';
import { authMiddleware } from '../middleware/authMiddleware.js';

const router = express.Router();

// All 2FA routes require authentication
router.use(authMiddleware.authenticate);

// Generate 2FA secret and QR code
router.post('/setup', async (req, res) => {
  try {
    const userId = req.user.id;
    const userEmail = req.user.email;
    
    const secretData = await twoFactorService.generateSecret(userId, userEmail);
    
    res.status(200).json({
      success: true,
      data: secretData
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to generate 2FA secret',
      error: error.message
    });
  }
});

// Verify and enable 2FA
router.post('/verify', async (req, res) => {
  try {
    const { token } = req.body;
    const userId = req.user.id;
    
    if (!token) {
      return res.status(400).json({
        success: false,
        message: '2FA token is required'
      });
    }
    
    const isValid = await twoFactorService.verifyToken(userId, token);
    
    if (!isValid) {
      return res.status(401).json({
        success: false,
        message: 'Invalid 2FA token'
      });
    }
    
    // Enable 2FA
    await twoFactorService.enable2FA(userId);
    
    res.status(200).json({
      success: true,
      message: '2FA enabled successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to verify 2FA token',
      error: error.message
    });
  }
});

// Disable 2FA
router.post('/disable', async (req, res) => {
  try {
    const userId = req.user.id;
    
    await twoFactorService.disable2FA(userId);
    
    res.status(200).json({
      success: true,
      message: '2FA disabled successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to disable 2FA',
      error: error.message
    });
  }
});

// Check 2FA status
router.get('/status', async (req, res) => {
  try {
    const userId = req.user.id;
    const isEnabled = await twoFactorService.is2FAEnabled(userId);
    
    res.status(200).json({
      success: true,
      data: {
        enabled: isEnabled
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to check 2FA status',
      error: error.message
    });
  }
});

export { router as twoFactorRoutes };



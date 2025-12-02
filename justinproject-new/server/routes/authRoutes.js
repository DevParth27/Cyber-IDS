import express from 'express';
import { authController } from '../controllers/authController.js';
import { authMiddleware } from '../middleware/authMiddleware.js';
import { securityMiddleware } from '../middleware/securityMiddleware.js';

const router = express.Router();

// Apply security middleware to all auth routes
router.use(securityMiddleware.sqlInjectionProtection);
router.use(securityMiddleware.sanitizeInputs);

// Public routes
router.post('/register', authController.register);
router.post('/login', authController.login);
router.post('/admin/login', authController.adminLogin);
router.post('/logout', authController.logout);

// Protected routes
router.get('/profile', authMiddleware.authenticate, authController.getProfile);

export { router as authRoutes };
import express from 'express';
import idsService from '../services/idsService.js';
import honeypotService from '../services/honeypotService.js';
import { authMiddleware } from '../middleware/authMiddleware.js';

const router = express.Router();

// All IDS routes require authentication (blue hat team only)
router.use(authMiddleware.authenticate);

// Get all IDS alerts
router.get('/alerts', async (req, res) => {
  try {
    const { limit, offset, severity, status, alertType } = req.query;
    
    // Build options object - only include defined values
    const options = {};
    if (limit) options.limit = parseInt(limit);
    if (offset) options.offset = parseInt(offset);
    if (severity && severity !== '') options.severity = severity;
    if (status && status !== '') options.status = status;
    if (alertType && alertType !== '') options.alertType = alertType;
    
    const alerts = await idsService.getAlerts(options);
    
    res.status(200).json({
      success: true,
      data: alerts
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch alerts',
      error: error.message
    });
  }
});

// Get alert statistics
router.get('/statistics', async (req, res) => {
  try {
    const stats = await idsService.getAlertStatistics();
    res.status(200).json({
      success: true,
      data: stats
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch statistics',
      error: error.message
    });
  }
});

// Update alert status
router.patch('/alerts/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { status, assignedTo } = req.body;
    
    const updatedAlert = await idsService.updateAlert(id, { status, assignedTo });
    
    res.status(200).json({
      success: true,
      data: updatedAlert
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to update alert',
      error: error.message
    });
  }
});

// Analyze IP address activity
router.get('/analyze/:ipAddress', async (req, res) => {
  try {
    const { ipAddress } = req.params;
    const analysis = await idsService.analyzeActivity(ipAddress);
    
    res.status(200).json({
      success: true,
      data: analysis
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to analyze activity',
      error: error.message
    });
  }
});

// Get honeypot interactions
router.get('/honeypot/interactions', async (req, res) => {
  try {
    const { limit, offset, ipAddress } = req.query;
    const interactions = await honeypotService.getHoneypotInteractions({
      limit: limit ? parseInt(limit) : undefined,
      offset: offset ? parseInt(offset) : undefined,
      ipAddress
    });
    
    res.status(200).json({
      success: true,
      data: interactions
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch honeypot interactions',
      error: error.message
    });
  }
});

export { router as idsRoutes };


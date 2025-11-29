import { PrismaClient } from '@prisma/client';
import { securityLogger } from '../utils/logger.js';

const prisma = new PrismaClient();

// Blue hat team email (configure via environment variable)
const BLUE_HAT_TEAM_EMAIL = process.env.BLUE_HAT_TEAM_EMAIL || 'security@company.com';
const ALERT_WEBHOOK_URL = process.env.IDS_WEBHOOK_URL;

/**
 * Create an IDS alert
 * @param {Object} alertData - Alert information
 * @returns {Promise<Object>}
 */
export const createAlert = async (alertData) => {
  const {
    severity = 'medium',
    alertType,
    title,
    description,
    ipAddress,
    userId,
    metadata
  } = alertData;
  
  const alert = await prisma.iDSAlert.create({
    data: {
      severity,
      alertType,
      title,
      description,
      ipAddress,
      userId,
      metadata: metadata ? JSON.stringify(metadata) : null
    }
  });
  
  // Send notification to blue hat team
  await notifyBlueHatTeam(alert);
  
  return alert;
};

/**
 * Notify blue hat team about security alert
 * @param {Object} alert - The alert object
 * @returns {Promise<void>}
 */
const notifyBlueHatTeam = async (alert) => {
  try {
    // Log the alert (in production, this would send email/SMS/Slack notification)
    securityLogger.warn('IDS Alert Generated', {
      alertId: alert.id,
      severity: alert.severity,
      type: alert.alertType,
      title: alert.title,
      ipAddress: alert.ipAddress,
      timestamp: alert.timestamp
    });
    
    // If webhook URL is configured, send HTTP notification
    if (ALERT_WEBHOOK_URL) {
      try {
        const response = await fetch(ALERT_WEBHOOK_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            alert: {
              id: alert.id,
              severity: alert.severity,
              type: alert.alertType,
              title: alert.title,
              description: alert.description,
              ipAddress: alert.ipAddress,
              timestamp: alert.timestamp
            }
          })
        });
        
        if (!response.ok) {
          securityLogger.error('Failed to send webhook notification', {
            status: response.status,
            alertId: alert.id
          });
        }
      } catch (error) {
        securityLogger.error('Webhook notification error', {
          error: error.message,
          alertId: alert.id
        });
      }
    }
    
    // In production, you would also:
    // - Send email to blue hat team
    // - Send SMS for critical alerts
    // - Post to Slack/Discord channel
    // - Trigger automated response systems
  } catch (error) {
    securityLogger.error('Error notifying blue hat team', {
      error: error.message,
      alertId: alert.id
    });
  }
};

/**
 * Get all IDS alerts
 * @param {Object} options - Query options
 * @returns {Promise<Array>}
 */
export const getAlerts = async (options = {}) => {
  const {
    limit = 100,
    offset = 0,
    severity,
    status,
    alertType
  } = options;
  
  const where = {};
  
  // Only add filters if they are provided (not undefined)
  if (severity !== undefined && severity !== '') {
    where.severity = severity;
  }
  if (status !== undefined && status !== '' && status !== 'all') {
    where.status = status;
  }
  // If no status filter, show all statuses (don't add status to where clause)
  if (alertType !== undefined && alertType !== '') {
    where.alertType = alertType;
  }
  
  return await prisma.iDSAlert.findMany({
    where,
    orderBy: { timestamp: 'desc' },
    take: limit || 100,
    skip: offset || 0
  });
};

/**
 * Get alert statistics
 * @returns {Promise<Object>}
 */
export const getAlertStatistics = async () => {
  const totalAlerts = await prisma.iDSAlert.count();
  const openAlerts = await prisma.iDSAlert.count({ where: { status: 'open' } });
  const criticalAlerts = await prisma.iDSAlert.count({ where: { severity: 'critical' } });
  const highAlerts = await prisma.iDSAlert.count({ where: { severity: 'high' } });
  
  // Get alerts by type
  const alertsByType = await prisma.iDSAlert.groupBy({
    by: ['alertType'],
    _count: { id: true }
  });
  
  // Get alerts by severity
  const alertsBySeverity = await prisma.iDSAlert.groupBy({
    by: ['severity'],
    _count: { id: true }
  });
  
  // Get recent alerts (last 24 hours)
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const recentAlerts = await prisma.iDSAlert.count({
    where: {
      timestamp: { gte: yesterday }
    }
  });
  
  return {
    total: totalAlerts,
    open: openAlerts,
    critical: criticalAlerts,
    high: highAlerts,
    recent: recentAlerts,
    byType: alertsByType.map(item => ({
      type: item.alertType,
      count: item._count.id
    })),
    bySeverity: alertsBySeverity.map(item => ({
      severity: item.severity,
      count: item._count.id
    }))
  };
};

/**
 * Update alert status
 * @param {string} alertId - Alert ID
 * @param {Object} updateData - Data to update
 * @returns {Promise<Object>}
 */
export const updateAlert = async (alertId, updateData) => {
  const { status, assignedTo } = updateData;
  
  const update = {};
  if (status) {
    update.status = status;
    if (status === 'resolved' || status === 'false_positive') {
      update.resolvedAt = new Date();
    }
  }
  if (assignedTo) {
    update.assignedTo = assignedTo;
  }
  
  return await prisma.iDSAlert.update({
    where: { id: alertId },
    data: update
  });
};

/**
 * Analyze patterns and detect suspicious activities
 * @param {string} ipAddress - IP address to analyze
 * @returns {Promise<Object>}
 */
export const analyzeActivity = async (ipAddress) => {
  // Get all activities from this IP in last hour
  const oneHourAgo = new Date();
  oneHourAgo.setHours(oneHourAgo.getHours() - 1);
  
  const recentLogs = await prisma.securityLog.findMany({
    where: {
      ipAddress,
      timestamp: { gte: oneHourAgo }
    }
  });
  
  const honeypotInteractions = await prisma.honeypotInteraction.findMany({
    where: {
      ipAddress,
      timestamp: { gte: oneHourAgo }
    }
  });
  
  // Analyze patterns
  const sqlInjectionAttempts = recentLogs.filter(log => 
    log.event === 'sql_injection_attempt'
  ).length;
  
  const failedLogins = recentLogs.filter(log => 
    log.event === 'login_failure'
  ).length;
  
  const honeypotTriggers = honeypotInteractions.length;
  
  // Determine threat level
  let threatLevel = 'low';
  let recommendations = [];
  
  if (honeypotTriggers > 0) {
    threatLevel = 'critical';
    recommendations.push('IP has triggered honeypot - potential attacker');
  } else if (sqlInjectionAttempts > 3) {
    threatLevel = 'high';
    recommendations.push('Multiple SQL injection attempts detected');
  } else if (failedLogins > 10) {
    threatLevel = 'high';
    recommendations.push('Brute force attack suspected');
  } else if (sqlInjectionAttempts > 0 || failedLogins > 5) {
    threatLevel = 'medium';
    recommendations.push('Suspicious activity detected');
  }
  
  return {
    ipAddress,
    threatLevel,
    sqlInjectionAttempts,
    failedLogins,
    honeypotTriggers,
    totalActivities: recentLogs.length + honeypotInteractions.length,
    recommendations,
    analysisTime: new Date()
  };
};

export default {
  createAlert,
  getAlerts,
  getAlertStatistics,
  updateAlert,
  analyzeActivity
};



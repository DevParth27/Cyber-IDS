import React, { useState, useEffect } from 'react';
import { AlertTriangle, Shield, Activity, Database, TrendingUp, Clock, CheckCircle, XCircle, Search, Filter } from 'lucide-react';
import { apiService } from '../services/api';

interface IDSAlert {
  id: string;
  timestamp: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  alertType: string;
  title: string;
  description: string;
  ipAddress?: string;
  status: string;
  assignedTo?: string;
}

interface HoneypotInteraction {
  id: string;
  timestamp: string;
  ipAddress: string;
  attackType: string;
  payload: string;
  endpoint?: string;
}

interface Statistics {
  total: number;
  open: number;
  critical: number;
  high: number;
  recent: number;
  byType: Array<{ type: string; count: number }>;
  bySeverity: Array<{ severity: string; count: number }>;
}

const IDSDashboard: React.FC = () => {
  const [alerts, setAlerts] = useState<IDSAlert[]>([]);
  const [honeypotInteractions, setHoneypotInteractions] = useState<HoneypotInteraction[]>([]);
  const [statistics, setStatistics] = useState<Statistics | null>(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState({ severity: '', status: 'all' });
  const [selectedAlert, setSelectedAlert] = useState<IDSAlert | null>(null);

  useEffect(() => {
    fetchData();
    // Refresh every 30 seconds
    const interval = setInterval(fetchData, 30000);
    return () => clearInterval(interval);
  }, [filter]);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      // Build query parameters
      const params = new URLSearchParams();
      if (filter.status && filter.status !== 'all') {
        params.append('status', filter.status);
      }
      if (filter.severity && filter.severity !== '') {
        params.append('severity', filter.severity);
      }
      
      // Fetch alerts
      const alertsResponse = await fetch(
        `${import.meta.env.VITE_API_URL || 'http://localhost:3001'}/api/ids/alerts?${params.toString()}`,
        {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          },
          credentials: 'include'
        }
      );
      const alertsData = await alertsResponse.json();
      if (alertsData.success) {
        setAlerts(alertsData.data);
        console.log('IDS Alerts loaded:', alertsData.data.length);
      } else {
        console.error('Failed to fetch alerts:', alertsData.message);
      }

      // Fetch statistics
      const statsResponse = await fetch(
        `${import.meta.env.VITE_API_URL || 'http://localhost:3001'}/api/ids/statistics`,
        {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          },
          credentials: 'include'
        }
      );
      const statsData = await statsResponse.json();
      if (statsData.success) {
        setStatistics(statsData.data);
      }

      // Fetch honeypot interactions
      const honeypotResponse = await fetch(
        `${import.meta.env.VITE_API_URL || 'http://localhost:3001'}/api/ids/honeypot/interactions?limit=50`,
        {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          },
          credentials: 'include'
        }
      );
      const honeypotData = await honeypotResponse.json();
      if (honeypotData.success) {
        setHoneypotInteractions(honeypotData.data);
      }
    } catch (error) {
      console.error('Error fetching IDS data:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateAlertStatus = async (alertId: string, status: string) => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL || 'http://localhost:3001'}/api/ids/alerts/${alertId}`,
        {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          },
          credentials: 'include',
          body: JSON.stringify({ status })
        }
      );
      
      if (response.ok) {
        fetchData();
        setSelectedAlert(null);
      }
    } catch (error) {
      console.error('Error updating alert:', error);
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'bg-red-100 text-red-800 border-red-300';
      case 'high': return 'bg-orange-100 text-orange-800 border-orange-300';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'low': return 'bg-blue-100 text-blue-800 border-blue-300';
      default: return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  if (loading && !statistics) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 flex items-center">
            <Shield className="h-8 w-8 mr-3 text-indigo-600" />
            IDS Security Dashboard
          </h1>
          <p className="text-gray-600 mt-2">Real-time intrusion detection and monitoring</p>
        </div>

        {/* Statistics Cards */}
        {statistics && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
            <div className="bg-white p-6 rounded-lg shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Alerts</p>
                  <p className="text-2xl font-bold text-gray-900">{statistics.total}</p>
                </div>
                <AlertTriangle className="h-8 w-8 text-gray-400" />
              </div>
            </div>
            <div className="bg-white p-6 rounded-lg shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Open Alerts</p>
                  <p className="text-2xl font-bold text-orange-600">{statistics.open}</p>
                </div>
                <Activity className="h-8 w-8 text-orange-400" />
              </div>
            </div>
            <div className="bg-white p-6 rounded-lg shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Critical</p>
                  <p className="text-2xl font-bold text-red-600">{statistics.critical}</p>
                </div>
                <AlertTriangle className="h-8 w-8 text-red-400" />
              </div>
            </div>
            <div className="bg-white p-6 rounded-lg shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">High Priority</p>
                  <p className="text-2xl font-bold text-orange-600">{statistics.high}</p>
                </div>
                <TrendingUp className="h-8 w-8 text-orange-400" />
              </div>
            </div>
            <div className="bg-white p-6 rounded-lg shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Last 24h</p>
                  <p className="text-2xl font-bold text-blue-600">{statistics.recent}</p>
                </div>
                <Clock className="h-8 w-8 text-blue-400" />
              </div>
            </div>
          </div>
        )}

        {/* Filters */}
        <div className="bg-white p-4 rounded-lg shadow mb-6 flex gap-4">
          <select
            value={filter.severity}
            onChange={(e) => setFilter({ ...filter, severity: e.target.value })}
            className="px-4 py-2 border border-gray-300 rounded-md"
          >
            <option value="">All Severities</option>
            <option value="critical">Critical</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>
          <select
            value={filter.status}
            onChange={(e) => setFilter({ ...filter, status: e.target.value })}
            className="px-4 py-2 border border-gray-300 rounded-md"
          >
            <option value="all">All Status</option>
            <option value="open">Open</option>
            <option value="investigating">Investigating</option>
            <option value="resolved">Resolved</option>
            <option value="false_positive">False Positive</option>
          </select>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Alerts List */}
          <div className="bg-white rounded-lg shadow">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-xl font-semibold flex items-center">
                <AlertTriangle className="h-5 w-5 mr-2 text-red-500" />
                Security Alerts
              </h2>
            </div>
            <div className="divide-y divide-gray-200 max-h-96 overflow-y-auto">
              {alerts.length === 0 ? (
                <div className="p-6 text-center text-gray-500">No alerts found</div>
              ) : (
                alerts.map((alert) => (
                  <div
                    key={alert.id}
                    className="p-4 hover:bg-gray-50 cursor-pointer"
                    onClick={() => setSelectedAlert(alert)}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className={`px-2 py-1 rounded text-xs font-medium border ${getSeverityColor(alert.severity)}`}>
                            {alert.severity}
                          </span>
                          <span className="text-xs text-gray-500">{alert.alertType}</span>
                        </div>
                        <h3 className="font-medium text-gray-900">{alert.title}</h3>
                        <p className="text-sm text-gray-600 mt-1">{alert.description.substring(0, 100)}...</p>
                        <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                          <span>{alert.ipAddress}</span>
                          <span>{formatDate(alert.timestamp)}</span>
                        </div>
                      </div>
                      <div className={`w-3 h-3 rounded-full ${
                        alert.status === 'open' ? 'bg-red-500' :
                        alert.status === 'investigating' ? 'bg-yellow-500' :
                        'bg-green-500'
                      }`}></div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Honeypot Interactions */}
          <div className="bg-white rounded-lg shadow">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-xl font-semibold flex items-center">
                <Database className="h-5 w-5 mr-2 text-orange-500" />
                Honeypot Interactions
              </h2>
            </div>
            <div className="divide-y divide-gray-200 max-h-96 overflow-y-auto">
              {honeypotInteractions.length === 0 ? (
                <div className="p-6 text-center text-gray-500">No honeypot interactions</div>
              ) : (
                honeypotInteractions.map((interaction) => (
                  <div key={interaction.id} className="p-4">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="px-2 py-1 bg-red-100 text-red-800 rounded text-xs font-medium">
                            {interaction.attackType}
                          </span>
                        </div>
                        <p className="text-sm font-mono text-gray-800 bg-gray-50 p-2 rounded mt-2 break-all">
                          {interaction.payload.substring(0, 150)}
                          {interaction.payload.length > 150 ? '...' : ''}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                      <span className="font-medium">{interaction.ipAddress}</span>
                      <span>{formatDate(interaction.timestamp)}</span>
                      {interaction.endpoint && <span>{interaction.endpoint}</span>}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Alert Detail Modal */}
        {selectedAlert && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full m-4">
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-semibold">{selectedAlert.title}</h3>
                  <button
                    onClick={() => setSelectedAlert(null)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <XCircle className="h-6 w-6" />
                  </button>
                </div>
              </div>
              <div className="p-6">
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-gray-700">Description</label>
                    <p className="mt-1 text-gray-900">{selectedAlert.description}</p>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-gray-700">Severity</label>
                      <span className={`mt-1 block px-2 py-1 rounded text-sm border ${getSeverityColor(selectedAlert.severity)}`}>
                        {selectedAlert.severity}
                      </span>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-700">Status</label>
                      <p className="mt-1 text-gray-900 capitalize">{selectedAlert.status}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-700">IP Address</label>
                      <p className="mt-1 text-gray-900">{selectedAlert.ipAddress || 'N/A'}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-700">Timestamp</label>
                      <p className="mt-1 text-gray-900">{formatDate(selectedAlert.timestamp)}</p>
                    </div>
                  </div>
                  <div className="flex gap-2 pt-4">
                    <button
                      onClick={() => updateAlertStatus(selectedAlert.id, 'investigating')}
                      className="px-4 py-2 bg-yellow-600 text-white rounded hover:bg-yellow-700"
                    >
                      Mark Investigating
                    </button>
                    <button
                      onClick={() => updateAlertStatus(selectedAlert.id, 'resolved')}
                      className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
                    >
                      Mark Resolved
                    </button>
                    <button
                      onClick={() => updateAlertStatus(selectedAlert.id, 'false_positive')}
                      className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
                    >
                      Mark False Positive
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default IDSDashboard;



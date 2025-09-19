'use client';

import { useState, useEffect } from 'react';

interface APIKeyData {
  id: string;
  name: string;
  createdAt: string;
  lastUsed: string | null;
  usage: {
    calls: number;
    totalCost: number;
    totalSaved: number;
    requests: Array<{
      timestamp: string;
      endpoint: string;
      cost: number;
      saved: number;
      provider: string;
    }>;
  };
  permissions: string[];
  isActive: boolean;
  rateLimit: {
    requestsPerHour: number;
    requestsPerDay: number;
  };
}

interface AnalyticsData {
  timeframe: string;
  period: {
    start: string;
    end: string;
  };
  summary: {
    totalCalls: number;
    totalCost: number;
    totalSaved: number;
    averageCost: number;
    averageSavings: number;
    savingsPercentage: number;
  };
  providerBreakdown: Record<string, {
    calls: number;
    cost: number;
    saved: number;
  }>;
  hourlyBreakdown: Array<{
    hour: number;
    calls: number;
    cost: number;
    saved: number;
  }>;
  rateLimit: {
    allowed: boolean;
    remaining: number;
    resetTime: string;
  };
}

export default function DashboardPage() {
  const [apiKeys, setApiKeys] = useState<APIKeyData[]>([]);
  const [selectedKey, setSelectedKey] = useState<string>('');
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [timeframe, setTimeframe] = useState<'hour' | 'day' | 'week' | 'month'>('day');
  const [loading, setLoading] = useState(false);
  const [realTimeStats, setRealTimeStats] = useState({
    totalRequests: 0,
    totalCost: 0,
    totalSaved: 0,
    activeKeys: 0
  });

  // Load API keys
  const loadAPIKeys = async () => {
    try {
      const response = await fetch('/api/v1/keys');
      const result = await response.json();
      
      if (result.success) {
        setApiKeys(result.data.keys);
        if (result.data.keys.length > 0 && !selectedKey) {
          setSelectedKey(result.data.keys[0].id);
        }
      }
    } catch (error) {
      console.error('Error loading API keys:', error);
    }
  };

  // Load analytics for selected key
  const loadAnalytics = async (keyId: string, tf: string = timeframe) => {
    if (!keyId) return;
    
    setLoading(true);
    try {
      const response = await fetch(`/api/v1/keys?action=analytics&keyId=${keyId}&timeframe=${tf}`);
      const result = await response.json();
      
      if (result.success) {
        setAnalytics(result.data);
      }
    } catch (error) {
      console.error('Error loading analytics:', error);
    }
    setLoading(false);
  };

  // Calculate real-time stats
  const calculateRealTimeStats = () => {
    const totalRequests = apiKeys.reduce((sum, key) => sum + key.usage.calls, 0);
    const totalCost = apiKeys.reduce((sum, key) => sum + key.usage.totalCost, 0);
    const totalSaved = apiKeys.reduce((sum, key) => sum + key.usage.totalSaved, 0);
    const activeKeys = apiKeys.filter(key => key.isActive).length;

    setRealTimeStats({
      totalRequests,
      totalCost,
      totalSaved,
      activeKeys
    });
  };

  // Load data on component mount and when selected key changes
  useEffect(() => {
    loadAPIKeys();
  }, []);

  useEffect(() => {
    if (selectedKey) {
      loadAnalytics(selectedKey);
    }
  }, [selectedKey, timeframe]);

  useEffect(() => {
    calculateRealTimeStats();
  }, [apiKeys]);

  // Auto-refresh every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      loadAPIKeys();
      if (selectedKey) {
        loadAnalytics(selectedKey);
      }
    }, 30000);

    return () => clearInterval(interval);
  }, [selectedKey]);

  const selectedKeyData = apiKeys.find(key => key.id === selectedKey);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-lg mb-8">
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 px-8 py-12">
            <h1 className="text-4xl font-bold text-white mb-4">
              Analytics Dashboard
            </h1>
            <p className="text-xl text-blue-100">
              Real-time monitoring of your API usage and cost savings
            </p>
          </div>
        </div>

        {/* Real-time Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow-lg">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Total Requests</p>
                <p className="text-2xl font-bold text-gray-900">{realTimeStats.totalRequests.toLocaleString()}</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-lg">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Total Cost</p>
                <p className="text-2xl font-bold text-gray-900">${realTimeStats.totalCost.toFixed(4)}</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-lg">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg">
                <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Total Saved</p>
                <p className="text-2xl font-bold text-gray-900">${realTimeStats.totalSaved.toFixed(4)}</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-lg">
            <div className="flex items-center">
              <div className="p-2 bg-orange-100 rounded-lg">
                <svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Active Keys</p>
                <p className="text-2xl font-bold text-gray-900">{realTimeStats.activeKeys}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* API Key Selection */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h2 className="text-xl font-semibold mb-4">API Keys</h2>
              
              <div className="space-y-3">
                {apiKeys.map((key) => (
                  <div
                    key={key.id}
                    onClick={() => setSelectedKey(key.id)}
                    className={`p-4 rounded-lg border cursor-pointer transition-all ${
                      selectedKey === key.id
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-medium text-gray-900">{key.name}</h3>
                        <p className="text-sm text-gray-500">
                          {key.usage.calls} calls • ${key.usage.totalCost.toFixed(4)} cost
                        </p>
                        <p className="text-sm text-green-600">
                          ${key.usage.totalSaved.toFixed(4)} saved
                        </p>
                      </div>
                      <div className="flex items-center">
                        <div className={`w-3 h-3 rounded-full ${key.isActive ? 'bg-green-400' : 'bg-gray-400'}`}></div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-6">
                <a
                  href="/api-keys"
                  className="w-full bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 text-center block"
                >
                  Manage API Keys
                </a>
              </div>
            </div>
          </div>

          {/* Analytics */}
          <div className="lg:col-span-2">
            {selectedKeyData && (
              <div className="bg-white rounded-lg shadow-lg p-6">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-xl font-semibold">
                    Analytics - {selectedKeyData.name}
                  </h2>
                  <select
                    value={timeframe}
                    onChange={(e) => setTimeframe(e.target.value as any)}
                    className="px-3 py-1 border border-gray-300 rounded-md text-sm"
                  >
                    <option value="hour">Last Hour</option>
                    <option value="day">Last 24 Hours</option>
                    <option value="week">Last 7 Days</option>
                    <option value="month">Last 30 Days</option>
                  </select>
                </div>

                {loading ? (
                  <div className="flex items-center justify-center py-12">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                  </div>
                ) : analytics ? (
                  <div className="space-y-6">
                    {/* Summary Stats */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="text-center">
                        <p className="text-2xl font-bold text-blue-600">{analytics.summary.totalCalls}</p>
                        <p className="text-sm text-gray-500">Calls</p>
                      </div>
                      <div className="text-center">
                        <p className="text-2xl font-bold text-green-600">${analytics.summary.totalCost.toFixed(4)}</p>
                        <p className="text-sm text-gray-500">Cost</p>
                      </div>
                      <div className="text-center">
                        <p className="text-2xl font-bold text-purple-600">${analytics.summary.totalSaved.toFixed(4)}</p>
                        <p className="text-sm text-gray-500">Saved</p>
                      </div>
                      <div className="text-center">
                        <p className="text-2xl font-bold text-orange-600">{analytics.summary.savingsPercentage.toFixed(1)}%</p>
                        <p className="text-sm text-gray-500">Savings</p>
                      </div>
                    </div>

                    {/* Provider Breakdown */}
                    <div>
                      <h3 className="text-lg font-semibold mb-3">Provider Usage</h3>
                      <div className="space-y-2">
                        {Object.entries(analytics.providerBreakdown).map(([provider, stats]) => (
                          <div key={provider} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                            <div>
                              <p className="font-medium capitalize">{provider}</p>
                              <p className="text-sm text-gray-500">{stats.calls} calls</p>
                            </div>
                            <div className="text-right">
                              <p className="text-sm">${stats.cost.toFixed(4)}</p>
                              <p className="text-sm text-green-600">${stats.saved.toFixed(4)} saved</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Rate Limit Status */}
                    <div className="p-4 bg-gray-50 rounded-lg">
                      <h3 className="text-lg font-semibold mb-2">Rate Limit Status</h3>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">
                          {analytics.rateLimit.remaining} requests remaining
                        </span>
                        <span className={`text-sm px-2 py-1 rounded ${
                          analytics.rateLimit.allowed ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                        }`}>
                          {analytics.rateLimit.allowed ? 'Within Limits' : 'Rate Limited'}
                        </span>
                      </div>
                    </div>

                    {/* Recent Requests */}
                    <div>
                      <h3 className="text-lg font-semibold mb-3">Recent Requests</h3>
                      <div className="space-y-2 max-h-64 overflow-y-auto">
                        {selectedKeyData.usage.requests.slice(-10).reverse().map((request, index) => (
                          <div key={index} className="flex justify-between items-center p-2 border-b border-gray-100">
                            <div>
                              <p className="text-sm font-medium">{request.endpoint}</p>
                              <p className="text-xs text-gray-500">
                                {new Date(request.timestamp).toLocaleString()}
                              </p>
                            </div>
                            <div className="text-right">
                              <p className="text-sm">${request.cost.toFixed(4)}</p>
                              <p className="text-xs text-green-600">${request.saved.toFixed(4)} saved</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <p className="text-gray-500">No analytics data available</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

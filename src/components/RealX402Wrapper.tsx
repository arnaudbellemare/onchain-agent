'use client';

import React, { useState, useEffect } from 'react';

interface APIRequest {
  endpoint: string;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE';
  headers?: Record<string, string>;
  body?: unknown;
}

interface APIResponse {
  success: boolean;
  data: unknown;
  status: number;
  headers: Record<string, string>;
  provider: string;
  cost: number;
  responseTime: number;
  transactionHash?: string;
}

interface ProviderPrice {
  providerId: string;
  providerName: string;
  currentCost: number;
  previousCost: number;
  changePercentage: number;
  lastUpdated: string;
  trend: 'up' | 'down' | 'stable';
}

interface OptimizationMetrics {
  totalOptimizations: number;
  totalSavings: number;
  averageSavings: number;
  successRate: number;
  failureRate: number;
  lastOptimization: string;
}

export default function RealX402Wrapper() {
  const [request, setRequest] = useState<APIRequest>({
    endpoint: '/v1/chat/completions',
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: {
      model: 'gpt-4',
      messages: [{ role: 'user', content: 'Hello, how are you?' }]
    }
  });
  
  const [response, setResponse] = useState<APIResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [prices, setPrices] = useState<ProviderPrice[]>([]);
  const [optimizationMetrics, setOptimizationMetrics] = useState<OptimizationMetrics | null>(null);
  const [monitoringStatus, setMonitoringStatus] = useState<{ isMonitoring: boolean; interval?: number } | null>(null);

  // Load initial data
  useEffect(() => {
    loadPrices();
    loadOptimizationMetrics();
    loadMonitoringStatus();
  }, []);

  const loadPrices = async () => {
    try {
      const res = await fetch('/api/price-monitor?action=prices');
      const data = await res.json();
      if (data.success) {
        setPrices(data.prices);
      }
    } catch (error) {
      console.error('Failed to load prices:', error);
    }
  };

  const loadOptimizationMetrics = async () => {
    try {
      const res = await fetch('/api/x402-wrapper?action=optimization');
      const data = await res.json();
      if (data.success) {
        setOptimizationMetrics(data.optimization.metrics);
      }
    } catch (error) {
      console.error('Failed to load optimization metrics:', error);
    }
  };

  const loadMonitoringStatus = async () => {
    try {
      const res = await fetch('/api/price-monitor?action=status');
      const data = await res.json();
      if (data.success) {
        setMonitoringStatus(data.status);
      }
    } catch (error) {
      console.error('Failed to load monitoring status:', error);
    }
  };

  const makeAPIRequest = async () => {
    setLoading(true);
    setResponse(null);
    
    try {
      const res = await fetch('/api/x402-wrapper', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(request)
      });
      
      const data = await res.json();
      setResponse(data);
      
      // Refresh data after request
      loadPrices();
      loadOptimizationMetrics();
      
    } catch (error) {
      console.error('API request failed:', error);
      setResponse({
        success: false,
        data: null,
        status: 500,
        headers: {},
        provider: 'Error',
        cost: 0,
        responseTime: 0
      });
    } finally {
      setLoading(false);
    }
  };

  const startPriceMonitoring = async () => {
    try {
      const res = await fetch('/api/price-monitor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'start', interval: 30000 })
      });
      
      const data = await res.json();
      if (data.success) {
        loadMonitoringStatus();
        alert('Price monitoring started!');
      }
    } catch (error) {
      console.error('Failed to start monitoring:', error);
    }
  };

  const stopPriceMonitoring = async () => {
    try {
      const res = await fetch('/api/price-monitor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'stop' })
      });
      
      const data = await res.json();
      if (data.success) {
        loadMonitoringStatus();
        alert('Price monitoring stopped!');
      }
    } catch (error) {
      console.error('Failed to stop monitoring:', error);
    }
  };

  return (
    <div className="max-w-7xl mx-auto p-8">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          Real x402 API Wrapper
        </h1>
        <p className="text-xl text-gray-900 max-w-4xl mx-auto">
          Make real API requests through our x402 wrapper with autonomous optimization and micropayments
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* API Request Section */}
        <div className="bg-white rounded-xl shadow-lg p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Make API Request</h2>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">
                Endpoint
              </label>
              <input
                type="text"
                value={request.endpoint}
                onChange={(e) => setRequest({ ...request, endpoint: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="/v1/chat/completions"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">
                Method
              </label>
              <select
                value={request.method}
                onChange={(e) => setRequest({ ...request, method: e.target.value as 'GET' | 'POST' | 'PUT' | 'DELETE' })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="GET">GET</option>
                <option value="POST">POST</option>
                <option value="PUT">PUT</option>
                <option value="DELETE">DELETE</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">
                Request Body (JSON)
              </label>
              <textarea
                value={JSON.stringify(request.body, null, 2)}
                onChange={(e) => {
                  try {
                    setRequest({ ...request, body: JSON.parse(e.target.value) });
                  } catch {
                    // Invalid JSON, don't update
                  }
                }}
                rows={6}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono text-sm"
              />
            </div>
            
            <button
              onClick={makeAPIRequest}
              disabled={loading}
              className={`w-full py-3 px-6 rounded-lg font-medium transition-all ${
                loading
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : 'bg-blue-600 text-white hover:bg-blue-700'
              }`}
            >
              {loading ? 'Making Request...' : 'Make x402 API Request'}
            </button>
          </div>
        </div>

        {/* Response Section */}
        <div className="bg-white rounded-xl shadow-lg p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Response</h2>
          
          {response ? (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-blue-50 p-4 rounded-lg">
                  <div className="text-sm text-gray-600">Provider</div>
                  <div className="font-semibold text-gray-900">{response.provider}</div>
                </div>
                <div className="bg-green-50 p-4 rounded-lg">
                  <div className="text-sm text-gray-600">Cost</div>
                  <div className="font-semibold text-gray-900">${response.cost.toFixed(4)}</div>
                </div>
                <div className="bg-purple-50 p-4 rounded-lg">
                  <div className="text-sm text-gray-600">Response Time</div>
                  <div className="font-semibold text-gray-900">{response.responseTime}ms</div>
                </div>
                <div className="bg-yellow-50 p-4 rounded-lg">
                  <div className="text-sm text-gray-600">Status</div>
                  <div className="font-semibold text-gray-900">{response.status}</div>
                </div>
              </div>
              
              {response.transactionHash && (
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="text-sm text-gray-600">Transaction Hash</div>
                  <div className="font-mono text-sm text-gray-900 break-all">{response.transactionHash}</div>
                </div>
              )}
              
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="text-sm text-gray-600 mb-2">Response Data</div>
                <pre className="text-sm text-gray-900 overflow-auto max-h-40">
                  {JSON.stringify(response.data, null, 2)}
                </pre>
              </div>
            </div>
          ) : (
            <div className="text-center text-gray-500 py-8">
              Make a request to see the response
            </div>
          )}
        </div>
      </div>

      {/* Price Monitoring Section */}
      <div className="mt-8 bg-white rounded-xl shadow-lg p-8">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Real-time Price Monitoring</h2>
          <div className="flex space-x-4">
            <button
              onClick={startPriceMonitoring}
              className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
            >
              Start Monitoring
            </button>
            <button
              onClick={stopPriceMonitoring}
              className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700"
            >
              Stop Monitoring
            </button>
          </div>
        </div>
        
        {monitoringStatus && (
          <div className="mb-6 p-4 bg-blue-50 rounded-lg">
            <div className="text-sm text-gray-600">Monitoring Status</div>
            <div className="font-semibold text-gray-900">
              {monitoringStatus.isMonitoring ? '🟢 Active' : '🔴 Inactive'}
              {monitoringStatus.interval && ` (${monitoringStatus.interval}ms interval)`}
            </div>
          </div>
        )}
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {prices.map((price) => (
            <div key={price.providerId} className="bg-gray-50 p-4 rounded-lg">
              <div className="flex justify-between items-center mb-2">
                <div className="font-semibold text-gray-900">{price.providerName}</div>
                <div className={`text-sm ${
                  price.trend === 'up' ? 'text-red-600' : 
                  price.trend === 'down' ? 'text-green-600' : 'text-gray-600'
                }`}>
                  {price.trend === 'up' ? '↗️' : price.trend === 'down' ? '↘️' : '→'}
                </div>
              </div>
              <div className="text-2xl font-bold text-gray-900">${price.currentCost.toFixed(4)}</div>
              <div className="text-sm text-gray-600">
                {price.changePercentage > 0 ? '+' : ''}{price.changePercentage.toFixed(2)}%
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Optimization Metrics Section */}
      {optimizationMetrics && (
        <div className="mt-8 bg-white rounded-xl shadow-lg p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Optimization Metrics</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-blue-50 p-6 rounded-lg">
              <div className="text-2xl font-bold text-blue-600 mb-2">
                {optimizationMetrics.totalOptimizations}
              </div>
              <div className="text-sm text-gray-900">Total Optimizations</div>
            </div>
            
            <div className="bg-green-50 p-6 rounded-lg">
              <div className="text-2xl font-bold text-green-600 mb-2">
                ${optimizationMetrics.totalSavings.toFixed(4)}
              </div>
              <div className="text-sm text-gray-900">Total Savings</div>
            </div>
            
            <div className="bg-purple-50 p-6 rounded-lg">
              <div className="text-2xl font-bold text-purple-600 mb-2">
                ${optimizationMetrics.averageSavings.toFixed(4)}
              </div>
              <div className="text-sm text-gray-900">Average Savings</div>
            </div>
            
            <div className="bg-yellow-50 p-6 rounded-lg">
              <div className="text-2xl font-bold text-yellow-600 mb-2">
                {(optimizationMetrics.successRate * 100).toFixed(1)}%
              </div>
              <div className="text-sm text-gray-900">Success Rate</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

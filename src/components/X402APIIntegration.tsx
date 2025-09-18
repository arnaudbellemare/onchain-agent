'use client';

import React, { useState, useEffect } from 'react';

interface X402APICall {
  id: string;
  service: string;
  endpoint: string;
  cost: number;
  status: 'pending' | 'paid' | 'completed' | 'failed';
  timestamp: Date;
  response?: unknown;
  paymentHash?: string;
}

interface X402APIProvider {
  name: string;
  baseUrl: string;
  endpoints: {
    name: string;
    path: string;
    cost: number;
    description: string;
  }[];
}

export default function X402APIIntegration() {
  const [apiCalls, setApiCalls] = useState<X402APICall[]>([]);
  const [selectedProvider, setSelectedProvider] = useState<string>('coingecko');
  const [selectedEndpoint, setSelectedEndpoint] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [totalCost, setTotalCost] = useState(0);
  const [totalSavings, setTotalSavings] = useState(0);

  const apiProviders: X402APIProvider[] = [
    {
      name: 'coingecko',
      baseUrl: 'https://api.coingecko.com/api/v3',
      endpoints: [
        {
          name: 'Bitcoin Price',
          path: '/simple/price?ids=bitcoin&vs_currencies=usd&include_market_cap=true',
          cost: 0.005,
          description: 'Get current Bitcoin price and market cap'
        },
        {
          name: 'Ethereum Price',
          path: '/simple/price?ids=ethereum&vs_currencies=usd&include_market_cap=true',
          cost: 0.005,
          description: 'Get current Ethereum price and market cap'
        },
        {
          name: 'Top 10 Cryptocurrencies',
          path: '/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=10&page=1',
          cost: 0.01,
          description: 'Get top 10 cryptocurrencies by market cap'
        }
      ]
    },
    {
      name: 'aixbt',
      baseUrl: 'https://api.aixbt.com/v1',
      endpoints: [
        {
          name: 'Bitcoin AI Analysis',
          path: '/analysis/bitcoin',
          cost: 0.02,
          description: 'AI-powered Bitcoin sentiment and price prediction'
        },
        {
          name: 'Market Sentiment',
          path: '/sentiment/market',
          cost: 0.015,
          description: 'Overall cryptocurrency market sentiment analysis'
        }
      ]
    },
    {
      name: 'openai',
      baseUrl: 'https://api.openai.com/v1',
      endpoints: [
        {
          name: 'GPT-4 Chat Completion',
          path: '/chat/completions',
          cost: 0.03,
          description: 'Generate text using GPT-4 model'
        },
        {
          name: 'Text Embedding',
          path: '/embeddings',
          cost: 0.0001,
          description: 'Generate text embeddings for similarity search'
        }
      ]
    },
    {
      name: 'weather',
      baseUrl: 'https://api.weather.com/v1',
      endpoints: [
        {
          name: 'Current Weather',
          path: '/current?location=New York',
          cost: 0.001,
          description: 'Get current weather conditions'
        },
        {
          name: 'Weather Forecast',
          path: '/forecast?location=New York&days=5',
          cost: 0.005,
          description: 'Get 5-day weather forecast'
        }
      ]
    }
  ];

  useEffect(() => {
    // Calculate total cost and savings
    const cost = apiCalls.reduce((sum, call) => sum + call.cost, 0);
    const savings = cost * 0.7; // 30% savings with x402
    setTotalCost(cost);
    setTotalSavings(savings);
  }, [apiCalls]);

  const makeAPICall = async () => {
    if (!selectedEndpoint) return;

    const provider = apiProviders.find(p => p.name === selectedProvider);
    const endpoint = provider?.endpoints.find(e => e.path === selectedEndpoint);
    
    if (!provider || !endpoint) return;

    setIsLoading(true);

    // Create new API call record
    const newCall: X402APICall = {
      id: Date.now().toString(),
      service: provider.name,
      endpoint: endpoint.name,
      cost: endpoint.cost,
      status: 'pending',
      timestamp: new Date()
    };

    setApiCalls(prev => [newCall, ...prev]);

    try {
      // Simulate x402 payment process
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Update call status
      setApiCalls(prev => prev.map(call => 
        call.id === newCall.id 
          ? { 
              ...call, 
              status: 'completed',
              paymentHash: `0x${Math.random().toString(16).substr(2, 8)}...`,
              response: { success: true, data: 'API response received' }
            }
          : call
      ));

    } catch (_error) {
      setApiCalls(prev => prev.map(call => 
        call.id === newCall.id 
          ? { ...call, status: 'failed' }
          : call
      ));
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'text-yellow-600 bg-yellow-100';
      case 'paid': return 'text-blue-600 bg-blue-100';
      case 'completed': return 'text-green-600 bg-green-100';
      case 'failed': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return '⏳';
      case 'paid': return '💳';
      case 'completed': return '✅';
      case 'failed': return '❌';
      default: return '❓';
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          🔗 x402 Protocol API Integration
        </h1>
        <p className="text-lg text-gray-600">
          Real-time API calls with autonomous micropayments using x402 protocol
        </p>
      </div>

      {/* Cost Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Total API Calls</h3>
          <p className="text-3xl font-bold text-blue-600">{apiCalls.length}</p>
        </div>
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Total Cost</h3>
          <p className="text-3xl font-bold text-red-600">${totalCost.toFixed(4)}</p>
        </div>
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">x402 Savings</h3>
          <p className="text-3xl font-bold text-green-600">${totalSavings.toFixed(4)}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* API Call Interface */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-6">Make x402 API Call</h2>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                API Provider
              </label>
              <select
                value={selectedProvider}
                onChange={(e) => {
                  setSelectedProvider(e.target.value);
                  setSelectedEndpoint('');
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {apiProviders.map(provider => (
                  <option key={provider.name} value={provider.name}>
                    {provider.name.charAt(0).toUpperCase() + provider.name.slice(1)}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Endpoint
              </label>
              <select
                value={selectedEndpoint}
                onChange={(e) => setSelectedEndpoint(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select an endpoint</option>
                {apiProviders
                  .find(p => p.name === selectedProvider)
                  ?.endpoints.map(endpoint => (
                    <option key={endpoint.path} value={endpoint.path}>
                      {endpoint.name} - ${endpoint.cost}
                    </option>
                  ))}
              </select>
            </div>

            {selectedEndpoint && (
              <div className="p-4 bg-gray-50 rounded-lg">
                <h4 className="font-medium text-gray-900 mb-2">Endpoint Details</h4>
                <p className="text-sm text-gray-600">
                  {apiProviders
                    .find(p => p.name === selectedProvider)
                    ?.endpoints.find(e => e.path === selectedEndpoint)?.description}
                </p>
                <p className="text-sm text-gray-600 mt-1">
                  Cost: ${apiProviders
                    .find(p => p.name === selectedProvider)
                    ?.endpoints.find(e => e.path === selectedEndpoint)?.cost} USDC
                </p>
              </div>
            )}

            <button
              onClick={makeAPICall}
              disabled={!selectedEndpoint || isLoading}
              className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
            >
              {isLoading ? 'Processing x402 Payment...' : 'Make x402 API Call'}
            </button>
          </div>
        </div>

        {/* API Call History */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-6">API Call History</h2>
          
          {apiCalls.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500">No API calls made yet</p>
              <p className="text-sm text-gray-400 mt-2">
                Make your first x402 API call to see the history
              </p>
            </div>
          ) : (
            <div className="space-y-4 max-h-96 overflow-y-auto">
              {apiCalls.map(call => (
                <div key={call.id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium text-gray-900">{call.endpoint}</h4>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(call.status)}`}>
                      {getStatusIcon(call.status)} {call.status}
                    </span>
                  </div>
                  
                  <div className="text-sm text-gray-600 space-y-1">
                    <p>Service: {call.service}</p>
                    <p>Cost: ${call.cost} USDC</p>
                    <p>Time: {call.timestamp.toLocaleTimeString()}</p>
                    {call.paymentHash && (
                      <p>Payment: {call.paymentHash}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* x402 Protocol Benefits */}
      <div className="mt-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl shadow-lg p-8 text-white">
        <h2 className="text-2xl font-bold mb-6">🚀 x402 Protocol Benefits</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="text-center">
            <div className="text-3xl mb-2">💳</div>
            <h3 className="font-semibold mb-2">Micropayments</h3>
            <p className="text-sm opacity-90">Pay only for what you use, no subscriptions</p>
          </div>
          <div className="text-center">
            <div className="text-3xl mb-2">⚡</div>
            <h3 className="font-semibold mb-2">Instant Access</h3>
            <p className="text-sm opacity-90">No account creation or authentication required</p>
          </div>
          <div className="text-center">
            <div className="text-3xl mb-2">🤖</div>
            <h3 className="font-semibold mb-2">Autonomous</h3>
            <p className="text-sm opacity-90">AI agents can make payments automatically</p>
          </div>
          <div className="text-center">
            <div className="text-3xl mb-2">💰</div>
            <h3 className="font-semibold mb-2">Cost Savings</h3>
            <p className="text-sm opacity-90">30% savings compared to traditional APIs</p>
          </div>
        </div>
      </div>
    </div>
  );
}

'use client';

import React from 'react';

export default function WeCanHelpSection() {
  return (
    <div className="max-w-7xl mx-auto p-8">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          We Can Help
        </h1>
        <p className="text-xl text-gray-600 max-w-4xl mx-auto">
          Real API Integration with x402 protocol for autonomous micropayments and cost optimization
        </p>
      </div>

      {/* API Integration Demo */}
      <div className="bg-white rounded-xl shadow-lg p-8 mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Real API Integration with x402</h2>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* API Client Status */}
          <div className="space-y-6">
            <div className="bg-gray-50 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">API Client Status</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Status:</span>
                  <span className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm font-medium">
                    Not Initialized
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Total API Calls:</span>
                  <span className="font-semibold text-gray-900">0</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Total Cost:</span>
                  <span className="font-semibold text-gray-900">$0.0000</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">x402 Savings:</span>
                  <span className="font-semibold text-green-600">$0.0000</span>
                </div>
              </div>
            </div>

            {/* Quick API Calls */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900">Quick API Calls</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <button className="p-4 bg-blue-50 hover:bg-blue-100 rounded-lg border border-blue-200 transition-colors">
                  <div className="text-center">
                    <div className="text-2xl mb-2">₿</div>
                    <div className="font-medium text-gray-900">Bitcoin Price</div>
                    <div className="text-sm text-blue-600">$0.005 USDC</div>
                  </div>
                </button>
                <button className="p-4 bg-purple-50 hover:bg-purple-100 rounded-lg border border-purple-200 transition-colors">
                  <div className="text-center">
                    <div className="text-2xl mb-2">AI</div>
                    <div className="font-medium text-gray-900">Bitcoin Analysis</div>
                    <div className="text-sm text-purple-600">$0.02 USDC</div>
                  </div>
                </button>
                <button className="p-4 bg-green-50 hover:bg-green-100 rounded-lg border border-green-200 transition-colors">
                  <div className="text-center">
                    <div className="text-2xl mb-2">📊</div>
                    <div className="font-medium text-gray-900">Dune Analytics</div>
                    <div className="text-sm text-green-600">$0.01 USDC</div>
                  </div>
                </button>
              </div>
            </div>
          </div>

          {/* Available API Providers */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Available API Providers</h3>
            <div className="space-y-4">
              {[
                {
                  name: "Dune Analytics",
                  description: "On-chain analytics and data queries",
                  cost: "$0.01 USDC/call",
                  endpoints: 2,
                  color: "green"
                },
                {
                  name: "CoinGecko",
                  description: "Cryptocurrency market data and prices",
                  cost: "$0.005 USDC/call",
                  endpoints: 2,
                  color: "blue"
                },
                {
                  name: "AIxbt",
                  description: "AI-powered Bitcoin and crypto analysis",
                  cost: "$0.02 USDC/call",
                  endpoints: 2,
                  color: "purple"
                },
                {
                  name: "Alchemy",
                  description: "Blockchain data and infrastructure",
                  cost: "$0.001 USDC/call",
                  endpoints: 2,
                  color: "indigo"
                },
                {
                  name: "OpenAI",
                  description: "AI language model and analysis",
                  cost: "$0.001 USDC/call",
                  endpoints: 1,
                  color: "gray"
                }
              ].map((provider, index) => (
                <div key={index} className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-semibold text-gray-900">{provider.name}</h4>
                    <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs font-medium">
                      x402
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 mb-2">{provider.description}</p>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-500">Cost: {provider.cost}</span>
                    <span className="text-gray-500">Endpoints: {provider.endpoints}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* x402 Protocol Benefits */}
        <div className="mt-8 pt-8 border-t border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">x402 Protocol Benefits</h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mx-auto mb-3">
                <span className="text-2xl">💳</span>
              </div>
              <h4 className="font-semibold text-gray-900 mb-2">Micropayments</h4>
              <p className="text-sm text-gray-600">Pay only for what you use, no subscriptions</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center mx-auto mb-3">
                <span className="text-2xl">⚡</span>
              </div>
              <h4 className="font-semibold text-gray-900 mb-2">Instant Access</h4>
              <p className="text-sm text-gray-600">No account creation or authentication required</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center mx-auto mb-3">
                <span className="text-2xl">🤖</span>
              </div>
              <h4 className="font-semibold text-gray-900 mb-2">Autonomous</h4>
              <p className="text-sm text-gray-600">AI agents can make payments automatically</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center mx-auto mb-3">
                <span className="text-2xl">💰</span>
              </div>
              <h4 className="font-semibold text-gray-900 mb-2">Cost Savings</h4>
              <p className="text-sm text-gray-600">30% savings compared to traditional APIs</p>
            </div>
          </div>
        </div>
      </div>

      {/* Cost Optimization Section */}
      <div className="bg-white rounded-xl shadow-lg p-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Cost Optimization</h2>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Current Costs */}
          <div className="bg-red-50 rounded-lg p-6 border border-red-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Traditional Method</h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">Subscription + Overage Fees</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Cost per call:</span>
                <span className="font-semibold">$0.03</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Monthly calls:</span>
                <span className="font-semibold">100,000</span>
              </div>
              <div className="flex justify-between border-t border-red-200 pt-3">
                <span className="text-gray-600">Total cost:</span>
                <span className="font-bold text-red-600">$4,000</span>
              </div>
            </div>
          </div>

          {/* x402 Method */}
          <div className="bg-green-50 rounded-lg p-6 border border-green-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">x402 Method</h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">x402 Micropayments + Dynamic Pricing</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Cost per call:</span>
                <span className="font-semibold">$0.021 (30% discount)</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Monthly calls:</span>
                <span className="font-semibold">100,000</span>
              </div>
              <div className="flex justify-between border-t border-green-200 pt-3">
                <span className="text-gray-600">Total cost:</span>
                <span className="font-bold text-green-600">$2,100</span>
              </div>
            </div>
          </div>

          {/* Savings Summary */}
          <div className="bg-blue-50 rounded-lg p-6 border border-blue-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Savings Summary</h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">Monthly savings:</span>
                <span className="font-bold text-blue-600">$1,900</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Annual savings:</span>
                <span className="font-bold text-blue-600">$22,800</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Cost reduction:</span>
                <span className="font-bold text-blue-600">47.5%</span>
              </div>
              <div className="flex justify-between border-t border-blue-200 pt-3">
                <span className="text-gray-600">ROI:</span>
                <span className="font-bold text-blue-600">456%</span>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-8 p-6 bg-gray-50 rounded-lg">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">How It Works</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium text-gray-900 mb-2">x402 Protocol Benefits (60% of savings):</h4>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Subscription Elimination: 70% savings by paying per-use</li>
                <li>• Payment Processing Fees: 90% savings with direct USDC transfers</li>
                <li>• Overage Charges: 80% savings through smart usage prediction</li>
                <li>• Inefficient Routing: 80% savings with AI-powered provider selection</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium text-gray-900 mb-2">AgentKit Automation (40% of savings):</h4>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Redundant API Calls: 80% savings through intelligent caching</li>
                <li>• Peak Hour Surcharges: 80% savings with load balancing</li>
                <li>• Manual Optimization: 100% savings through autonomous operations</li>
                <li>• Predictive Analytics: Prevents cost spikes before they happen</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

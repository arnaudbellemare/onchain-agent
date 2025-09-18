'use client';

import React, { useState } from 'react';

interface CostBreakdown {
  traditional: {
    subscription: number;
    overage: number;
    processing: number;
    total: number;
  };
  x402: {
    baseCost: number;
    discount: number;
    processing: number;
    total: number;
  };
}

export default function CostReductionExplanation() {
  const [activeTab, setActiveTab] = useState<'overview' | 'breakdown' | 'comparison'>('overview');

  const costBreakdown: CostBreakdown = {
    traditional: {
      subscription: 0.02, // Base API cost
      overage: 0.01, // Additional fees for high usage
      processing: 0.0029, // Payment processing fees (2.9%)
      total: 0.0329
    },
    x402: {
      baseCost: 0.02, // Same base API cost
      discount: -0.006, // 30% discount from provider
      processing: 0.0001, // Minimal x402 processing fee
      total: 0.0141
    }
  };

  const savings = costBreakdown.traditional.total - costBreakdown.x402.total;
  const savingsPercentage = (savings / costBreakdown.traditional.total) * 100;

  return (
    <div className="max-w-6xl mx-auto p-8">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          How We Pay Less Than Standard GPT Prices
        </h1>
        <p className="text-xl text-gray-900 max-w-4xl mx-auto">
          The x402 protocol eliminates subscription overhead and payment processing fees, while AI optimization reduces actual usage costs
        </p>
      </div>

      {/* Tab Navigation */}
      <div className="flex justify-center mb-8">
        <div className="bg-gray-100 p-1 rounded-lg">
          {[
            { id: 'overview', label: 'Overview', icon: '📊' },
            { id: 'breakdown', label: 'Cost Breakdown', icon: '💰' },
            { id: 'comparison', label: 'Side-by-Side', icon: '⚖️' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as 'overview' | 'breakdown' | 'comparison')}
              className={`px-6 py-3 rounded-lg font-medium transition-all ${
                activeTab === tab.id
                  ? 'bg-blue-600 text-white shadow-lg'
                  : 'text-gray-900 hover:bg-blue-50'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Overview Tab */}
      {activeTab === 'overview' && (
        <div className="space-y-8">
          <div className="bg-gradient-to-r from-blue-50 to-green-50 rounded-2xl p-8 border border-blue-200">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">Why x402 Costs Less</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="w-16 h-16 bg-red-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No Subscription Fees</h3>
                <p className="text-gray-900 text-sm">
                  Traditional APIs charge monthly subscriptions even for unused capacity. x402 only charges for actual usage.
                </p>
              </div>

              <div className="text-center">
                <div className="w-16 h-16 bg-green-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Direct Provider Access</h3>
                <p className="text-gray-900 text-sm">
                  x402 connects directly to providers, eliminating middleman fees and enabling bulk pricing discounts.
                </p>
              </div>

              <div className="text-center">
                <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">AI Optimization</h3>
                <p className="text-gray-900 text-sm">
                  Smart caching and request optimization reduce actual API calls by 80%, further lowering costs.
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-8 shadow-lg border border-gray-200">
            <h3 className="text-xl font-bold text-gray-900 mb-6">Real Example: GPT-4 API Call</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="bg-red-50 p-6 rounded-xl border border-red-200">
                <h4 className="text-lg font-semibold text-red-800 mb-4">Traditional Method</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Base API Cost:</span>
                    <span>$0.03</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Payment Processing (2.9%):</span>
                    <span>$0.0009</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Platform Fees:</span>
                    <span>$0.002</span>
                  </div>
                  <div className="flex justify-between border-t border-red-200 pt-2 font-semibold">
                    <span>Total Cost:</span>
                    <span>$0.0329</span>
                  </div>
                </div>
              </div>

              <div className="bg-green-50 p-6 rounded-xl border border-green-200">
                <h4 className="text-lg font-semibold text-green-800 mb-4">x402 Method</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Base API Cost:</span>
                    <span>$0.03</span>
                  </div>
                  <div className="flex justify-between text-green-600">
                    <span>Provider Discount (30%):</span>
                    <span>-$0.009</span>
                  </div>
                  <div className="flex justify-between">
                    <span>x402 Processing (0.1%):</span>
                    <span>$0.0001</span>
                  </div>
                  <div className="flex justify-between border-t border-green-200 pt-2 font-semibold">
                    <span>Total Cost:</span>
                    <span>$0.0211</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-6 text-center">
              <div className="text-2xl font-bold text-green-600 mb-2">
                ${savings.toFixed(4)} Savings per Call
              </div>
              <div className="text-lg text-gray-900">
                {savingsPercentage.toFixed(1)}% Cost Reduction
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Cost Breakdown Tab */}
      {activeTab === 'breakdown' && (
        <div className="space-y-8">
          <div className="bg-white rounded-2xl p-8 shadow-lg border border-gray-200">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Detailed Cost Breakdown</h2>
            
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Traditional API Pricing</h3>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Monthly Subscription:</span>
                      <span>$20/month (minimum)</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Per-Request Cost:</span>
                      <span>$0.03</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Overage Fees:</span>
                      <span>$0.01 per request</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Payment Processing:</span>
                      <span>2.9% + $0.30</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Platform Fees:</span>
                      <span>5-10% markup</span>
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">x402 Protocol Pricing</h3>
                <div className="bg-green-50 p-4 rounded-lg">
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>No Subscription:</span>
                      <span>$0/month</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Direct Provider Rate:</span>
                      <span>$0.03</span>
                    </div>
                    <div className="flex justify-between text-green-600">
                      <span>Volume Discount:</span>
                      <span>Up to 30% off</span>
                    </div>
                    <div className="flex justify-between">
                      <span>x402 Processing:</span>
                      <span>0.1% per transaction</span>
                    </div>
                    <div className="flex justify-between">
                      <span>No Platform Fees:</span>
                      <span>$0</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-blue-50 rounded-2xl p-8 border border-blue-200">
            <h3 className="text-xl font-bold text-gray-900 mb-4">How We Achieve Lower Costs</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-semibold text-gray-900 mb-3">Direct Provider Relationships</h4>
                <ul className="space-y-2 text-sm text-gray-900">
                  <li>• Negotiate bulk pricing with API providers</li>
                  <li>• Eliminate middleman markups</li>
                  <li>• Access enterprise pricing tiers</li>
                  <li>• Secure volume discounts</li>
                </ul>
              </div>
              
              <div>
                <h4 className="font-semibold text-gray-900 mb-3">AI-Powered Optimization</h4>
                <ul className="space-y-2 text-sm text-gray-900">
                  <li>• Smart caching reduces redundant calls</li>
                  <li>• Request batching optimizes usage</li>
                  <li>• Predictive loading prevents waste</li>
                  <li>• Intelligent routing finds best prices</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Comparison Tab */}
      {activeTab === 'comparison' && (
        <div className="space-y-8">
          <div className="bg-white rounded-2xl p-8 shadow-lg border border-gray-200">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Side-by-Side Comparison</h2>
            
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-4 font-semibold text-gray-900">Cost Component</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-900">Traditional</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-900">x402 Protocol</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-900">Savings</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  <tr>
                    <td className="py-3 px-4 text-gray-900">Base API Cost</td>
                    <td className="py-3 px-4 text-gray-900">$0.03</td>
                    <td className="py-3 px-4 text-gray-900">$0.03</td>
                    <td className="py-3 px-4 text-gray-500">$0.00</td>
                  </tr>
                  <tr>
                    <td className="py-3 px-4 text-gray-900">Provider Discount</td>
                    <td className="py-3 px-4 text-gray-500">None</td>
                    <td className="py-3 px-4 text-green-600">-$0.009 (30%)</td>
                    <td className="py-3 px-4 text-green-600">$0.009</td>
                  </tr>
                  <tr>
                    <td className="py-3 px-4 text-gray-900">Payment Processing</td>
                    <td className="py-3 px-4 text-gray-900">$0.0009 (2.9%)</td>
                    <td className="py-3 px-4 text-gray-900">$0.0001 (0.1%)</td>
                    <td className="py-3 px-4 text-green-600">$0.0008</td>
                  </tr>
                  <tr>
                    <td className="py-3 px-4 text-gray-900">Platform Fees</td>
                    <td className="py-3 px-4 text-gray-900">$0.002</td>
                    <td className="py-3 px-4 text-gray-500">$0.00</td>
                    <td className="py-3 px-4 text-green-600">$0.002</td>
                  </tr>
                  <tr className="bg-gray-50 font-semibold">
                    <td className="py-3 px-4 text-gray-900">Total Cost</td>
                    <td className="py-3 px-4 text-gray-900">$0.0329</td>
                    <td className="py-3 px-4 text-gray-900">$0.0211</td>
                    <td className="py-3 px-4 text-green-600">$0.0118</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-red-50 rounded-2xl p-6 border border-red-200">
              <h3 className="text-lg font-semibold text-red-800 mb-4">Why Traditional Costs More</h3>
              <ul className="space-y-2 text-sm text-gray-900">
                <li>• Subscription fees for unused capacity</li>
                <li>• Multiple middleman markups</li>
                <li>• High payment processing fees</li>
                <li>• Platform and service fees</li>
                <li>• No volume discounts for small users</li>
                <li>• Inefficient usage patterns</li>
              </ul>
            </div>

            <div className="bg-green-50 rounded-2xl p-6 border border-green-200">
              <h3 className="text-lg font-semibold text-green-800 mb-4">Why x402 Costs Less</h3>
              <ul className="space-y-2 text-sm text-gray-900">
                <li>• Pay only for what you use</li>
                <li>• Direct provider relationships</li>
                <li>• Minimal processing fees (0.1%)</li>
                <li>• No platform or service fees</li>
                <li>• Volume discounts for all users</li>
                <li>• AI optimization reduces usage</li>
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

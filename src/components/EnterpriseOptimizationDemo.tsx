'use client';

import React, { useState, useEffect } from 'react';
import ROICalculator from './ROICalculator';

interface OptimizationData {
  breakdown: {
    scenario: string;
    currentMonthlyCost: number;
    x402Savings: number;
    agentKitSavings: number;
    totalSavings: number;
    finalCost: number;
    optimizationPercent: number;
  };
  granular: {
    traditionalMethod: string;
    x402Method: string;
    costPerCall: number;
    monthlyCalls: number;
    traditionalCost: number;
    x402Cost: number;
    savings: number;
  };
  autonomous: Array<{
    optimization: string;
    trigger: string;
    action: string;
    result: string;
    humanIntervention: boolean;
  }>;
  categories: Array<{
    category: string;
    currentCost: number;
    optimizationMethod: string;
    savings: number;
    savingsPercent: number;
    automation: boolean;
  }>;
}

export default function EnterpriseOptimizationDemo() {
  const [data, setData] = useState<OptimizationData | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'breakdown' | 'autonomous' | 'integration' | 'roi'>('overview');

  useEffect(() => {
    fetchOptimizationData();
  }, []);

  const fetchOptimizationData = async () => {
    try {
      const response = await fetch('/api/optimization/demo');
      const result = await response.json();
      if (result.success) {
        setData(result.data);
      }
    } catch (error) {
      console.error('Error fetching optimization data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading optimization data...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center">
            <p className="text-red-600">Failed to load optimization data</p>
          </div>
        </div>
      </div>
    );
  }

  const { breakdown, granular, autonomous, categories } = data;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            🚀 Enterprise Cost Optimization Demo
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            See how x402 protocol + AgentKit can achieve <span className="font-bold text-green-600">90% API cost reduction</span> 
            through autonomous optimization and granular cost tracking
          </p>
        </div>

        {/* Navigation Tabs */}
        <div className="flex flex-wrap justify-center mb-8">
          {[
            { id: 'overview', label: '📊 Overview', icon: '📊' },
            { id: 'breakdown', label: '💰 Cost Breakdown', icon: '💰' },
            { id: 'autonomous', label: '🤖 Autonomous', icon: '🤖' },
            { id: 'integration', label: '🔗 Integration', icon: '🔗' },
            { id: 'roi', label: '📈 ROI Calculator', icon: '📈' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as 'overview' | 'breakdown' | 'autonomous' | 'integration' | 'roi')}
              className={`px-6 py-3 m-2 rounded-lg font-medium transition-all ${
                activeTab === tab.id
                  ? 'bg-blue-600 text-white shadow-lg'
                  : 'bg-white text-gray-700 hover:bg-blue-50'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="grid md:grid-cols-2 gap-8">
            {/* Key Metrics */}
            <div className="bg-white rounded-xl shadow-lg p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">📊 Key Metrics</h2>
              <div className="space-y-4">
                <div className="flex justify-between items-center p-4 bg-red-50 rounded-lg">
                  <span className="text-gray-900">Current Monthly Cost</span>
                  <span className="text-2xl font-bold text-red-600">
                    ${breakdown.currentMonthlyCost.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between items-center p-4 bg-green-50 rounded-lg">
                  <span className="text-gray-900">Optimized Cost</span>
                  <span className="text-2xl font-bold text-green-600">
                    ${breakdown.finalCost.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between items-center p-4 bg-blue-50 rounded-lg">
                  <span className="text-gray-900">Total Savings</span>
                  <span className="text-2xl font-bold text-blue-600">
                    ${breakdown.totalSavings.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between items-center p-4 bg-purple-50 rounded-lg">
                  <span className="text-gray-900">Optimization %</span>
                  <span className="text-2xl font-bold text-purple-600">
                    {breakdown.optimizationPercent.toFixed(1)}%
                  </span>
                </div>
              </div>
            </div>

            {/* Savings Breakdown */}
            <div className="bg-white rounded-xl shadow-lg p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">💡 Savings Breakdown</h2>
              <div className="space-y-4">
                <div className="flex justify-between items-center p-4 bg-blue-50 rounded-lg">
                  <span className="text-gray-900">x402 Protocol Savings</span>
                  <span className="text-xl font-bold text-blue-600">
                    ${breakdown.x402Savings.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between items-center p-4 bg-green-50 rounded-lg">
                  <span className="text-gray-900">AgentKit Automation</span>
                  <span className="text-xl font-bold text-green-600">
                    ${breakdown.agentKitSavings.toLocaleString()}
                  </span>
                </div>
              </div>
              <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-600">
                  <strong>How it works:</strong> x402 protocol enables granular cost tracking and micropayments, 
                  while AgentKit provides autonomous optimization without human intervention.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Cost Breakdown Tab */}
        {activeTab === 'breakdown' && (
          <div className="space-y-8">
            {/* Granular Tracking Comparison */}
            <div className="bg-white rounded-xl shadow-lg p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">🔍 Granular Cost Tracking</h2>
              <div className="grid md:grid-cols-2 gap-8">
                <div className="p-6 bg-red-50 rounded-lg">
                  <h3 className="text-lg font-semibold text-red-800 mb-4">Traditional Method</h3>
                  <p className="text-red-700 mb-2">{granular.traditionalMethod}</p>
                  <div className="space-y-2">
                    <p className="text-gray-900"><strong>Cost per call:</strong> ${granular.costPerCall}</p>
                    <p className="text-gray-900"><strong>Monthly calls:</strong> {granular.monthlyCalls.toLocaleString()}</p>
                    <p className="text-gray-900"><strong>Total cost:</strong> <span className="text-xl font-bold">${granular.traditionalCost.toLocaleString()}</span></p>
                  </div>
                </div>
                <div className="p-6 bg-green-50 rounded-lg">
                  <h3 className="text-lg font-semibold text-green-800 mb-4">x402 Method</h3>
                  <p className="text-green-700 mb-2">{granular.x402Method}</p>
                  <div className="space-y-2">
                    <p className="text-gray-900"><strong>Cost per call:</strong> ${(granular.costPerCall * 0.7).toFixed(3)} (30% discount)</p>
                    <p className="text-gray-900"><strong>Monthly calls:</strong> {granular.monthlyCalls.toLocaleString()}</p>
                    <p className="text-gray-900"><strong>Total cost:</strong> <span className="text-xl font-bold">${granular.x402Cost.toLocaleString()}</span></p>
                  </div>
                </div>
              </div>
              <div className="mt-6 p-4 bg-blue-50 rounded-lg text-center">
                <p className="text-xl font-bold text-blue-800">
                  💰 Monthly Savings: ${granular.savings.toLocaleString()}
                </p>
              </div>
            </div>

            {/* Optimization Categories */}
            <div className="bg-white rounded-xl shadow-lg p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">📈 Optimization Categories</h2>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {categories.map((category, index) => (
                  <div key={index} className="p-6 bg-gray-50 rounded-lg">
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">{category.category}</h3>
                    <div className="space-y-2">
                      <p className="text-gray-900"><strong>Current:</strong> ${category.currentCost.toLocaleString()}</p>
                      <p className="text-gray-900"><strong>Method:</strong> {category.optimizationMethod}</p>
                      <p className="text-gray-900"><strong>Savings:</strong> <span className="text-green-600 font-bold">${category.savings.toLocaleString()}</span></p>
                      <p className="text-gray-900"><strong>% Reduction:</strong> <span className="text-blue-600 font-bold">{category.savingsPercent}%</span></p>
                      <p className="text-gray-900"><strong>Automated:</strong> {category.automation ? '✅ Yes' : '❌ No'}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Autonomous Tab */}
        {activeTab === 'autonomous' && (
          <div className="bg-white rounded-xl shadow-lg p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">🤖 Autonomous Optimization Examples</h2>
            <div className="space-y-6">
              {autonomous.map((example, index) => (
                <div key={index} className="p-6 bg-gray-50 rounded-lg">
                  <div className="flex items-start justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-900">{example.optimization}</h3>
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                      example.humanIntervention 
                        ? 'bg-red-100 text-red-800' 
                        : 'bg-green-100 text-green-800'
                    }`}>
                      {example.humanIntervention ? 'Human Required' : 'Fully Automated'}
                    </span>
                  </div>
                  <div className="grid md:grid-cols-3 gap-4">
                    <div>
                      <p className="text-sm font-medium text-gray-900 mb-1">Trigger</p>
                      <p className="text-gray-900">{example.trigger}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900 mb-1">Action</p>
                      <p className="text-gray-900">{example.action}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900 mb-1">Result</p>
                      <p className="text-gray-900">{example.result}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Integration Tab */}
        {activeTab === 'integration' && (
          <div className="space-y-8">
            {/* Integration Benefits */}
            <div className="bg-white rounded-xl shadow-lg p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">🔗 Integration Benefits</h2>
              <div className="grid md:grid-cols-2 gap-8">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">x402 Protocol Benefits</h3>
                  <ul className="space-y-2 text-gray-900">
                    <li>✅ Granular per-call cost tracking</li>
                    <li>✅ Real-time price discovery</li>
                    <li>✅ Direct USDC payments</li>
                    <li>✅ Eliminates payment processing fees</li>
                    <li>✅ Dynamic pricing negotiation</li>
                  </ul>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">AgentKit Automation Benefits</h3>
                  <ul className="space-y-2 text-gray-900">
                    <li>✅ 24/7 autonomous optimization</li>
                    <li>✅ Predictive cost management</li>
                    <li>✅ Smart provider routing</li>
                    <li>✅ Intelligent caching</li>
                    <li>✅ Dynamic load balancing</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* API Endpoints */}
            <div className="bg-white rounded-xl shadow-lg p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">🛠️ API Endpoints</h2>
              <div className="space-y-4">
                <div className="p-4 bg-gray-50 rounded-lg">
                  <code className="text-sm text-blue-600">GET /api/optimization/demo?type=breakdown</code>
                  <p className="text-sm text-gray-900 mt-1">Returns 90% optimization breakdown with real numbers</p>
                </div>
                <div className="p-4 bg-gray-50 rounded-lg">
                  <code className="text-sm text-blue-600">GET /api/optimization/demo?type=autonomous</code>
                  <p className="text-sm text-gray-900 mt-1">Returns autonomous optimization examples</p>
                </div>
                <div className="p-4 bg-gray-50 rounded-lg">
                  <code className="text-sm text-blue-600">GET /api/payments/analytics</code>
                  <p className="text-sm text-gray-900 mt-1">Returns current cost analytics and optimization opportunities</p>
                </div>
              </div>
            </div>

            {/* Call to Action */}
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl shadow-lg p-8 text-white text-center">
              <h2 className="text-2xl font-bold mb-4">Ready to Save 90% on API Costs?</h2>
              <p className="text-lg mb-6">
                This integration demonstrates how x402 protocol + AgentKit can transform your API cost management 
                from a manual, expensive process into an autonomous, highly optimized system.
              </p>
              <div className="flex flex-wrap justify-center gap-4">
                <button className="px-6 py-3 bg-white text-blue-600 rounded-lg font-semibold hover:bg-gray-100 transition-colors">
                  Schedule Integration Call
                </button>
                <button className="px-6 py-3 bg-transparent border-2 border-white text-white rounded-lg font-semibold hover:bg-white hover:text-blue-600 transition-colors">
                  Start 30-Day Pilot
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ROI Calculator Tab */}
        {activeTab === 'roi' && (
          <ROICalculator />
        )}
      </div>
    </div>
  );
}

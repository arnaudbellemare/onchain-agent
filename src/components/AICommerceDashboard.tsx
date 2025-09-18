"use client";

import { useState, useEffect } from 'react';
import { fraudDetectionEngine } from '@/lib/fraudDetection';
import { approvalWorkflowEngine } from '@/lib/approvalWorkflows';
import { predictiveAnalyticsEngine } from '@/lib/predictiveAnalytics';
import { ecommerceIntegrationManager } from '@/lib/ecommerceIntegrations';
import { autonomousOperationsEngine } from '@/lib/autonomousOperations';

interface DashboardMetrics {
  fraudDetection: {
    totalTransactions: number;
    blockedTransactions: number;
    highRiskTransactions: number;
    averageRiskScore: number;
  };
  approvalWorkflows: {
    totalRequests: number;
    pendingRequests: number;
    approvedRequests: number;
    rejectedRequests: number;
    averageApprovalTime: number;
  };
  predictiveAnalytics: {
    businessHealthScore: number;
    businessHealthGrade: string;
    cashFlowForecast: Record<string, unknown>[];
    optimizationRecommendations: Record<string, unknown>[];
  };
  ecommerceIntegrations: {
    totalRevenue: number;
    platformBreakdown: Record<string, number>;
    topProducts: Record<string, unknown>[];
    paymentMethodBreakdown: Record<string, number>;
  };
  autonomousOperations: {
    totalRules: number;
    activeRules: number;
    totalExecutions: number;
    successRate: number;
    averageExecutionTime: number;
  };
}

export default function AICommerceDashboard() {
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    loadDashboardMetrics();
    
    // Refresh metrics every 30 seconds
    const interval = setInterval(loadDashboardMetrics, 30000);
    return () => clearInterval(interval);
  }, []);

  const loadDashboardMetrics = async () => {
    try {
      setLoading(true);
      
      // Load all metrics in parallel
      const [
        fraudStats,
        approvalStats,
        businessHealth,
        cashFlowForecast,
        optimizationRecommendations,
        ecommerceAnalytics,
        executionStats
      ] = await Promise.all([
        fraudDetectionEngine.getFraudStats(),
        approvalWorkflowEngine.getApprovalStats(),
        predictiveAnalyticsEngine.calculateBusinessHealthScore(),
        predictiveAnalyticsEngine.generateCashFlowForecast(30),
        predictiveAnalyticsEngine.generateOptimizationRecommendations(),
        ecommerceIntegrationManager.getMultiChannelAnalytics(),
        autonomousOperationsEngine.getExecutionStats()
      ]);

      setMetrics({
        fraudDetection: fraudStats,
        approvalWorkflows: approvalStats,
        predictiveAnalytics: {
          businessHealthScore: businessHealth.score,
          businessHealthGrade: businessHealth.grade,
          cashFlowForecast,
          optimizationRecommendations
        },
        ecommerceIntegrations: ecommerceAnalytics,
        autonomousOperations: executionStats
      });
    } catch (error) {
      console.error('Failed to load dashboard metrics:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-white border border-gray-200 rounded-2xl p-8">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-6"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="h-32 bg-gray-200 rounded-xl"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!metrics) {
    return (
      <div className="bg-white border border-gray-200 rounded-2xl p-8">
        <div className="text-center">
          <div className="text-red-500 text-xl mb-4">❌</div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Failed to Load Dashboard</h3>
          <p className="text-gray-600 mb-4">Unable to load AI Commerce Dashboard metrics</p>
          <button
            onClick={loadDashboardMetrics}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white border border-gray-200 rounded-2xl p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-3xl font-bold text-gray-900">AI Commerce Dashboard</h2>
          <p className="text-gray-600 mt-2">Seamless AI-powered business operations and autonomous decision-making</p>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
          <span className="text-sm font-medium text-gray-700">AI Systems Active</span>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex space-x-1 mb-8 bg-gray-100 p-1 rounded-lg">
        {[
          { id: 'overview', label: 'Overview' },
          { id: 'fraud', label: 'Fraud Detection' },
          { id: 'approvals', label: 'Approval Workflows' },
          { id: 'analytics', label: 'Predictive Analytics' },
          { id: 'ecommerce', label: 'E-commerce' },
          { id: 'autonomous', label: 'Autonomous Ops' }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              activeTab === tab.id
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Overview Tab */}
      {activeTab === 'overview' && (
        <div className="space-y-8">
          {/* Key Metrics Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200 rounded-xl p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-600 text-sm font-medium">Business Health</p>
                  <p className="text-3xl font-bold text-blue-900">{metrics.predictiveAnalytics.businessHealthScore}%</p>
                  <p className="text-blue-700 text-sm">Grade: {metrics.predictiveAnalytics.businessHealthGrade}</p>
                </div>
                <div className="w-12 h-12 bg-blue-500 rounded-lg flex items-center justify-center">
                  <span className="text-white text-xl">📊</span>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-green-50 to-green-100 border border-green-200 rounded-xl p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-green-600 text-sm font-medium">E-commerce Revenue</p>
                  <p className="text-3xl font-bold text-green-900">${metrics.ecommerceIntegrations.totalRevenue.toLocaleString()}</p>
                  <p className="text-green-700 text-sm">Multi-channel sales</p>
                </div>
                <div className="w-12 h-12 bg-green-500 rounded-lg flex items-center justify-center">
                  <span className="text-white text-xl">💰</span>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-purple-50 to-purple-100 border border-purple-200 rounded-xl p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-purple-600 text-sm font-medium">Autonomous Rules</p>
                  <p className="text-3xl font-bold text-purple-900">{metrics.autonomousOperations.activeRules}</p>
                  <p className="text-purple-700 text-sm">{metrics.autonomousOperations.successRate.toFixed(1)}% success rate</p>
                </div>
                <div className="w-12 h-12 bg-purple-500 rounded-lg flex items-center justify-center">
                  <span className="text-white text-xl">🤖</span>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-red-50 to-red-100 border border-red-200 rounded-xl p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-red-600 text-sm font-medium">Fraud Prevention</p>
                  <p className="text-3xl font-bold text-red-900">{metrics.fraudDetection.blockedTransactions}</p>
                  <p className="text-red-700 text-sm">Transactions blocked</p>
                </div>
                <div className="w-12 h-12 bg-red-500 rounded-lg flex items-center justify-center">
                  <span className="text-white text-xl">🛡️</span>
                </div>
              </div>
            </div>
          </div>

          {/* AI-Powered Workflows */}
          <div className="bg-gray-50 border border-gray-200 rounded-xl p-6">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">AI-Powered Workflows</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="bg-white border border-gray-200 rounded-lg p-4">
                <div className="flex items-center space-x-3 mb-2">
                  <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
                    <span className="text-white text-sm">🧠</span>
                  </div>
                  <h4 className="font-medium text-gray-900">Intelligent Payment Routing</h4>
                </div>
                <p className="text-sm text-gray-600">AI automatically selects optimal payment methods and timing</p>
              </div>

              <div className="bg-white border border-gray-200 rounded-lg p-4">
                <div className="flex items-center space-x-3 mb-2">
                  <div className="w-8 h-8 bg-green-500 rounded-lg flex items-center justify-center">
                    <span className="text-white text-sm">⚡</span>
                  </div>
                  <h4 className="font-medium text-gray-900">Automated Approval Chains</h4>
                </div>
                <p className="text-sm text-gray-600">Smart workflows route approvals based on risk and amount</p>
              </div>

              <div className="bg-white border border-gray-200 rounded-lg p-4">
                <div className="flex items-center space-x-3 mb-2">
                  <div className="w-8 h-8 bg-purple-500 rounded-lg flex items-center justify-center">
                    <span className="text-white text-sm">🔍</span>
                  </div>
                  <h4 className="font-medium text-gray-900">Smart Fraud Detection</h4>
                </div>
                <p className="text-sm text-gray-600">AI analyzes patterns to prevent fraudulent transactions</p>
              </div>

              <div className="bg-white border border-gray-200 rounded-lg p-4">
                <div className="flex items-center space-x-3 mb-2">
                  <div className="w-8 h-8 bg-yellow-500 rounded-lg flex items-center justify-center">
                    <span className="text-white text-sm">📈</span>
                  </div>
                  <h4 className="font-medium text-gray-900">Predictive Cash Flow</h4>
                </div>
                <p className="text-sm text-gray-600">ML models predict and optimize cash flow management</p>
              </div>

              <div className="bg-white border border-gray-200 rounded-lg p-4">
                <div className="flex items-center space-x-3 mb-2">
                  <div className="w-8 h-8 bg-indigo-500 rounded-lg flex items-center justify-center">
                    <span className="text-white text-sm">🛒</span>
                  </div>
                  <h4 className="font-medium text-gray-900">E-commerce Integration</h4>
                </div>
                <p className="text-sm text-gray-600">Seamless multi-channel commerce with inventory sync</p>
              </div>

              <div className="bg-white border border-gray-200 rounded-lg p-4">
                <div className="flex items-center space-x-3 mb-2">
                  <div className="w-8 h-8 bg-pink-500 rounded-lg flex items-center justify-center">
                    <span className="text-white text-sm">🔄</span>
                  </div>
                  <h4 className="font-medium text-gray-900">Autonomous Operations</h4>
                </div>
                <p className="text-sm text-gray-600">Self-executing business logic with continuous optimization</p>
              </div>
            </div>
          </div>

          {/* Commerce Integration Examples */}
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-6">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">Commerce Integration Examples</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white border border-blue-200 rounded-lg p-4">
                <h4 className="font-semibold text-blue-900 mb-2">🔗 x402 Commerce Protocol</h4>
                <ul className="text-sm text-blue-700 space-y-1">
                  <li>• Autonomous API payments with USDC</li>
                  <li>• Machine-to-machine commerce</li>
                  <li>• Pay-per-query data services</li>
                  <li>• HTTP 402 Payment Required handling</li>
                </ul>
              </div>
              <div className="bg-white border border-green-200 rounded-lg p-4">
                <h4 className="font-semibold text-green-900 mb-2">🤖 AgentKit Commerce</h4>
                <ul className="text-sm text-green-700 space-y-1">
                  <li>• Real blockchain operations</li>
                  <li>• Automated payroll processing</li>
                  <li>• Smart contract interactions</li>
                  <li>• Multi-rail payment optimization</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Fraud Detection Tab */}
      {activeTab === 'fraud' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white border border-gray-200 rounded-lg p-4">
              <h4 className="font-medium text-gray-900 mb-2">Total Transactions</h4>
              <p className="text-2xl font-bold text-gray-900">{metrics.fraudDetection.totalTransactions.toLocaleString()}</p>
            </div>
            <div className="bg-white border border-gray-200 rounded-lg p-4">
              <h4 className="font-medium text-gray-900 mb-2">Blocked Transactions</h4>
              <p className="text-2xl font-bold text-red-600">{metrics.fraudDetection.blockedTransactions}</p>
            </div>
            <div className="bg-white border border-gray-200 rounded-lg p-4">
              <h4 className="font-medium text-gray-900 mb-2">High Risk</h4>
              <p className="text-2xl font-bold text-yellow-600">{metrics.fraudDetection.highRiskTransactions}</p>
            </div>
            <div className="bg-white border border-gray-200 rounded-lg p-4">
              <h4 className="font-medium text-gray-900 mb-2">Avg Risk Score</h4>
              <p className="text-2xl font-bold text-gray-900">{metrics.fraudDetection.averageRiskScore.toFixed(1)}</p>
            </div>
          </div>
        </div>
      )}

      {/* Approval Workflows Tab */}
      {activeTab === 'approvals' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white border border-gray-200 rounded-lg p-4">
              <h4 className="font-medium text-gray-900 mb-2">Total Requests</h4>
              <p className="text-2xl font-bold text-gray-900">{metrics.approvalWorkflows.totalRequests}</p>
            </div>
            <div className="bg-white border border-gray-200 rounded-lg p-4">
              <h4 className="font-medium text-gray-900 mb-2">Pending</h4>
              <p className="text-2xl font-bold text-yellow-600">{metrics.approvalWorkflows.pendingRequests}</p>
            </div>
            <div className="bg-white border border-gray-200 rounded-lg p-4">
              <h4 className="font-medium text-gray-900 mb-2">Approved</h4>
              <p className="text-2xl font-bold text-green-600">{metrics.approvalWorkflows.approvedRequests}</p>
            </div>
            <div className="bg-white border border-gray-200 rounded-lg p-4">
              <h4 className="font-medium text-gray-900 mb-2">Avg Time</h4>
              <p className="text-2xl font-bold text-gray-900">{metrics.approvalWorkflows.averageApprovalTime.toFixed(1)}m</p>
            </div>
          </div>
        </div>
      )}

      {/* Predictive Analytics Tab */}
      {activeTab === 'analytics' && (
        <div className="space-y-6">
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Business Health Score</h3>
            <div className="flex items-center space-x-4">
              <div className="text-4xl font-bold text-gray-900">{metrics.predictiveAnalytics.businessHealthScore}%</div>
              <div className="text-2xl font-semibold text-gray-600">Grade: {metrics.predictiveAnalytics.businessHealthGrade}</div>
            </div>
          </div>

          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Top Optimization Recommendations</h3>
            <div className="space-y-3">
              {metrics.predictiveAnalytics.optimizationRecommendations.slice(0, 5).map((rec) => (
                <div key={rec.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <h4 className="font-medium text-gray-900">{rec.title}</h4>
                    <p className="text-sm text-gray-600">{rec.description}</p>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-bold text-green-600">${rec.potentialSavings.toLocaleString()}</div>
                    <div className="text-sm text-gray-500">ROI: {rec.roi}%</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* E-commerce Tab */}
      {activeTab === 'ecommerce' && (
        <div className="space-y-6">
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Multi-Channel Revenue</h3>
            <div className="text-3xl font-bold text-gray-900 mb-2">${metrics.ecommerceIntegrations.totalRevenue.toLocaleString()}</div>
            <p className="text-gray-600">Total revenue across all platforms</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <h4 className="font-semibold text-gray-900 mb-4">Platform Breakdown</h4>
              <div className="space-y-2">
                {Object.entries(metrics.ecommerceIntegrations.platformBreakdown).map(([platform, revenue]) => (
                  <div key={platform} className="flex justify-between">
                    <span className="text-gray-600 capitalize">{platform}</span>
                    <span className="font-medium">${revenue.toLocaleString()}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <h4 className="font-semibold text-gray-900 mb-4">Top Products</h4>
              <div className="space-y-2">
                {metrics.ecommerceIntegrations.topProducts.slice(0, 5).map((product) => (
                  <div key={product.productId} className="flex justify-between">
                    <span className="text-gray-600">{product.name}</span>
                    <span className="font-medium">${product.revenue.toLocaleString()}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Autonomous Operations Tab */}
      {activeTab === 'autonomous' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white border border-gray-200 rounded-lg p-4">
              <h4 className="font-medium text-gray-900 mb-2">Total Rules</h4>
              <p className="text-2xl font-bold text-gray-900">{metrics.autonomousOperations.totalRules}</p>
            </div>
            <div className="bg-white border border-gray-200 rounded-lg p-4">
              <h4 className="font-medium text-gray-900 mb-2">Active Rules</h4>
              <p className="text-2xl font-bold text-green-600">{metrics.autonomousOperations.activeRules}</p>
            </div>
            <div className="bg-white border border-gray-200 rounded-lg p-4">
              <h4 className="font-medium text-gray-900 mb-2">Total Executions</h4>
              <p className="text-2xl font-bold text-gray-900">{metrics.autonomousOperations.totalExecutions}</p>
            </div>
            <div className="bg-white border border-gray-200 rounded-lg p-4">
              <h4 className="font-medium text-gray-900 mb-2">Success Rate</h4>
              <p className="text-2xl font-bold text-green-600">{metrics.autonomousOperations.successRate.toFixed(1)}%</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

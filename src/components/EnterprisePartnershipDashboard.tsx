"use client";

import { useState, useEffect } from 'react';
import { enterpriseCostOptimizationEngine } from '@/lib/enterpriseCostOptimization';

interface PartnershipMetrics {
  totalSavings: number;
  gpuSavings: number;
  apiSavings: number;
  integrationSavings: number;
  activePartnerships: number;
  potentialPartnerships: number;
  totalOptimizations: number;
}

export default function EnterprisePartnershipDashboard() {
  const [metrics, setMetrics] = useState<PartnershipMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    loadPartnershipMetrics();
    
    // Refresh metrics every 30 seconds
    const interval = setInterval(loadPartnershipMetrics, 30000);
    return () => clearInterval(interval);
  }, []);

  const loadPartnershipMetrics = async () => {
    try {
      setLoading(true);
      
      const report = enterpriseCostOptimizationEngine.getCostOptimizationReport();
      
      setMetrics({
        totalSavings: report.totalSavings,
        gpuSavings: report.gpuSavings,
        apiSavings: report.apiSavings,
        integrationSavings: report.integrationSavings,
        activePartnerships: report.partnershipOpportunities.filter(p => p.status === 'active').length,
        potentialPartnerships: report.partnershipOpportunities.filter(p => p.status === 'negotiating').length,
        totalOptimizations: report.topOptimizations.length
      });
    } catch (error) {
      console.error('Failed to load partnership metrics:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleGPUCostOptimization = async () => {
    try {
      const result = await enterpriseCostOptimizationEngine.optimizeGPUCosts({
        provider: 'aws',
        instanceType: 'p3.8xlarge',
        usageHours: 720,
        aiWorkloadType: 'training'
      });
      
      if (result.success) {
        alert(`✅ ${result.message}`);
        loadPartnershipMetrics();
      } else {
        alert(`❌ ${result.message}`);
      }
    } catch (error) {
      alert(`❌ Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  const handleAPICostOptimization = async () => {
    try {
      const result = await enterpriseCostOptimizationEngine.optimizeAPICosts({
        name: 'gpt-4',
        provider: 'openai',
        monthlyCalls: 100000,
        category: 'ai'
      });
      
      if (result.success) {
        alert(`✅ ${result.message}`);
        loadPartnershipMetrics();
      } else {
        alert(`❌ ${result.message}`);
      }
    } catch (error) {
      alert(`❌ Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  const handleEnterpriseAssessment = async () => {
    try {
      const result = await enterpriseCostOptimizationEngine.assessEnterpriseIntegration({
        name: 'TechCorp Inc.',
        industry: 'fintech',
        existingSystems: ['Stripe', 'OpenAI', 'AWS', 'Salesforce'],
        currentMonthlyCosts: 50000
      });
      
      if (result.success) {
        alert(`✅ ${result.message}`);
        loadPartnershipMetrics();
      } else {
        alert(`❌ ${result.message}`);
      }
    } catch (error) {
      alert(`❌ Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
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
          <p className="text-gray-600 mb-4">Unable to load Enterprise Partnership Dashboard metrics</p>
          <button
            onClick={loadPartnershipMetrics}
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
          <h2 className="text-3xl font-bold text-gray-900">Enterprise Partnership Platform</h2>
          <p className="text-gray-600 mt-2">Partnership-focused cost optimization and integration platform</p>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
          <span className="text-sm font-medium text-gray-700">Partnership Engine Active</span>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex space-x-1 mb-8 bg-gray-100 p-1 rounded-lg">
        {[
          { id: 'overview', label: 'Overview' },
          { id: 'cost-optimization', label: 'Cost Optimization' },
          { id: 'partnerships', label: 'Partnerships' },
          { id: 'integrations', label: 'Enterprise Integrations' },
          { id: 'gpu-optimization', label: 'GPU Optimization' },
          { id: 'api-optimization', label: 'API Optimization' }
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
            <div className="bg-gradient-to-br from-green-50 to-green-100 border border-green-200 rounded-xl p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-green-600 text-sm font-medium">Total Cost Savings</p>
                  <p className="text-3xl font-bold text-green-900">${metrics.totalSavings.toLocaleString()}</p>
                  <p className="text-green-700 text-sm">Monthly savings</p>
                </div>
                <div className="w-12 h-12 bg-green-500 rounded-lg flex items-center justify-center">
                  <span className="text-white text-xl">💰</span>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200 rounded-xl p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-600 text-sm font-medium">Active Partnerships</p>
                  <p className="text-3xl font-bold text-blue-900">{metrics.activePartnerships}</p>
                  <p className="text-blue-700 text-sm">Strategic alliances</p>
                </div>
                <div className="w-12 h-12 bg-blue-500 rounded-lg flex items-center justify-center">
                  <span className="text-white text-xl">🤝</span>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-purple-50 to-purple-100 border border-purple-200 rounded-xl p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-purple-600 text-sm font-medium">GPU Savings</p>
                  <p className="text-3xl font-bold text-purple-900">${metrics.gpuSavings.toLocaleString()}</p>
                  <p className="text-purple-700 text-sm">AI workload optimization</p>
                </div>
                <div className="w-12 h-12 bg-purple-500 rounded-lg flex items-center justify-center">
                  <span className="text-white text-xl">🖥️</span>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-orange-50 to-orange-100 border border-orange-200 rounded-xl p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-orange-600 text-sm font-medium">API Savings</p>
                  <p className="text-3xl font-bold text-orange-900">${metrics.apiSavings.toLocaleString()}</p>
                  <p className="text-orange-700 text-sm">x402 protocol optimization</p>
                </div>
                <div className="w-12 h-12 bg-orange-500 rounded-lg flex items-center justify-center">
                  <span className="text-white text-xl">🔗</span>
                </div>
              </div>
            </div>
          </div>

          {/* Partnership Strategy */}
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-6">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">Partnership Strategy</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white border border-blue-200 rounded-lg p-4">
                <h4 className="font-semibold text-blue-900 mb-2">🤝 Avoid Direct Competition</h4>
                <ul className="text-sm text-blue-700 space-y-1">
                  <li>• Partner with Stripe, PayPal, AWS, OpenAI</li>
                  <li>• Enhance existing systems vs. replace</li>
                  <li>• Focus on AI automation layer</li>
                  <li>• Provide cost optimization services</li>
                </ul>
              </div>
              <div className="bg-white border border-green-200 rounded-lg p-4">
                <h4 className="font-semibold text-green-900 mb-2">💰 Cost Reduction Focus</h4>
                <ul className="text-sm text-green-700 space-y-1">
                  <li>• GPU costs for AI workloads</li>
                  <li>• API costs for enterprise services</li>
                  <li>• Payment processing optimization</li>
                  <li>• Infrastructure cost reduction</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Enterprise Integration Examples */}
          <div className="bg-gray-50 border border-gray-200 rounded-xl p-6">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">Enterprise Integration Examples</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="bg-white border border-gray-200 rounded-lg p-4">
                <div className="flex items-center space-x-3 mb-2">
                  <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
                    <span className="text-white text-sm">💳</span>
                  </div>
                  <h4 className="font-medium text-gray-900">Payment Integration</h4>
                </div>
                <p className="text-sm text-gray-600">Enhance Stripe/PayPal with x402 protocol for 20-30% cost reduction</p>
              </div>

              <div className="bg-white border border-gray-200 rounded-lg p-4">
                <div className="flex items-center space-x-3 mb-2">
                  <div className="w-8 h-8 bg-green-500 rounded-lg flex items-center justify-center">
                    <span className="text-white text-sm">🤖</span>
                  </div>
                  <h4 className="font-medium text-gray-900">AI API Optimization</h4>
                </div>
                <p className="text-sm text-gray-600">Optimize OpenAI/Anthropic costs with x402 micropayments</p>
              </div>

              <div className="bg-white border border-gray-200 rounded-lg p-4">
                <div className="flex items-center space-x-3 mb-2">
                  <div className="w-8 h-8 bg-purple-500 rounded-lg flex items-center justify-center">
                    <span className="text-white text-sm">🖥️</span>
                  </div>
                  <h4 className="font-medium text-gray-900">GPU Cost Reduction</h4>
                </div>
                <p className="text-sm text-gray-600">Automate AWS/GCP GPU costs with AgentKit optimization</p>
              </div>

              <div className="bg-white border border-gray-200 rounded-lg p-4">
                <div className="flex items-center space-x-3 mb-2">
                  <div className="w-8 h-8 bg-yellow-500 rounded-lg flex items-center justify-center">
                    <span className="text-white text-sm">📊</span>
                  </div>
                  <h4 className="font-medium text-gray-900">Data API Optimization</h4>
                </div>
                <p className="text-sm text-gray-600">Reduce data service costs with smart caching and routing</p>
              </div>

              <div className="bg-white border border-gray-200 rounded-lg p-4">
                <div className="flex items-center space-x-3 mb-2">
                  <div className="w-8 h-8 bg-red-500 rounded-lg flex items-center justify-center">
                    <span className="text-white text-sm">☁️</span>
                  </div>
                  <h4 className="font-medium text-gray-900">Infrastructure Automation</h4>
                </div>
                <p className="text-sm text-gray-600">Automate cloud costs with intelligent resource management</p>
              </div>

              <div className="bg-white border border-gray-200 rounded-lg p-4">
                <div className="flex items-center space-x-3 mb-2">
                  <div className="w-8 h-8 bg-indigo-500 rounded-lg flex items-center justify-center">
                    <span className="text-white text-sm">🔄</span>
                  </div>
                  <h4 className="font-medium text-gray-900">Workflow Automation</h4>
                </div>
                <p className="text-sm text-gray-600">Automate business processes with AI-powered workflows</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Cost Optimization Tab */}
      {activeTab === 'cost-optimization' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white border border-gray-200 rounded-lg p-4">
              <h4 className="font-medium text-gray-900 mb-2">Total Savings</h4>
              <p className="text-2xl font-bold text-green-600">${metrics.totalSavings.toLocaleString()}</p>
              <p className="text-sm text-gray-500">Monthly</p>
            </div>
            <div className="bg-white border border-gray-200 rounded-lg p-4">
              <h4 className="font-medium text-gray-900 mb-2">GPU Savings</h4>
              <p className="text-2xl font-bold text-purple-600">${metrics.gpuSavings.toLocaleString()}</p>
              <p className="text-sm text-gray-500">AI workloads</p>
            </div>
            <div className="bg-white border border-gray-200 rounded-lg p-4">
              <h4 className="font-medium text-gray-900 mb-2">API Savings</h4>
              <p className="text-2xl font-bold text-orange-600">${metrics.apiSavings.toLocaleString()}</p>
              <p className="text-sm text-gray-500">x402 optimization</p>
            </div>
            <div className="bg-white border border-gray-200 rounded-lg p-4">
              <h4 className="font-medium text-gray-900 mb-2">Integration Savings</h4>
              <p className="text-2xl font-bold text-blue-600">${metrics.integrationSavings.toLocaleString()}</p>
              <p className="text-sm text-gray-500">Enterprise</p>
            </div>
          </div>
        </div>
      )}

      {/* GPU Optimization Tab */}
      {activeTab === 'gpu-optimization' && (
        <div className="space-y-6">
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">GPU Cost Optimization</h3>
            <p className="text-gray-600 mb-4">
              Optimize GPU costs for AI workloads using x402 protocol and AgentKit automation.
            </p>
            <button
              onClick={handleGPUCostOptimization}
              className="bg-purple-600 text-white px-6 py-3 rounded-lg hover:bg-purple-700 transition-colors"
            >
              Optimize GPU Costs
            </button>
          </div>
        </div>
      )}

      {/* API Optimization Tab */}
      {activeTab === 'api-optimization' && (
        <div className="space-y-6">
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">API Cost Optimization</h3>
            <p className="text-gray-600 mb-4">
              Reduce API costs using x402 protocol for micropayments and smart routing.
            </p>
            <button
              onClick={handleAPICostOptimization}
              className="bg-orange-600 text-white px-6 py-3 rounded-lg hover:bg-orange-700 transition-colors"
            >
              Optimize API Costs
            </button>
          </div>
        </div>
      )}

      {/* Enterprise Integrations Tab */}
      {activeTab === 'integrations' && (
        <div className="space-y-6">
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Enterprise Integration Assessment</h3>
            <p className="text-gray-600 mb-4">
              Assess enterprise integration opportunities and potential cost savings.
            </p>
            <button
              onClick={handleEnterpriseAssessment}
              className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Assess Enterprise Integration
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

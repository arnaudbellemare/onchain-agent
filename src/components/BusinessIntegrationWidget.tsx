'use client';

import React, { useState } from 'react';

interface IntegrationWidgetProps {
  businessType?: string;
  apiVolume?: number;
  currentCost?: number;
}

interface AssessmentResult {
  currentMonthlyCost: number;
  x402MonthlyCost: number;
  monthlySavings: number;
  annualSavings: number;
  savingsPercent: number;
  roi: number;
}

interface ROIResult {
  implementationCost: number;
  clientAnnualSavings: number;
  clientROI: number;
  paybackPeriod: number;
}

interface TrialResult {
  trialId: string;
  endDate: string;
  access: {
    dashboardUrl: string;
    apiKey: string;
    documentationUrl: string;
    supportEmail: string;
  };
  features: string[];
}

interface IntegrationResults {
  assessment?: AssessmentResult;
  roi?: ROIResult;
  trial?: TrialResult;
  recommendations?: string[];
}

export default function BusinessIntegrationWidget({ 
  businessType = 'saas', 
  apiVolume = 100000, 
  currentCost = 0.03 
}: IntegrationWidgetProps) {
  const [formData, setFormData] = useState({
    companyName: '',
    contactEmail: '',
    businessType: businessType,
    monthlyApiCalls: apiVolume,
    currentCostPerCall: currentCost,
    currentSubscriptionCost: 0
  });
  
  const [results, setResults] = useState<IntegrationResults | null>(null);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'assessment' | 'roi' | 'trial'>('assessment');

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const runAssessment = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/integration', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'assess_savings',
          data: formData
        })
      });
      const data = await response.json() as IntegrationResults;
      setResults(data);
    } catch (error) {
      console.error('Assessment failed:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateROI = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/integration', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'calculate_roi',
          data: formData
        })
      });
      const data = await response.json() as IntegrationResults;
      setResults(data);
    } catch (error) {
      console.error('ROI calculation failed:', error);
    } finally {
      setLoading(false);
    }
  };

  const startTrial = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/integration', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'start_trial',
          data: formData
        })
      });
      const data = await response.json() as IntegrationResults;
      setResults(data);
    } catch (error) {
      console.error('Trial start failed:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-xl shadow-lg">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-4">
          🚀 x402 + AgentKit Integration
        </h2>
        <p className="text-lg text-gray-600">
          Save 90% on API costs with autonomous optimization
        </p>
      </div>

      {/* Tab Navigation */}
      <div className="flex justify-center mb-8">
        <div className="bg-gray-100 p-1 rounded-lg">
          {[
            { id: 'assessment', label: 'Cost Assessment', icon: '💰' },
            { id: 'roi', label: 'ROI Calculator', icon: '📈' },
            { id: 'trial', label: 'Start Trial', icon: '🎯' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as 'assessment' | 'roi' | 'trial')}
              className={`px-4 py-2 rounded-md font-medium transition-all ${
                activeTab === tab.id
                  ? 'bg-blue-600 text-white shadow-lg'
                  : 'text-gray-700 hover:bg-blue-50'
              }`}
            >
              {tab.icon} {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Form */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Company Name
          </label>
          <input
            type="text"
            name="companyName"
            value={formData.companyName}
            onChange={handleInputChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Your Company Name"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Contact Email
          </label>
          <input
            type="email"
            name="contactEmail"
            value={formData.contactEmail}
            onChange={handleInputChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="your@email.com"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Business Type
          </label>
          <select
            name="businessType"
            value={formData.businessType}
            onChange={handleInputChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="saas">SaaS Company</option>
            <option value="ecommerce">E-commerce Platform</option>
            <option value="ai_ml">AI/ML Company</option>
            <option value="fintech">Fintech Company</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Monthly API Calls
          </label>
          <input
            type="number"
            name="monthlyApiCalls"
            value={formData.monthlyApiCalls}
            onChange={handleInputChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="100000"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Current Cost Per Call ($)
          </label>
          <input
            type="number"
            step="0.001"
            name="currentCostPerCall"
            value={formData.currentCostPerCall}
            onChange={handleInputChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="0.03"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Current Subscription Cost ($/month)
          </label>
          <input
            type="number"
            name="currentSubscriptionCost"
            value={formData.currentSubscriptionCost}
            onChange={handleInputChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="2000"
          />
        </div>
      </div>

      {/* Action Button */}
      <div className="text-center mb-8">
        <button
          onClick={activeTab === 'assessment' ? runAssessment : activeTab === 'roi' ? calculateROI : startTrial}
          disabled={loading}
          className="px-8 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
        >
          {loading ? 'Processing...' : 
           activeTab === 'assessment' ? '💰 Assess Savings' :
           activeTab === 'roi' ? '📈 Calculate ROI' : '🎯 Start Free Trial'}
        </button>
      </div>

      {/* Results */}
      {results && (
        <div className="bg-gray-50 rounded-lg p-6">
          {activeTab === 'assessment' && results.assessment && (
            <div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">💰 Cost Assessment Results</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white p-4 rounded-lg">
                  <h4 className="font-semibold text-gray-900 mb-2">Current Costs</h4>
                  <p className="text-2xl font-bold text-red-600">
                    ${results.assessment.currentMonthlyCost.toLocaleString()}/month
                  </p>
                  <p className="text-sm text-gray-600">
                    ${(results.assessment.currentMonthlyCost * 12).toLocaleString()}/year
                  </p>
                </div>
                <div className="bg-white p-4 rounded-lg">
                  <h4 className="font-semibold text-gray-900 mb-2">x402 Optimized Costs</h4>
                  <p className="text-2xl font-bold text-green-600">
                    ${results.assessment.x402MonthlyCost.toLocaleString()}/month
                  </p>
                  <p className="text-sm text-gray-600">
                    ${(results.assessment.x402MonthlyCost * 12).toLocaleString()}/year
                  </p>
                </div>
                <div className="bg-white p-4 rounded-lg">
                  <h4 className="font-semibold text-gray-900 mb-2">Monthly Savings</h4>
                  <p className="text-2xl font-bold text-blue-600">
                    ${results.assessment.monthlySavings.toLocaleString()}
                  </p>
                  <p className="text-sm text-gray-600">
                    {results.assessment.savingsPercent.toFixed(1)}% reduction
                  </p>
                </div>
                <div className="bg-white p-4 rounded-lg">
                  <h4 className="font-semibold text-gray-900 mb-2">Annual Savings</h4>
                  <p className="text-2xl font-bold text-purple-600">
                    ${results.assessment.annualSavings.toLocaleString()}
                  </p>
                  <p className="text-sm text-gray-600">
                    ROI: {results.assessment.roi.toFixed(0)}%
                  </p>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'roi' && results.roi && (
            <div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">📈 ROI Analysis</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white p-4 rounded-lg">
                  <h4 className="font-semibold text-gray-900 mb-2">Implementation Cost</h4>
                  <p className="text-2xl font-bold text-orange-600">
                    ${results.roi.implementationCost.toLocaleString()}
                  </p>
                </div>
                <div className="bg-white p-4 rounded-lg">
                  <h4 className="font-semibold text-gray-900 mb-2">Annual Savings</h4>
                  <p className="text-2xl font-bold text-green-600">
                    ${results.roi.clientAnnualSavings.toLocaleString()}
                  </p>
                </div>
                <div className="bg-white p-4 rounded-lg">
                  <h4 className="font-semibold text-gray-900 mb-2">Client ROI</h4>
                  <p className="text-2xl font-bold text-blue-600">
                    {results.roi.clientROI.toFixed(0)}%
                  </p>
                  <p className="text-sm text-gray-600">
                    Payback: {results.roi.paybackPeriod} months
                  </p>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'trial' && results.trial && (
            <div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">🎯 Trial Started Successfully!</h3>
              <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
                <p className="text-green-800">
                  <strong>Trial ID:</strong> {results.trial.trialId}
                </p>
                <p className="text-green-800">
                  <strong>Duration:</strong> 30 days (ends {new Date(results.trial.endDate).toLocaleDateString()})
                </p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Access Information</h4>
                  <ul className="space-y-2 text-sm">
                    <li><strong>Dashboard:</strong> <a href={results.trial.access.dashboardUrl} className="text-blue-600 hover:underline">Access Trial Dashboard</a></li>
                    <li><strong>API Key:</strong> {results.trial.access.apiKey}</li>
                    <li><strong>Documentation:</strong> <a href={results.trial.access.documentationUrl} className="text-blue-600 hover:underline">View Docs</a></li>
                    <li><strong>Support:</strong> {results.trial.access.supportEmail}</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Trial Features</h4>
                  <ul className="space-y-1 text-sm">
                    {results.trial.features.map((feature: string, index: number) => (
                      <li key={index} className="flex items-center">
                        <span className="text-green-500 mr-2">✅</span>
                        {feature}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          )}

          {/* Recommendations */}
          {results.recommendations && (
            <div className="mt-6">
              <h4 className="font-semibold text-gray-900 mb-2">Recommendations</h4>
              <ul className="space-y-1">
                {results.recommendations.map((rec: string, index: number) => (
                  <li key={index} className="flex items-center text-sm">
                    <span className="text-blue-500 mr-2">💡</span>
                    {rec}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

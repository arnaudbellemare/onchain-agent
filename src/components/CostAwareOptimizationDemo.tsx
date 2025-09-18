'use client';

import React, { useState, useEffect } from 'react';

interface OptimizationResult {
  method: string;
  result: {
    evolvedPrompt?: string;
    bestPrompt?: string;
    accuracy: number;
    costReduction: number;
    totalCost?: number;
    optimizationScore?: number;
    finalAccuracy?: number;
    lengthReduction?: number;
    totalEvaluations?: number;
    paretoFrontSize?: number;
  };
  metadata: {
    budget: number;
    duration: number;
    timestamp: string;
    pricing?: any;
    config?: any;
  };
}

interface PaymentDecision {
  request: {
    amount: number;
    currency: string;
    urgency: string;
    type: string;
    recipient: string;
  };
  decision: {
    selectedRail: string;
    reasoning: string;
    confidence: number;
    costBreakdown: {
      railFee: number;
      networkFee: number;
      totalCost: number;
      costInUSD: number;
    };
    optimizationMetrics: {
      tokensUsed: number;
      inferenceTime: number;
      optimizationCost: number;
      totalRequestCost: number;
    };
  };
}

interface PricingInfo {
  perplexity: {
    inputRate: number;
    outputRate: number;
    requestFee: number;
    description: string;
  };
  gpu: {
    ratePerSecond: number;
    description: string;
  };
  optimization: {
    accuracyWeight: number;
    costWeight: number;
    description: string;
  };
}

export default function CostAwareOptimizationDemo() {
  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState<OptimizationResult[]>([]);
  const [paymentDecisions, setPaymentDecisions] = useState<PaymentDecision[]>([]);
  const [pricing, setPricing] = useState<PricingInfo | null>(null);
  const [activeTab, setActiveTab] = useState<'gepa' | 'capo' | 'payment' | 'pricing'>('gepa');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadPricingInfo();
  }, []);

  const loadPricingInfo = async () => {
    try {
      const response = await fetch('/api/cost-aware-optimization?action=pricing');
      const data = await response.json();
      if (data.success) {
        setPricing(data.pricing);
      }
    } catch (error) {
      console.error('Failed to load pricing info:', error);
    }
  };

  const runOptimization = async (method: 'gepa' | 'capo', budget: number = 100) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`/api/cost-aware-optimization?action=${method}&budget=${budget}`);
      const data = await response.json();
      
      if (data.success) {
        setResults(prev => [data, ...prev]);
      } else {
        setError(data.error || 'Optimization failed');
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Network error');
    } finally {
      setIsLoading(false);
    }
  };

  const runPaymentDemo = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/cost-aware-optimization?action=payment');
      const data = await response.json();
      
      if (data.success) {
        setPaymentDecisions(data.results);
      } else {
        setError(data.error || 'Payment demo failed');
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Network error');
    } finally {
      setIsLoading(false);
    }
  };

  const runComprehensiveDemo = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/cost-aware-optimization');
      const data = await response.json();
      
      if (data.success) {
        setResults([data.results.gepa, data.results.capo]);
        setPaymentDecisions([]);
      } else {
        setError(data.error || 'Demo failed');
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Network error');
    } finally {
      setIsLoading(false);
    }
  };

  const formatCost = (cost: number) => {
    return `$${cost.toFixed(6)}`;
  };

  const formatPercentage = (value: number) => {
    return `${value.toFixed(1)}%`;
  };

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg p-6 text-white">
        <h1 className="text-3xl font-bold mb-2">Cost-Aware Prompt Optimization</h1>
        <p className="text-blue-100">
          Real-world API and GPU cost optimization using GEPA and CAPO with live pricing data from September 2025.
          Optimized for x402 micropayments and Pareto front balancing.
        </p>
      </div>

      {/* Navigation Tabs */}
      <div className="flex space-x-4 border-b">
        {(['gepa', 'capo', 'payment', 'pricing'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 font-medium capitalize ${
              activeTab === tab
                ? 'border-b-2 border-blue-500 text-blue-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            {tab === 'gepa' ? 'GEPA Evolution' : tab === 'capo' ? 'CAPO Optimization' : tab === 'payment' ? 'Payment Router' : 'Pricing Info'}
          </button>
        ))}
      </div>

      {/* Action Buttons */}
      <div className="flex flex-wrap gap-4">
        <button
          onClick={() => runOptimization('gepa', 100)}
          disabled={isLoading}
          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
        >
          Run GEPA Optimization
        </button>
        <button
          onClick={() => runOptimization('capo', 100)}
          disabled={isLoading}
          className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50"
        >
          Run CAPO Optimization
        </button>
        <button
          onClick={runPaymentDemo}
          disabled={isLoading}
          className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
        >
          Payment Router Demo
        </button>
        <button
          onClick={runComprehensiveDemo}
          disabled={isLoading}
          className="px-6 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 disabled:opacity-50"
        >
          Run Full Demo
        </button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800">{error}</p>
        </div>
      )}

      {isLoading && (
        <div className="text-center py-8">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <p className="mt-2 text-gray-600">Running optimization...</p>
        </div>
      )}

      {/* Results Display */}
      {activeTab === 'gepa' && results.filter(r => r.method === 'GEPA').length > 0 && (
        <div className="space-y-4">
          <h2 className="text-2xl font-bold">GEPA Optimization Results</h2>
          {results.filter(r => r.method === 'GEPA').map((result, index) => (
            <div key={index} className="bg-white border rounded-lg p-6 shadow-sm">
              <h3 className="text-lg font-semibold mb-4">Generation {index + 1}</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h4 className="font-medium text-gray-700 mb-2">Evolved Prompt:</h4>
                  <p className="text-sm bg-gray-50 p-3 rounded border">
                    {result.result.evolvedPrompt}
                  </p>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Accuracy:</span>
                    <span className="font-medium">{formatPercentage(result.result.accuracy * 100)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Cost Reduction:</span>
                    <span className="font-medium text-green-600">{formatPercentage(result.result.costReduction)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Total Cost:</span>
                    <span className="font-medium">{formatCost(result.result.totalCost || 0)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Optimization Score:</span>
                    <span className="font-medium">{result.result.optimizationScore?.toFixed(4)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Duration:</span>
                    <span className="font-medium">{result.metadata.duration}ms</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {activeTab === 'capo' && results.filter(r => r.method === 'CAPO').length > 0 && (
        <div className="space-y-4">
          <h2 className="text-2xl font-bold">CAPO Optimization Results</h2>
          {results.filter(r => r.method === 'CAPO').map((result, index) => (
            <div key={index} className="bg-white border rounded-lg p-6 shadow-sm">
              <h3 className="text-lg font-semibold mb-4">Optimization Run {index + 1}</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h4 className="font-medium text-gray-700 mb-2">Optimized Prompt:</h4>
                  <p className="text-sm bg-gray-50 p-3 rounded border">
                    {result.result.bestPrompt}
                  </p>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Final Accuracy:</span>
                    <span className="font-medium">{formatPercentage((result.result.finalAccuracy || 0) * 100)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Cost Reduction:</span>
                    <span className="font-medium text-green-600">{formatPercentage(result.result.costReduction || 0)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Length Reduction:</span>
                    <span className="font-medium text-blue-600">{formatPercentage(result.result.lengthReduction || 0)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Total Evaluations:</span>
                    <span className="font-medium">{result.result.totalEvaluations}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Pareto Front Size:</span>
                    <span className="font-medium">{result.result.paretoFrontSize}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {activeTab === 'payment' && paymentDecisions.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-2xl font-bold">Payment Router Decisions</h2>
          {paymentDecisions.map((decision, index) => (
            <div key={index} className="bg-white border rounded-lg p-6 shadow-sm">
              <h3 className="text-lg font-semibold mb-4">
                Payment #{index + 1}: {decision.request.type} - ${decision.request.amount}
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-medium text-gray-700 mb-2">Request Details:</h4>
                  <div className="space-y-1 text-sm">
                    <div>Amount: ${decision.request.amount} {decision.request.currency}</div>
                    <div>Urgency: {decision.request.urgency}</div>
                    <div>Type: {decision.request.type}</div>
                    <div>Recipient: {decision.request.recipient.slice(0, 20)}...</div>
                  </div>
                </div>
                <div>
                  <h4 className="font-medium text-gray-700 mb-2">Decision:</h4>
                  <div className="space-y-1 text-sm">
                    <div>Selected Rail: <span className="font-medium">{decision.decision.selectedRail}</span></div>
                    <div>Confidence: <span className="font-medium">{formatPercentage(decision.decision.confidence * 100)}</span></div>
                    <div>Total Cost: <span className="font-medium">{formatCost(decision.decision.costBreakdown.totalCost)}</span></div>
                  </div>
                </div>
              </div>
              <div className="mt-4">
                <h4 className="font-medium text-gray-700 mb-2">Reasoning:</h4>
                <p className="text-sm text-gray-600">{decision.decision.reasoning}</p>
              </div>
              <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <span className="text-gray-600">Rail Fee:</span>
                  <div className="font-medium">{formatCost(decision.decision.costBreakdown.railFee)}</div>
                </div>
                <div>
                  <span className="text-gray-600">Network Fee:</span>
                  <div className="font-medium">{formatCost(decision.decision.costBreakdown.networkFee)}</div>
                </div>
                <div>
                  <span className="text-gray-600">Tokens Used:</span>
                  <div className="font-medium">{decision.decision.optimizationMetrics.tokensUsed}</div>
                </div>
                <div>
                  <span className="text-gray-600">Inference Time:</span>
                  <div className="font-medium">{decision.decision.optimizationMetrics.inferenceTime.toFixed(3)}s</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {activeTab === 'pricing' && pricing && (
        <div className="space-y-4">
          <h2 className="text-2xl font-bold">Real-Time Pricing Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white border rounded-lg p-6 shadow-sm">
              <h3 className="text-lg font-semibold mb-4">Perplexity AI Pricing</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Input Rate:</span>
                  <span className="font-medium">${pricing.perplexity.inputRate.toFixed(6)}/token</span>
                </div>
                <div className="flex justify-between">
                  <span>Output Rate:</span>
                  <span className="font-medium">${pricing.perplexity.outputRate.toFixed(6)}/token</span>
                </div>
                <div className="flex justify-between">
                  <span>Request Fee:</span>
                  <span className="font-medium">${pricing.perplexity.requestFee.toFixed(3)}</span>
                </div>
              </div>
              <p className="text-xs text-gray-500 mt-2">{pricing.perplexity.description}</p>
            </div>
            
            <div className="bg-white border rounded-lg p-6 shadow-sm">
              <h3 className="text-lg font-semibold mb-4">GPU Inference Pricing</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Rate per Second:</span>
                  <span className="font-medium">${pricing.gpu.ratePerSecond.toFixed(6)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Hourly Rate:</span>
                  <span className="font-medium">${(pricing.gpu.ratePerSecond * 3600).toFixed(2)}</span>
                </div>
              </div>
              <p className="text-xs text-gray-500 mt-2">{pricing.gpu.description}</p>
            </div>
            
            <div className="bg-white border rounded-lg p-6 shadow-sm">
              <h3 className="text-lg font-semibold mb-4">Optimization Weights</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Accuracy Weight:</span>
                  <span className="font-medium">{formatPercentage(pricing.optimization.accuracyWeight * 100)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Cost Weight:</span>
                  <span className="font-medium">{formatPercentage(pricing.optimization.costWeight * 100)}</span>
                </div>
              </div>
              <p className="text-xs text-gray-500 mt-2">{pricing.optimization.description}</p>
            </div>
          </div>
          
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h4 className="font-medium text-blue-800 mb-2">Example Query Cost Breakdown</h4>
            <div className="text-sm text-blue-700">
              <p>• 700 input tokens: ${(700 * pricing.perplexity.inputRate).toFixed(6)}</p>
              <p>• 200 output tokens: ${(200 * pricing.perplexity.outputRate).toFixed(6)}</p>
              <p>• Request fee: ${pricing.perplexity.requestFee.toFixed(3)}</p>
              <p>• 3s GPU time: ${(3 * pricing.gpu.ratePerSecond).toFixed(6)}</p>
              <p className="font-medium mt-1">• Total: ~$0.007-0.02 per query</p>
            </div>
          </div>
        </div>
      )}

      {/* Summary Stats */}
      {results.length > 0 && (
        <div className="bg-gradient-to-r from-green-50 to-blue-50 border border-green-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-green-800 mb-4">Optimization Summary</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div>
              <span className="text-green-700">Best GEPA Cost Reduction:</span>
              <div className="font-bold text-green-800">
                {Math.max(...results.filter(r => r.method === 'GEPA').map(r => r.result.costReduction), 0).toFixed(1)}%
              </div>
            </div>
            <div>
              <span className="text-green-700">Best CAPO Cost Reduction:</span>
              <div className="font-bold text-green-800">
                {Math.max(...results.filter(r => r.method === 'CAPO').map(r => r.result.costReduction), 0).toFixed(1)}%
              </div>
            </div>
            <div>
              <span className="text-green-700">Total Optimizations:</span>
              <div className="font-bold text-green-800">{results.length}</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

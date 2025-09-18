/**
 * GEPA + x402 Integration Demo
 * Showcases the complete vision: Official GEPA optimization with x402 micropayments
 * Based on the research framework and open-source repositories
 */

'use client';

import React, { useState } from 'react';

interface GEPAResult {
  best_individual: {
    accuracy: number;
    cost_usd: number;
    fitness: number;
    evolved_prompt: string;
  };
  evolution_stats: {
    generations: number;
    total_evaluations: number;
    pareto_front_size: number;
    optimization_time_ms: number;
  };
  cost_reduction_percentage: number;
}

interface X402Result {
  test_results: Array<{
    request: Record<string, unknown>;
    result?: Record<string, unknown>;
    error?: string;
    success: boolean;
  }>;
  success_rate: number;
  total_tested: number;
}

interface IntegrationResult {
  success: boolean;
  gepa_optimization: GEPAResult;
  evolved_config: {
    config_id: string;
    deployed: boolean;
    performance_metrics: Record<string, unknown>;
    cost_reduction: number;
  };
  x402_integration: X402Result;
  cost_tracing: {
    total_cost: number;
    total_tokens: number;
    module_breakdown: Array<{
      module: string;
      cost: number;
      tokens: number;
      time: number;
      trace_count: number;
    }>;
  };
  business_impact: {
    cost_savings_percentage: number;
    estimated_monthly_savings_usd: number;
    roi_break_even_queries: number;
    payback_period_days: number;
  };
}

export default function GEPAX402IntegrationDemo() {
  const [isRunning, setIsRunning] = useState(false);
  const [result, setResult] = useState<IntegrationResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState<string>('Ready to run integration');

  const runIntegration = async () => {
    setIsRunning(true);
    setError(null);
    setStatus('Initializing GEPA optimization...');

    try {
      const response = await fetch('/api/gepa-x402-integration', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          optimization_type: 'full',
          budget: 150,
          enable_x402: true,
          export_config: true
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.success) {
        setResult(data);
        setStatus('Integration completed successfully!');
      } else {
        throw new Error(data.error || 'Unknown error occurred');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
      setStatus('Integration failed');
    } finally {
      setIsRunning(false);
    }
  };

  const getStatusColor = () => {
    if (isRunning) return 'text-blue-600';
    if (error) return 'text-red-600';
    if (result) return 'text-green-600';
    return 'text-gray-600';
  };

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-8">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          GEPA + x402 Integration Demo
        </h1>
        <p className="text-lg text-gray-600 mb-6">
          Official GEPA optimization with x402 micropayments for AI agents
        </p>
        <div className={`text-sm font-medium ${getStatusColor()}`}>
          Status: {status}
        </div>
      </div>

      {/* Research Foundation */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
        <h2 className="text-xl font-semibold text-blue-900 mb-4">
          🎯 Research Foundation
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div>
            <h3 className="font-semibold text-blue-800 mb-2">Official Repositories:</h3>
            <ul className="space-y-1 text-blue-700">
              <li>• <strong>GEPA:</strong> gepa-ai/gepa (DSPy integration)</li>
              <li>• <strong>DSPy:</strong> stanfordnlp/dspy (v3.0+ with GEPA)</li>
              <li>• <strong>x402:</strong> coinbase/x402 (HTTP/402 protocol)</li>
              <li>• <strong>AgentKit:</strong> Coinbase examples</li>
            </ul>
          </div>
          <div>
            <h3 className="font-semibold text-blue-800 mb-2">Key Features:</h3>
            <ul className="space-y-1 text-blue-700">
              <li>• Real-world API costs (Perplexity Sonar)</li>
              <li>• GPU inference pricing (H100/A100)</li>
              <li>• Pareto optimization (accuracy vs cost)</li>
              <li>• x402 micropayments per query</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Control Panel */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">
          🚀 Integration Control Panel
        </h2>
        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-600">
            <p><strong>Budget:</strong> 150 evaluations</p>
            <p><strong>Population:</strong> 8 individuals</p>
            <p><strong>Mutation Rate:</strong> 30%</p>
          </div>
          <button
            onClick={runIntegration}
            disabled={isRunning}
            className={`px-6 py-3 rounded-lg font-semibold transition-colors ${
              isRunning
                ? 'bg-gray-400 text-white cursor-not-allowed'
                : 'bg-blue-600 hover:bg-blue-700 text-white'
            }`}
          >
            {isRunning ? 'Running Integration...' : 'Run GEPA + x402 Integration'}
          </button>
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <h3 className="text-lg font-semibold text-red-800 mb-2">Integration Error</h3>
          <p className="text-red-700">{error}</p>
        </div>
      )}

      {/* Results Display */}
      {result && (
        <div className="space-y-6">
          {/* GEPA Optimization Results */}
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              🧬 GEPA Optimization Results
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="text-sm font-medium text-green-800">Best Accuracy</div>
                <div className="text-2xl font-bold text-green-900">
                  {(result.gepa_optimization.best_individual.accuracy * 100).toFixed(1)}%
                </div>
              </div>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="text-sm font-medium text-blue-800">Cost Reduction</div>
                <div className="text-2xl font-bold text-blue-900">
                  {result.gepa_optimization.cost_reduction_percentage.toFixed(1)}%
                </div>
              </div>
              <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                <div className="text-sm font-medium text-purple-800">Fitness Score</div>
                <div className="text-2xl font-bold text-purple-900">
                  {result.gepa_optimization.best_individual.fitness.toFixed(4)}
                </div>
              </div>
              <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                <div className="text-sm font-medium text-orange-800">Generations</div>
                <div className="text-2xl font-bold text-orange-900">
                  {result.gepa_optimization.evolution_stats.generations}
                </div>
              </div>
            </div>
            
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Evolved Prompt:</h3>
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                  <code className="text-sm text-gray-800">
                    {result.gepa_optimization.best_individual.evolved_prompt}
                  </code>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div>
                  <span className="font-medium text-gray-700">Optimization Time:</span>
                  <span className="ml-2 text-gray-900">
                    {result.gepa_optimization.evolution_stats.optimization_time_ms}ms
                  </span>
                </div>
                <div>
                  <span className="font-medium text-gray-700">Total Evaluations:</span>
                  <span className="ml-2 text-gray-900">
                    {result.gepa_optimization.evolution_stats.total_evaluations}
                  </span>
                </div>
                <div>
                  <span className="font-medium text-gray-700">Pareto Front Size:</span>
                  <span className="ml-2 text-gray-900">
                    {result.gepa_optimization.evolution_stats.pareto_front_size}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* x402 Integration Results */}
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              💰 x402 Micropayments Integration
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="text-sm font-medium text-green-800">Success Rate</div>
                <div className="text-2xl font-bold text-green-900">
                  {(result.x402_integration.success_rate * 100).toFixed(1)}%
                </div>
              </div>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="text-sm font-medium text-blue-800">Tests Passed</div>
                <div className="text-2xl font-bold text-blue-900">
                  {result.x402_integration.test_results.filter(r => r.success).length}/{result.x402_integration.total_tested}
                </div>
              </div>
              <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                <div className="text-sm font-medium text-purple-800">Config Deployed</div>
                <div className="text-2xl font-bold text-purple-900">
                  {result.evolved_config.deployed ? '✅' : '❌'}
                </div>
              </div>
            </div>
            
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">Payment Test Results:</h3>
              <div className="space-y-2">
                {result.x402_integration.test_results.map((test, index) => (
                  <div key={index} className={`border rounded-lg p-3 ${
                    test.success ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'
                  }`}>
                    <div className="flex justify-between items-start">
                      <div className="text-sm">
                        <div className="font-medium text-gray-900">
                          ${test.request.amount} {test.request.type} - {test.request.urgency} urgency
                        </div>
                        <div className="text-gray-600">
                          Recipient: {test.request.recipient}
                        </div>
                      </div>
                      <div className={`text-sm font-medium ${
                        test.success ? 'text-green-700' : 'text-red-700'
                      }`}>
                        {test.success ? '✅ Success' : '❌ Failed'}
                      </div>
                    </div>
                    {test.error && (
                      <div className="mt-2 text-sm text-red-600">
                        Error: {test.error}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Cost Tracing Results */}
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              📊 DSPy Cost Tracing
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="text-sm font-medium text-green-800">Total Cost</div>
                <div className="text-2xl font-bold text-green-900">
                  ${result.cost_tracing.total_cost.toFixed(6)}
                </div>
              </div>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="text-sm font-medium text-blue-800">Total Tokens</div>
                <div className="text-2xl font-bold text-blue-900">
                  {result.cost_tracing.total_tokens.toLocaleString()}
                </div>
              </div>
              <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                <div className="text-sm font-medium text-purple-800">Modules Traced</div>
                <div className="text-2xl font-bold text-purple-900">
                  {result.cost_tracing.module_breakdown.length}
                </div>
              </div>
            </div>
            
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">Module Breakdown:</h3>
              <div className="space-y-2">
                {result.cost_tracing.module_breakdown.map((module, index) => (
                  <div key={index} className="flex justify-between items-center bg-gray-50 border border-gray-200 rounded-lg p-3">
                    <div>
                      <div className="font-medium text-gray-900">{module.module}</div>
                      <div className="text-sm text-gray-600">
                        {module.trace_count} traces, {module.tokens} tokens
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold text-gray-900">${module.cost.toFixed(6)}</div>
                      <div className="text-sm text-gray-600">{module.time}ms</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Business Impact */}
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              💼 Business Impact Analysis
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="text-sm font-medium text-green-800">Cost Savings</div>
                <div className="text-2xl font-bold text-green-900">
                  {result.business_impact.cost_savings_percentage.toFixed(1)}%
                </div>
              </div>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="text-sm font-medium text-blue-800">Monthly Savings</div>
                <div className="text-2xl font-bold text-blue-900">
                  ${result.business_impact.estimated_monthly_savings_usd.toFixed(2)}
                </div>
              </div>
              <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                <div className="text-sm font-medium text-purple-800">ROI Break-even</div>
                <div className="text-2xl font-bold text-purple-900">
                  {result.business_impact.roi_break_even_queries} queries
                </div>
              </div>
              <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                <div className="text-sm font-medium text-orange-800">Payback Period</div>
                <div className="text-2xl font-bold text-orange-900">
                  {result.business_impact.payback_period_days} days
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Technical Details */}
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">
          🔧 Technical Implementation
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
          <div>
            <h3 className="font-semibold text-gray-800 mb-2">GEPA Features:</h3>
            <ul className="space-y-1 text-gray-600">
              <li>• Official gepa-ai/gepa integration</li>
              <li>• DSPy v3.0+ full-program evolution</li>
              <li>• Mutation-reflection loop</li>
              <li>• Pareto optimization</li>
              <li>• Real-world cost awareness</li>
            </ul>
          </div>
          <div>
            <h3 className="font-semibold text-gray-800 mb-2">x402 Features:</h3>
            <ul className="space-y-1 text-gray-600">
              <li>• HTTP/402 protocol implementation</li>
              <li>• Per-token micropayments</li>
              <li>• Base network integration</li>
              <li>• AgentKit middleware</li>
              <li>• Real-time cost calculation</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

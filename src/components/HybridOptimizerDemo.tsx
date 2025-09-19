'use client';

import React, { useState, useEffect } from 'react';

interface OptimizationResult {
  originalCost: number;
  optimizedCost: number;
  savings: number;
  savingsPercentage: number;
  optimizationMethods: string[];
  response: string;
  metrics: {
    promptOptimization: number;
    providerSwitching: number;
    caching: number;
    modelSelection: number;
  };
  processingTime: number;
  timestamp: string;
}

interface DemoResult {
  prompt: string;
  savings: number;
  methods: string[];
  cost: number;
}

const HybridOptimizerDemo: React.FC = () => {
  const [isRunning, setIsRunning] = useState(false);
  const [results, setResults] = useState<OptimizationResult[]>([]);
  const [demoResults, setDemoResults] = useState<DemoResult[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [currentPrompt, setCurrentPrompt] = useState('');
  const [showDemo, setShowDemo] = useState(false);

  const examplePrompts = [
    "Please provide a comprehensive analysis of the current market conditions and detailed insights on future trends, risk factors, and investment opportunities for the next quarter.",
    "Generate a detailed technical analysis of the cryptocurrency market including price predictions, trading strategies, risk assessment, and portfolio optimization recommendations for both short-term and long-term investors.",
    "Create a comprehensive business plan for a new fintech startup including market research, competitive analysis, financial projections, funding requirements, and go-to-market strategy with detailed implementation timeline."
  ];

  const runOptimization = async (prompt: string) => {
    setIsRunning(true);
    
    try {
      const response = await fetch('/api/hybrid-optimizer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt,
          useCache: true,
          minQuality: 0.85
        })
      });

      const data = await response.json();
      
      if (data.success) {
        setResults(prev => [data.result, ...prev]);
        await fetchStats();
      }
    } catch (error) {
      console.error('Optimization failed:', error);
    } finally {
      setIsRunning(false);
    }
  };

  const runDemo = async () => {
    setIsRunning(true);
    setShowDemo(true);
    
    try {
      const response = await fetch('/api/hybrid-optimizer?action=demo');
      const data = await response.json();
      
      if (data.success) {
        setDemoResults(data.demo.results);
        await fetchStats();
      }
    } catch (error) {
      console.error('Demo failed:', error);
    } finally {
      setIsRunning(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await fetch('/api/hybrid-optimizer?action=stats');
      const data = await response.json();
      
      if (data.success) {
        setStats(data.stats);
      }
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const formatCurrency = (amount: number) => `$${amount.toFixed(6)}`;
  const formatPercentage = (percentage: number) => `${percentage.toFixed(1)}%`;

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-8">
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
          Hybrid Cost Optimizer
        </h1>
        <p className="text-xl text-gray-600 max-w-3xl mx-auto">
          The most cost-effective approach: combining simple effectiveness with advanced optimization
        </p>
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 max-w-2xl mx-auto">
          <h3 className="font-semibold text-green-800 mb-2">🎯 Best of Both Worlds</h3>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-green-700"><strong>Development:</strong> 1-2 months</p>
              <p className="text-green-700"><strong>Infrastructure:</strong> $200/month</p>
            </div>
            <div>
              <p className="text-green-700"><strong>Savings:</strong> 50-70% potential</p>
              <p className="text-green-700"><strong>Typical:</strong> 40-50% actual</p>
            </div>
          </div>
        </div>
      </div>

      {/* Optimization Methods */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
          <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center mb-4">
            <span className="text-white font-bold">📝</span>
          </div>
          <h3 className="font-semibold text-blue-800 mb-2">Prompt Optimization</h3>
          <p className="text-sm text-blue-600 mb-3">Remove redundant words and phrases</p>
          <div className="text-2xl font-bold text-blue-700">20-30%</div>
          <div className="text-xs text-blue-500">savings</div>
        </div>

        <div className="bg-purple-50 border border-purple-200 rounded-lg p-6">
          <div className="w-12 h-12 bg-purple-600 rounded-lg flex items-center justify-center mb-4">
            <span className="text-white font-bold">🔄</span>
          </div>
          <h3 className="font-semibold text-purple-800 mb-2">Provider Switching</h3>
          <p className="text-sm text-purple-600 mb-3">Route to cheapest provider</p>
          <div className="text-2xl font-bold text-purple-700">15-20%</div>
          <div className="text-xs text-purple-500">savings</div>
        </div>

        <div className="bg-green-50 border border-green-200 rounded-lg p-6">
          <div className="w-12 h-12 bg-green-600 rounded-lg flex items-center justify-center mb-4">
            <span className="text-white font-bold">💾</span>
          </div>
          <h3 className="font-semibold text-green-800 mb-2">Intelligent Caching</h3>
          <p className="text-sm text-green-600 mb-3">Cache repeated queries</p>
          <div className="text-2xl font-bold text-green-700">30-40%</div>
          <div className="text-xs text-green-500">savings</div>
        </div>

        <div className="bg-orange-50 border border-orange-200 rounded-lg p-6">
          <div className="w-12 h-12 bg-orange-600 rounded-lg flex items-center justify-center mb-4">
            <span className="text-white font-bold">🎯</span>
          </div>
          <h3 className="font-semibold text-orange-800 mb-2">Model Selection</h3>
          <p className="text-sm text-orange-600 mb-3">Choose optimal model size</p>
          <div className="text-2xl font-bold text-orange-700">20-30%</div>
          <div className="text-xs text-orange-500">savings</div>
        </div>
      </div>

      {/* Demo Controls */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h2 className="text-xl font-semibold mb-4">Live Demo</h2>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Enter your prompt:
            </label>
            <textarea
              value={currentPrompt}
              onChange={(e) => setCurrentPrompt(e.target.value)}
              placeholder="Enter a prompt to optimize..."
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              rows={3}
            />
          </div>
          
          <div className="flex gap-4">
            <button
              onClick={() => runOptimization(currentPrompt)}
              disabled={isRunning || !currentPrompt.trim()}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isRunning ? 'Optimizing...' : 'Optimize Prompt'}
            </button>
            
            <button
              onClick={runDemo}
              disabled={isRunning}
              className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isRunning ? 'Running...' : 'Run Demo'}
            </button>
          </div>
        </div>
      </div>

      {/* Demo Results */}
      {showDemo && demoResults.length > 0 && (
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h2 className="text-xl font-semibold mb-4">Demo Results</h2>
          <div className="space-y-4">
            {demoResults.map((result, index) => (
              <div key={index} className="bg-gray-50 p-4 rounded-lg">
                <div className="flex justify-between items-start mb-2">
                  <p className="text-sm text-gray-600 flex-1">{result.prompt}</p>
                  <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium ml-4">
                    {formatPercentage(result.savings)} saved
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Cost: {formatCurrency(result.cost)}</span>
                  <span>Methods: {result.methods.join(', ')}</span>
                </div>
              </div>
            ))}
            <div className="bg-green-50 border border-green-200 p-4 rounded-lg">
              <p className="text-green-800 font-semibold">
                Average Savings: {formatPercentage(demoResults.reduce((sum, r) => sum + r.savings, 0) / demoResults.length)}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Live Results */}
      {results.length > 0 && (
        <div className="space-y-6">
          <h2 className="text-2xl font-bold text-center">Live Optimization Results</h2>
          
          {results.map((result, index) => (
            <div key={index} className="bg-white rounded-lg border border-gray-200 border-l-4 border-l-green-500 p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">Optimization #{index + 1}</h3>
                <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">
                  {formatPercentage(result.savingsPercentage)} saved
                </span>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-semibold text-gray-700 mb-2">Cost Breakdown</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Original Cost:</span>
                      <span className="font-semibold text-red-600">{formatCurrency(result.originalCost)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Optimized Cost:</span>
                      <span className="font-semibold text-green-600">{formatCurrency(result.optimizedCost)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Total Savings:</span>
                      <span className="font-semibold text-blue-600">{formatCurrency(result.savings)}</span>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h4 className="font-semibold text-gray-700 mb-2">Optimization Methods</h4>
                  <div className="space-y-2">
                    {result.optimizationMethods.map((method, i) => (
                      <div key={i} className="flex items-center">
                        <span className="w-2 h-2 bg-blue-500 rounded-full mr-2"></span>
                        <span className="text-sm text-gray-600 capitalize">
                          {method.replace('_', ' ')}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              
              <div className="mt-4 pt-4 border-t">
                <h4 className="font-semibold text-gray-700 mb-2">Savings Breakdown</h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div className="text-center">
                    <div className="text-lg font-bold text-blue-600">{formatPercentage(result.metrics.promptOptimization)}</div>
                    <div className="text-gray-500">Prompt</div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-bold text-purple-600">{formatPercentage(result.metrics.providerSwitching)}</div>
                    <div className="text-gray-500">Provider</div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-bold text-green-600">{formatPercentage(result.metrics.caching)}</div>
                    <div className="text-gray-500">Cache</div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-bold text-orange-600">{formatPercentage(result.metrics.modelSelection)}</div>
                    <div className="text-gray-500">Model</div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Statistics */}
      {stats && (
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h2 className="text-xl font-semibold mb-4">Performance Statistics</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{stats.totalRequests}</div>
              <div className="text-sm text-gray-500">Total Requests</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{formatPercentage(stats.cacheHitRate * 100)}</div>
              <div className="text-sm text-gray-500">Cache Hit Rate</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">{formatPercentage(stats.averageSavings)}</div>
              <div className="text-sm text-gray-500">Average Savings</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">{formatCurrency(stats.totalSavings)}</div>
              <div className="text-sm text-gray-500">Total Saved</div>
            </div>
          </div>
        </div>
      )}

      {/* Why This Works Better */}
      <div className="bg-gradient-to-r from-green-50 to-blue-50 border border-green-200 rounded-lg p-6">
        <h2 className="text-xl font-semibold mb-4">Why This Approach Works Better</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 className="font-semibold text-green-800 mb-2">✅ Simple & Effective</h3>
            <ul className="text-sm text-green-700 space-y-1">
              <li>• 1-2 months development vs 6+ months</li>
              <li>• $200/month infrastructure vs $2000/month</li>
              <li>• Easy to understand and maintain</li>
              <li>• No complex blockchain overhead</li>
            </ul>
          </div>
          <div>
            <h3 className="font-semibold text-blue-800 mb-2">🎯 Maximum Savings</h3>
            <ul className="text-sm text-blue-700 space-y-1">
              <li>• 50-70% potential cost reduction</li>
              <li>• 40-50% typical actual savings</li>
              <li>• Multiple optimization layers</li>
              <li>• Proven techniques combined</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HybridOptimizerDemo;

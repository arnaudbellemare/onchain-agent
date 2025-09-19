'use client';

import React, { useState, useEffect } from 'react';

interface WalletInfo {
  address: string;
  ethBalance: number;
  usdcBalance: number;
  network: {
    name: string;
    testnet: boolean;
  };
}

interface APICallResult {
  provider: string;
  model: string;
  originalPrompt: string;
  optimizedPrompt: string;
  response: string;
  actualCost: number;
  duration: number;
}

interface OptimizationResult {
  originalCost: number;
  optimizedCost: number;
  savings: number;
  savingsPercentage: number;
  method: string;
}

interface PaymentResult {
  amount: number;
  currency: string;
  transactionHash: string;
  gasUsed: number;
  status: string;
}

interface X402DemoResult {
  wallet: WalletInfo;
  apiCall: APICallResult;
  optimization: OptimizationResult | null;
  payment: PaymentResult;
  costAnalysis: {
    baselineCost: number;
    actualCost: number;
    totalSavings: number;
    savingsPercentage: number;
    maxCostAllowed: number;
    withinBudget: boolean;
  };
}

export default function RealX402Demo() {
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<X402DemoResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [walletInfo, setWalletInfo] = useState<WalletInfo | null>(null);
  const [prompt, setPrompt] = useState('Analyze the current state of AI cost optimization and provide insights on x402 protocol adoption.');
  const [provider, setProvider] = useState('openai');
  const [model, setModel] = useState('gpt-4');
  const [maxCost, setMaxCost] = useState(0.10);
  const [enableOptimization, setEnableOptimization] = useState(true);

  // Load wallet info on component mount
  useEffect(() => {
    loadWalletInfo();
  }, []);

  const loadWalletInfo = async () => {
    try {
      const response = await fetch('/api/real-x402-demo?action=wallet-info');
      const data = await response.json();
      
      if (data.success) {
        setWalletInfo(data.wallet);
      } else {
        setError(data.error || 'Failed to load wallet info');
      }
    } catch (err) {
      setError('Failed to connect to wallet');
    }
  };

  const runDemo = async () => {
    setIsLoading(true);
    setError(null);
    setResult(null);

    try {
      const response = await fetch('/api/real-x402-demo', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'demo',
          provider,
          model,
          prompt,
          maxCost,
          enableOptimization
        }),
      });

      const data = await response.json();

      if (data.success) {
        setResult(data.results);
      } else {
        setError(data.error || 'Demo failed');
      }
    } catch (err) {
      setError('Failed to run demo');
    } finally {
      setIsLoading(false);
    }
  };

  const runCostAnalysis = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/real-x402-demo', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'cost-analysis'
        }),
      });

      const data = await response.json();

      if (data.success) {
        console.log('Cost Analysis:', data.analytics);
        alert(`Total Cost Today: $${data.analytics.summary.totalCost.toFixed(6)}\nTotal Calls: ${data.analytics.summary.totalCalls}\nOptimization Savings: $${data.analytics.summary.optimizationSavings.toFixed(6)}`);
      } else {
        setError(data.error || 'Cost analysis failed');
      }
    } catch (err) {
      setError('Failed to run cost analysis');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-8">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-white mb-4">
          🚀 Real x402 Protocol Demo
        </h1>
        <p className="text-xl text-gray-300 mb-8">
          Demonstrate actual x402 micropayments with real blockchain integration
        </p>
      </div>

      {/* Wallet Information */}
      {walletInfo && (
        <div className="bg-gray-800 rounded-lg p-6">
          <h2 className="text-2xl font-bold text-white mb-4">💼 Wallet Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-gray-700 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-white mb-2">Address</h3>
              <p className="text-sm text-gray-300 font-mono break-all">
                {walletInfo.address}
              </p>
            </div>
            <div className="bg-gray-700 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-white mb-2">ETH Balance</h3>
              <p className="text-2xl font-bold text-green-400">
                {walletInfo.ethBalance.toFixed(4)} ETH
              </p>
            </div>
            <div className="bg-gray-700 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-white mb-2">USDC Balance</h3>
              <p className="text-2xl font-bold text-blue-400">
                {walletInfo.usdcBalance.toFixed(6)} USDC
              </p>
            </div>
          </div>
          <div className="mt-4 text-center">
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${
              walletInfo.network.testnet 
                ? 'bg-yellow-100 text-yellow-800' 
                : 'bg-green-100 text-green-800'
            }`}>
              {walletInfo.network.name} {walletInfo.network.testnet ? '(Testnet)' : '(Mainnet)'}
            </span>
          </div>
        </div>
      )}

      {/* Demo Configuration */}
      <div className="bg-gray-800 rounded-lg p-6">
        <h2 className="text-2xl font-bold text-white mb-4">⚙️ Demo Configuration</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-white mb-2">
                AI Provider
              </label>
              <select
                value={provider}
                onChange={(e) => setProvider(e.target.value)}
                className="w-full p-3 bg-gray-700 text-white rounded-lg border border-gray-600 focus:border-blue-500 focus:outline-none"
              >
                <option value="openai">OpenAI</option>
                <option value="anthropic">Anthropic</option>
                <option value="perplexity">Perplexity</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-white mb-2">
                Model
              </label>
              <select
                value={model}
                onChange={(e) => setModel(e.target.value)}
                className="w-full p-3 bg-gray-700 text-white rounded-lg border border-gray-600 focus:border-blue-500 focus:outline-none"
              >
                {provider === 'openai' && (
                  <>
                    <option value="gpt-4">GPT-4</option>
                    <option value="gpt-3.5-turbo">GPT-3.5 Turbo</option>
                  </>
                )}
                {provider === 'anthropic' && (
                  <>
                    <option value="claude-3-sonnet-20240229">Claude 3 Sonnet</option>
                    <option value="claude-3-haiku-20240307">Claude 3 Haiku</option>
                  </>
                )}
                {provider === 'perplexity' && (
                  <>
                    <option value="llama-3.1-sonar-small-128k-online">Llama 3.1 Sonar Small</option>
                    <option value="llama-3.1-sonar-large-128k-online">Llama 3.1 Sonar Large</option>
                  </>
                )}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-white mb-2">
                Max Cost (USDC)
              </label>
              <input
                type="number"
                value={maxCost}
                onChange={(e) => setMaxCost(parseFloat(e.target.value))}
                step="0.01"
                min="0.01"
                max="1.00"
                className="w-full p-3 bg-gray-700 text-white rounded-lg border border-gray-600 focus:border-blue-500 focus:outline-none"
              />
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-white mb-2">
                Prompt
              </label>
              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                rows={6}
                className="w-full p-3 bg-gray-700 text-white rounded-lg border border-gray-600 focus:border-blue-500 focus:outline-none"
                placeholder="Enter your prompt here..."
              />
            </div>

            <div className="flex items-center space-x-3">
              <input
                type="checkbox"
                id="enableOptimization"
                checked={enableOptimization}
                onChange={(e) => setEnableOptimization(e.target.checked)}
                className="w-4 h-4 text-blue-600 bg-gray-700 border-gray-600 rounded focus:ring-blue-500"
              />
              <label htmlFor="enableOptimization" className="text-sm font-medium text-white">
                Enable prompt optimization for cost reduction
              </label>
            </div>
          </div>
        </div>

        <div className="mt-6 flex space-x-4">
          <button
            onClick={runDemo}
            disabled={isLoading}
            className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white font-bold py-3 px-6 rounded-lg transition-colors"
          >
            {isLoading ? '🔄 Running Demo...' : '🚀 Run x402 Demo'}
          </button>
          
          <button
            onClick={runCostAnalysis}
            disabled={isLoading}
            className="bg-green-600 hover:bg-green-700 disabled:bg-gray-600 text-white font-bold py-3 px-6 rounded-lg transition-colors"
          >
            📊 Cost Analysis
          </button>
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="bg-red-900 border border-red-700 text-red-100 px-4 py-3 rounded-lg">
          <h3 className="font-bold">❌ Error</h3>
          <p>{error}</p>
        </div>
      )}

      {/* Results Display */}
      {result && (
        <div className="space-y-6">
          {/* API Call Results */}
          <div className="bg-gray-800 rounded-lg p-6">
            <h2 className="text-2xl font-bold text-white mb-4">🤖 API Call Results</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-lg font-semibold text-white mb-2">Original Prompt</h3>
                <p className="text-sm text-gray-300 bg-gray-700 p-3 rounded">
                  {result.apiCall.originalPrompt}
                </p>
              </div>
              
              <div>
                <h3 className="text-lg font-semibold text-white mb-2">Optimized Prompt</h3>
                <p className="text-sm text-gray-300 bg-gray-700 p-3 rounded">
                  {result.apiCall.optimizedPrompt}
                </p>
              </div>
            </div>

            <div className="mt-4">
              <h3 className="text-lg font-semibold text-white mb-2">Response</h3>
              <p className="text-sm text-gray-300 bg-gray-700 p-3 rounded max-h-40 overflow-y-auto">
                {result.apiCall.response}
              </p>
            </div>

            <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-gray-700 rounded-lg p-3 text-center">
                <p className="text-sm text-gray-400">Provider</p>
                <p className="text-lg font-bold text-white">{result.apiCall.provider}</p>
              </div>
              <div className="bg-gray-700 rounded-lg p-3 text-center">
                <p className="text-sm text-gray-400">Model</p>
                <p className="text-lg font-bold text-white">{result.apiCall.model}</p>
              </div>
              <div className="bg-gray-700 rounded-lg p-3 text-center">
                <p className="text-sm text-gray-400">Cost</p>
                <p className="text-lg font-bold text-green-400">${result.apiCall.actualCost.toFixed(6)}</p>
              </div>
              <div className="bg-gray-700 rounded-lg p-3 text-center">
                <p className="text-sm text-gray-400">Duration</p>
                <p className="text-lg font-bold text-blue-400">{result.apiCall.duration}ms</p>
              </div>
            </div>
          </div>

          {/* Optimization Results */}
          {result.optimization && (
            <div className="bg-gray-800 rounded-lg p-6">
              <h2 className="text-2xl font-bold text-white mb-4">🔧 Optimization Results</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-gray-700 rounded-lg p-4 text-center">
                  <p className="text-sm text-gray-400">Original Cost</p>
                  <p className="text-2xl font-bold text-red-400">
                    ${result.optimization.originalCost.toFixed(6)}
                  </p>
                </div>
                <div className="bg-gray-700 rounded-lg p-4 text-center">
                  <p className="text-sm text-gray-400">Optimized Cost</p>
                  <p className="text-2xl font-bold text-green-400">
                    ${result.optimization.optimizedCost.toFixed(6)}
                  </p>
                </div>
                <div className="bg-gray-700 rounded-lg p-4 text-center">
                  <p className="text-sm text-gray-400">Savings</p>
                  <p className="text-2xl font-bold text-blue-400">
                    {result.optimization.savingsPercentage.toFixed(1)}%
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Payment Results */}
          <div className="bg-gray-800 rounded-lg p-6">
            <h2 className="text-2xl font-bold text-white mb-4">💳 x402 Payment Results</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-gray-700 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-white mb-2">Payment Details</h3>
                <div className="space-y-2">
                  <p className="text-sm text-gray-300">
                    <span className="font-medium">Amount:</span> {result.payment.amount} {result.payment.currency}
                  </p>
                  <p className="text-sm text-gray-300">
                    <span className="font-medium">Status:</span> 
                    <span className="ml-2 px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs">
                      {result.payment.status}
                    </span>
                  </p>
                  <p className="text-sm text-gray-300">
                    <span className="font-medium">Gas Used:</span> {result.payment.gasUsed.toLocaleString()}
                  </p>
                </div>
              </div>
              
              <div className="bg-gray-700 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-white mb-2">Transaction Hash</h3>
                <p className="text-sm text-gray-300 font-mono break-all">
                  {result.payment.transactionHash}
                </p>
              </div>
            </div>
          </div>

          {/* Cost Analysis */}
          <div className="bg-gray-800 rounded-lg p-6">
            <h2 className="text-2xl font-bold text-white mb-4">📊 Cost Analysis</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-gray-700 rounded-lg p-4 text-center">
                <p className="text-sm text-gray-400">Baseline Cost</p>
                <p className="text-2xl font-bold text-red-400">
                  ${result.costAnalysis.baselineCost.toFixed(6)}
                </p>
              </div>
              <div className="bg-gray-700 rounded-lg p-4 text-center">
                <p className="text-sm text-gray-400">Actual Cost</p>
                <p className="text-2xl font-bold text-green-400">
                  ${result.costAnalysis.actualCost.toFixed(6)}
                </p>
              </div>
              <div className="bg-gray-700 rounded-lg p-4 text-center">
                <p className="text-sm text-gray-400">Total Savings</p>
                <p className="text-2xl font-bold text-blue-400">
                  {result.costAnalysis.savingsPercentage.toFixed(1)}%
                </p>
              </div>
            </div>

            <div className="mt-4 text-center">
              <span className={`px-4 py-2 rounded-full text-sm font-medium ${
                result.costAnalysis.withinBudget 
                  ? 'bg-green-100 text-green-800' 
                  : 'bg-red-100 text-red-800'
              }`}>
                {result.costAnalysis.withinBudget ? '✅ Within Budget' : '❌ Over Budget'}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

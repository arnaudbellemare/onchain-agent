"use client";

import { useState } from 'react';
import { apiProviders, X402APIClient, getBitcoinPrice, getDuneQueryResults, getBitcoinAnalysis } from '@/lib/apiProviders';

interface APIResult {
  id: string;
  provider: string;
  endpoint: string;
  cost: number;
  result: Record<string, unknown> | null;
  timestamp: Date;
  transactionHash?: string;
  status: 'success' | 'error' | 'pending';
}

export default function RealAPIIntegration() {
  const [apiClient] = useState<X402APIClient | null>(null);
  const [results, setResults] = useState<APIResult[]>([]);
  const [loading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Quick action functions
  const getBitcoinPriceAction = async () => {
    if (!apiClient) return;
    try {
      const result = await getBitcoinPrice(apiClient);
      const apiResult: APIResult = {
        id: `api_${Date.now()}`,
        provider: 'CoinGecko',
        endpoint: 'Get Bitcoin Price',
        cost: 0.005,
        result: result,
        timestamp: new Date(),
        status: 'success'
      };
      setResults(prev => [apiResult, ...prev]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to get Bitcoin price');
    }
  };

  const getBitcoinAnalysisAction = async () => {
    if (!apiClient) return;
    try {
      const result = await getBitcoinAnalysis(apiClient);
      const apiResult: APIResult = {
        id: `api_${Date.now()}`,
        provider: 'AIxbt',
        endpoint: 'Bitcoin AI Analysis',
        cost: 0.02,
        result: result,
        timestamp: new Date(),
        status: 'success'
      };
      setResults(prev => [apiResult, ...prev]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to get Bitcoin analysis');
    }
  };

  const getDuneDataAction = async () => {
    if (!apiClient) return;
    try {
      // Example Dune query ID (would be real in production)
      const result = await getDuneQueryResults(apiClient, 123456);
      const apiResult: APIResult = {
        id: `api_${Date.now()}`,
        provider: 'Dune Analytics',
        endpoint: 'Query Results',
        cost: 0.01,
        result: result,
        timestamp: new Date(),
        status: 'success'
      };
      setResults(prev => [apiResult, ...prev]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to get Dune data');
    }
  };

  return (
    <div className="bg-white border border-gray-200 rounded-2xl p-8">
      <h3 className="text-2xl font-semibold text-gray-900 mb-6">Real API Integration with x402</h3>
      
      {/* Status */}
      <div className="mb-6">
        <div className="flex items-center space-x-3 mb-4">
          <div className={`w-3 h-3 rounded-full ${apiClient ? 'bg-green-500' : 'bg-red-500'}`}></div>
          <span className="text-sm font-medium text-gray-700">
            {apiClient ? 'API Client Ready' : 'API Client Not Initialized'}
          </span>
        </div>
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}
        {loading && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
            <p className="text-sm text-blue-600">Loading: {loading}</p>
          </div>
        )}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <button
          onClick={getBitcoinPriceAction}
          disabled={!apiClient || loading !== null}
          className="bg-green-50 hover:bg-green-100 border border-green-200 rounded-xl p-4 text-left transition-colors disabled:opacity-50"
        >
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-green-500 rounded-lg flex items-center justify-center">
              <span className="text-white text-sm font-bold">₿</span>
            </div>
            <div>
              <div className="font-medium text-gray-900">Bitcoin Price</div>
              <div className="text-sm text-gray-600">$0.005 USDC</div>
            </div>
          </div>
        </button>

        <button
          onClick={getBitcoinAnalysisAction}
          disabled={!apiClient || loading !== null}
          className="bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-xl p-4 text-left transition-colors disabled:opacity-50"
        >
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
              <span className="text-white text-sm font-bold">AI</span>
            </div>
            <div>
              <div className="font-medium text-gray-900">Bitcoin Analysis</div>
              <div className="text-sm text-gray-600">$0.02 USDC</div>
            </div>
          </div>
        </button>

        <button
          onClick={getDuneDataAction}
          disabled={!apiClient || loading !== null}
          className="bg-purple-50 hover:bg-purple-100 border border-purple-200 rounded-xl p-4 text-left transition-colors disabled:opacity-50"
        >
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-purple-500 rounded-lg flex items-center justify-center">
              <span className="text-white text-sm font-bold">📊</span>
            </div>
            <div>
              <div className="font-medium text-gray-900">Dune Analytics</div>
              <div className="text-sm text-gray-600">$0.01 USDC</div>
            </div>
          </div>
        </button>
      </div>

      {/* API Providers */}
      <div className="mb-8">
        <h4 className="text-lg font-semibold text-gray-900 mb-4">Available API Providers</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {apiProviders.map((provider) => (
            <div key={provider.id} className="bg-gray-50 border border-gray-200 rounded-xl p-4">
              <div className="flex items-center justify-between mb-2">
                <h5 className="font-medium text-gray-900">{provider.name}</h5>
                <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                  provider.x402Enabled 
                    ? 'bg-green-100 text-green-700' 
                    : 'bg-gray-100 text-gray-700'
                }`}>
                  {provider.x402Enabled ? 'x402' : 'Traditional'}
                </div>
              </div>
              <p className="text-sm text-gray-600 mb-3">{provider.description}</p>
              <div className="text-sm text-gray-700">
                <div>Cost: ${provider.costPerCall} USDC/call</div>
                <div>Endpoints: {provider.endpoints.length}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Results */}
      {results.length > 0 && (
        <div>
          <h4 className="text-lg font-semibold text-gray-900 mb-4">API Call Results</h4>
          <div className="space-y-3">
            {results.map((result) => (
              <div key={result.id} className="bg-gray-50 border border-gray-200 rounded-xl p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-3">
                    <div className={`w-2 h-2 rounded-full ${
                      result.status === 'success' ? 'bg-green-500' : 'bg-red-500'
                    }`}></div>
                    <span className="font-medium text-gray-900">{result.provider}</span>
                    <span className="text-sm text-gray-600">{result.endpoint}</span>
                  </div>
                  <div className="text-sm text-gray-600">
                    ${result.cost} USDC
                  </div>
                </div>
                <div className="text-xs text-gray-500 mb-2">
                  {result.timestamp.toLocaleString()}
                </div>
                {result.status === 'success' && result.result && (
                  <div className="bg-white border border-gray-200 rounded-lg p-3">
                    <pre className="text-xs text-gray-700 overflow-x-auto">
                      {JSON.stringify(result.result, null, 2)}
                    </pre>
                  </div>
                )}
                {result.status === 'error' && (
                  <div className="text-sm text-red-600">
                    API call failed
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

'use client';

import { useState } from 'react';

export default function APIDocsPage() {
  const [activeTab, setActiveTab] = useState('overview');
  const [apiKey, setApiKey] = useState('');
  const [testResponse, setTestResponse] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const testAPI = async (endpoint: string, method: 'GET' | 'POST', data?: any) => {
    setLoading(true);
    try {
      const response = await fetch(`/api/v1${endpoint}`, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'X-API-Key': apiKey || 'demo-key'
        },
        body: data ? JSON.stringify(data) : undefined
      });
      
      const result = await response.json();
      setTestResponse(result);
    } catch (error) {
      setTestResponse({ error: 'Request failed', details: error });
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 px-8 py-12">
            <h1 className="text-4xl font-bold text-white mb-4">
              AI Agent Cost Optimization API
            </h1>
            <p className="text-xl text-blue-100 mb-6">
              Unified API for AI agent cost optimization and x402 micropayment integration
            </p>
            <div className="flex items-center space-x-4">
              <span className="bg-white/20 px-3 py-1 rounded-full text-white text-sm">
                Version 1.0.0
              </span>
              <span className="bg-white/20 px-3 py-1 rounded-full text-white text-sm">
                REST API
              </span>
              <span className="bg-white/20 px-3 py-1 rounded-full text-white text-sm">
                JSON
              </span>
            </div>
          </div>

          <div className="flex">
            {/* Sidebar */}
            <div className="w-1/3 bg-gray-100 p-6">
              <nav className="space-y-2">
                {[
                  { id: 'overview', label: 'Overview' },
                  { id: 'authentication', label: 'Authentication' },
                  { id: 'endpoints', label: 'Endpoints' },
                  { id: 'examples', label: 'Code Examples' },
                  { id: 'sdk', label: 'SDK & Libraries' },
                  { id: 'testing', label: 'API Testing' }
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full text-left px-4 py-2 rounded-lg transition-colors ${
                      activeTab === tab.id
                        ? 'bg-blue-600 text-white'
                        : 'text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </nav>
            </div>

            {/* Content */}
            <div className="flex-1 p-8">
              {activeTab === 'overview' && (
                <div>
                  <h2 className="text-3xl font-bold mb-6">API Overview</h2>
                  <div className="prose max-w-none">
                    <p className="text-lg text-gray-600 mb-6">
                      Our API provides a unified interface for AI agent cost optimization using the x402 micropayment protocol. 
                      Automatically route your AI requests through the most cost-effective providers while maintaining quality.
                    </p>

                    <div className="grid md:grid-cols-2 gap-6 mb-8">
                      <div className="bg-blue-50 p-6 rounded-lg">
                        <h3 className="text-xl font-semibold mb-3 text-blue-900">Key Features</h3>
                        <ul className="space-y-2 text-blue-800">
                          <li>• Automatic cost optimization</li>
                          <li>• Multi-provider routing</li>
                          <li>• Real-time pricing</li>
                          <li>• Micropayment integration</li>
                          <li>• Usage analytics</li>
                        </ul>
                      </div>
                      <div className="bg-green-50 p-6 rounded-lg">
                        <h3 className="text-xl font-semibold mb-3 text-green-900">Benefits</h3>
                        <ul className="space-y-2 text-green-800">
                          <li>• Save 30-50% on AI costs</li>
                          <li>• Pay per use with x402</li>
                          <li>• No upfront commitments</li>
                          <li>• Real-time cost monitoring</li>
                          <li>• Enterprise-grade reliability</li>
                        </ul>
                      </div>
                    </div>

                    <div className="bg-gray-50 p-6 rounded-lg">
                      <h3 className="text-xl font-semibold mb-4">Base URL</h3>
                      <code className="bg-white px-4 py-2 rounded border text-lg">
                        https://your-domain.com/api/v1
                      </code>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'authentication' && (
                <div>
                  <h2 className="text-3xl font-bold mb-6">Authentication</h2>
                  <div className="prose max-w-none">
                    <p className="text-lg text-gray-600 mb-6">
                      All API requests require an API key passed in the <code>X-API-Key</code> header.
                    </p>

                    <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-6">
                      <div className="flex">
                        <div className="ml-3">
                          <p className="text-sm text-yellow-700">
                            <strong>Get your API key:</strong> Visit the dashboard to generate your API key for production use.
                          </p>
                        </div>
                      </div>
                    </div>

                    <h3 className="text-xl font-semibold mb-4">Header Format</h3>
                    <pre className="bg-gray-900 text-green-400 p-4 rounded-lg overflow-x-auto">
{`X-API-Key: your-api-key-here`}
                    </pre>

                    <h3 className="text-xl font-semibold mb-4 mt-8">Example Request</h3>
                    <pre className="bg-gray-900 text-green-400 p-4 rounded-lg overflow-x-auto">
{`curl -X POST "https://your-domain.com/api/v1/optimize" \\
  -H "Content-Type: application/json" \\
  -H "X-API-Key: your-api-key" \\
  -d '{
    "prompt": "Explain quantum computing",
    "provider": "openai",
    "maxCost": 0.10,
    "walletAddress": "0x..."
  }'`}
                    </pre>
                  </div>
                </div>
              )}

              {activeTab === 'endpoints' && (
                <div>
                  <h2 className="text-3xl font-bold mb-6">API Endpoints</h2>
                  
                  <div className="space-y-8">
                    {/* Optimize Endpoint */}
                    <div className="border rounded-lg p-6">
                      <div className="flex items-center mb-4">
                        <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-semibold mr-4">
                          POST
                        </span>
                        <code className="text-lg font-mono">/optimize</code>
                      </div>
                      <p className="text-gray-600 mb-4">
                        Optimize AI agent costs using x402 protocol and smart provider routing.
                      </p>
                      
                      <h4 className="font-semibold mb-2">Parameters</h4>
                      <div className="bg-gray-50 p-4 rounded-lg mb-4">
                        <pre className="text-sm">{`{
  "action": "optimize",
  "prompt": "string (required) - Your AI prompt",
  "provider": "string (optional) - AI provider (openai, anthropic, perplexity)",
  "maxCost": "number (optional) - Maximum cost in USD",
  "walletAddress": "string (required) - Your wallet address"
}`}</pre>
                      </div>

                      <h4 className="font-semibold mb-2">Response</h4>
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <pre className="text-sm">{`{
  "success": true,
  "data": {
    "originalCost": 0.045,
    "optimizedCost": 0.028,
    "savings": 0.017,
    "savingsPercentage": 37.8,
    "recommendedProvider": "openai",
    "response": "Optimized AI response...",
    "transactionHash": "0x...",
    "timestamp": "2024-01-15T10:30:00Z"
  },
  "error": null,
  "timestamp": "2024-01-15T10:30:00Z",
  "version": "1.0.0"
}`}</pre>
                      </div>
                    </div>

                    {/* Chat Endpoint */}
                    <div className="border rounded-lg p-6">
                      <div className="flex items-center mb-4">
                        <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-semibold mr-4">
                          POST
                        </span>
                        <code className="text-lg font-mono">/chat</code>
                      </div>
                      <p className="text-gray-600 mb-4">
                        Chat with AI through cost-optimized routing and real-time cost tracking.
                      </p>
                      
                      <h4 className="font-semibold mb-2">Parameters</h4>
                      <div className="bg-gray-50 p-4 rounded-lg mb-4">
                        <pre className="text-sm">{`{
  "action": "chat",
  "message": "string (required) - Your message",
  "walletAddress": "string (required) - Your wallet address"
}`}</pre>
                      </div>
                    </div>

                    {/* Analytics Endpoint */}
                    <div className="border rounded-lg p-6">
                      <div className="flex items-center mb-4">
                        <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-semibold mr-4">
                          GET
                        </span>
                        <code className="text-lg font-mono">/analytics</code>
                      </div>
                      <p className="text-gray-600 mb-4">
                        Get detailed cost analytics and savings reports for your wallet.
                      </p>
                      
                      <h4 className="font-semibold mb-2">Query Parameters</h4>
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <pre className="text-sm">?action=analytics&walletAddress=0x...</pre>
                      </div>
                    </div>

                    {/* Providers Endpoint */}
                    <div className="border rounded-lg p-6">
                      <div className="flex items-center mb-4">
                        <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-semibold mr-4">
                          GET
                        </span>
                        <code className="text-lg font-mono">/providers</code>
                      </div>
                      <p className="text-gray-600 mb-4">
                        Get available AI providers and current pricing information.
                      </p>
                      
                      <h4 className="font-semibold mb-2">Query Parameters</h4>
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <pre className="text-sm">?action=providers</pre>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'examples' && (
                <div>
                  <h2 className="text-3xl font-bold mb-6">Code Examples</h2>
                  
                  <div className="space-y-8">
                    {/* JavaScript */}
                    <div className="border rounded-lg p-6">
                      <h3 className="text-xl font-semibold mb-4">JavaScript/Node.js</h3>
                      <pre className="bg-gray-900 text-green-400 p-4 rounded-lg overflow-x-auto">
{`// Optimize AI costs
const response = await fetch('/api/v1', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'X-API-Key': 'your-api-key'
  },
  body: JSON.stringify({
    action: 'optimize',
    prompt: 'Explain quantum computing',
    provider: 'openai',
    maxCost: 0.10,
    walletAddress: '0x...'
  })
});

const result = await response.json();
console.log('Savings:', result.data.savingsPercentage + '%');

// Chat with AI
const chatResponse = await fetch('/api/v1', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'X-API-Key': 'your-api-key'
  },
  body: JSON.stringify({
    action: 'chat',
    message: 'Hello, how are you?',
    walletAddress: '0x...'
  })
});

const chatResult = await chatResponse.json();
console.log('Response:', chatResult.data.message);`}
                      </pre>
                    </div>

                    {/* Python */}
                    <div className="border rounded-lg p-6">
                      <h3 className="text-xl font-semibold mb-4">Python</h3>
                      <pre className="bg-gray-900 text-green-400 p-4 rounded-lg overflow-x-auto">
{`import requests

# Optimize AI costs
response = requests.post('/api/v1', 
  headers={'X-API-Key': 'your-api-key'},
  json={
    'action': 'optimize',
    'prompt': 'Explain quantum computing',
    'provider': 'openai',
    'maxCost': 0.10,
    'walletAddress': '0x...'
  }
)

result = response.json()
print(f"Savings: {result['data']['savingsPercentage']}%")

# Chat with AI
chat_response = requests.post('/api/v1',
  headers={'X-API-Key': 'your-api-key'},
  json={
    'action': 'chat',
    'message': 'Hello, how are you?',
    'walletAddress': '0x...'
  }
)

chat_result = chat_response.json()
print(f"Response: {chat_result['data']['message']}")`}
                      </pre>
                    </div>

                    {/* cURL */}
                    <div className="border rounded-lg p-6">
                      <h3 className="text-xl font-semibold mb-4">cURL</h3>
                      <pre className="bg-gray-900 text-green-400 p-4 rounded-lg overflow-x-auto">
{`# Optimize AI costs
curl -X POST "https://your-domain.com/api/v1" \\
  -H "Content-Type: application/json" \\
  -H "X-API-Key: your-api-key" \\
  -d '{
    "action": "optimize",
    "prompt": "Explain quantum computing",
    "provider": "openai",
    "maxCost": 0.10,
    "walletAddress": "0x..."
  }'

# Chat with AI
curl -X POST "https://your-domain.com/api/v1" \\
  -H "Content-Type: application/json" \\
  -H "X-API-Key: your-api-key" \\
  -d '{
    "action": "chat",
    "message": "Hello, how are you?",
    "walletAddress": "0x..."
  }'

# Get analytics
curl -X GET "https://your-domain.com/api/v1?action=analytics&walletAddress=0x..." \\
  -H "X-API-Key: your-api-key"`}
                      </pre>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'sdk' && (
                <div>
                  <h2 className="text-3xl font-bold mb-6">SDK & Libraries</h2>
                  
                  <div className="space-y-6">
                    <div className="bg-blue-50 p-6 rounded-lg">
                      <h3 className="text-xl font-semibold mb-4 text-blue-900">JavaScript/TypeScript SDK</h3>
                      <p className="text-blue-800 mb-4">
                        Easy-to-use SDK for Node.js and browser environments.
                      </p>
                      <div className="bg-white p-4 rounded border">
                        <pre className="text-sm">{`npm install @onchain-agent/sdk

import { AIAgentClient } from '@onchain-agent/sdk';

const client = new AIAgentClient({
  apiKey: 'your-api-key',
  baseUrl: 'https://your-domain.com/api/v1'
});

// Optimize costs
const result = await client.optimize({
  prompt: 'Explain quantum computing',
  provider: 'openai',
  maxCost: 0.10,
  walletAddress: '0x...'
});

// Chat with AI
const response = await client.chat({
  message: 'Hello!',
  walletAddress: '0x...'
});`}</pre>
                      </div>
                    </div>

                    <div className="bg-green-50 p-6 rounded-lg">
                      <h3 className="text-xl font-semibold mb-4 text-green-900">Python SDK</h3>
                      <p className="text-green-800 mb-4">
                        Python library for easy integration with your AI applications.
                      </p>
                      <div className="bg-white p-4 rounded border">
                        <pre className="text-sm">{`pip install onchain-agent-sdk

from onchain_agent import AIAgentClient

client = AIAgentClient(
    api_key='your-api-key',
    base_url='https://your-domain.com/api/v1'
)

# Optimize costs
result = client.optimize(
    prompt='Explain quantum computing',
    provider='openai',
    max_cost=0.10,
    wallet_address='0x...'
)

# Chat with AI
response = client.chat(
    message='Hello!',
    wallet_address='0x...'
)`}</pre>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'testing' && (
                <div>
                  <h2 className="text-3xl font-bold mb-6">API Testing</h2>
                  
                  <div className="bg-gray-50 p-6 rounded-lg mb-6">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      API Key (for testing)
                    </label>
                    <input
                      type="text"
                      value={apiKey}
                      onChange={(e) => setApiKey(e.target.value)}
                      placeholder="Enter your API key or use 'demo-key' for testing"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="border rounded-lg p-6">
                      <h3 className="text-lg font-semibold mb-4">Test Optimize Endpoint</h3>
                      <button
                        onClick={() => testAPI('', 'POST', {
                          action: 'optimize',
                          prompt: 'Explain quantum computing in simple terms',
                          provider: 'openai',
                          maxCost: 0.10,
                          walletAddress: '0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6'
                        })}
                        disabled={loading}
                        className="w-full bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50"
                      >
                        {loading ? 'Testing...' : 'Test Optimize'}
                      </button>
                    </div>

                    <div className="border rounded-lg p-6">
                      <h3 className="text-lg font-semibold mb-4">Test Chat Endpoint</h3>
                      <button
                        onClick={() => testAPI('', 'POST', {
                          action: 'chat',
                          message: 'Hello! How can you help me save money on AI costs?',
                          walletAddress: '0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6'
                        })}
                        disabled={loading}
                        className="w-full bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 disabled:opacity-50"
                      >
                        {loading ? 'Testing...' : 'Test Chat'}
                      </button>
                    </div>

                    <div className="border rounded-lg p-6">
                      <h3 className="text-lg font-semibold mb-4">Test Providers Endpoint</h3>
                      <button
                        onClick={() => testAPI('?action=providers', 'GET')}
                        disabled={loading}
                        className="w-full bg-purple-600 text-white px-4 py-2 rounded-md hover:bg-purple-700 disabled:opacity-50"
                      >
                        {loading ? 'Testing...' : 'Get Providers'}
                      </button>
                    </div>

                    <div className="border rounded-lg p-6">
                      <h3 className="text-lg font-semibold mb-4">Test Analytics Endpoint</h3>
                      <button
                        onClick={() => testAPI('?action=analytics&walletAddress=0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6', 'GET')}
                        disabled={loading}
                        className="w-full bg-orange-600 text-white px-4 py-2 rounded-md hover:bg-orange-700 disabled:opacity-50"
                      >
                        {loading ? 'Testing...' : 'Get Analytics'}
                      </button>
                    </div>
                  </div>

                  {testResponse && (
                    <div className="mt-8">
                      <h3 className="text-lg font-semibold mb-4">Response</h3>
                      <pre className="bg-gray-900 text-green-400 p-4 rounded-lg overflow-x-auto max-h-96">
                        {JSON.stringify(testResponse, null, 2)}
                      </pre>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

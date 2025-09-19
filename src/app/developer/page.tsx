'use client';

import { useState, useEffect } from 'react';

export default function DeveloperPage() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [apiKey, setApiKey] = useState('');
  const [usage, setUsage] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Load saved API key from localStorage
    const savedKey = localStorage.getItem('onchain-agent-api-key');
    if (savedKey) {
      setApiKey(savedKey);
    }
  }, []);

  const saveApiKey = (key: string) => {
    setApiKey(key);
    localStorage.setItem('onchain-agent-api-key', key);
  };

  const testConnection = async () => {
    if (!apiKey) return;
    
    setLoading(true);
    try {
      const response = await fetch('/api/v1?action=info', {
        headers: { 'X-API-Key': apiKey }
      });
      const result = await response.json();
      setUsage(result);
    } catch (error) {
      console.error('Connection test failed:', error);
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-lg mb-8">
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 px-8 py-12">
            <h1 className="text-4xl font-bold text-white mb-4">
              Developer Dashboard
            </h1>
            <p className="text-xl text-blue-100 mb-6">
              Manage your API integration and monitor usage
            </p>
          </div>

          {/* API Key Setup */}
          <div className="p-8">
            <div className="max-w-2xl">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                API Key
              </label>
              <div className="flex space-x-4">
                <input
                  type="password"
                  value={apiKey}
                  onChange={(e) => saveApiKey(e.target.value)}
                  placeholder="Enter your API key"
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button
                  onClick={testConnection}
                  disabled={!apiKey || loading}
                  className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50"
                >
                  {loading ? 'Testing...' : 'Test Connection'}
                </button>
              </div>
              <p className="text-sm text-gray-500 mt-2">
                Get your API key from the main dashboard
              </p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <div className="bg-white rounded-lg shadow-lg mb-8">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-8">
              {[
                { id: 'dashboard', label: 'Dashboard', icon: '📊' },
                { id: 'quickstart', label: 'Quick Start', icon: '🚀' },
                { id: 'examples', label: 'Examples', icon: '💡' },
                { id: 'monitoring', label: 'Monitoring', icon: '📈' },
                { id: 'troubleshooting', label: 'Help', icon: '❓' }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <span>{tab.icon}</span>
                  <span>{tab.label}</span>
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Content */}
        <div className="bg-white rounded-lg shadow-lg">
          <div className="p-8">
            {activeTab === 'dashboard' && (
              <div>
                <h2 className="text-3xl font-bold mb-6">Integration Dashboard</h2>
                
                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                  <div className="bg-blue-50 p-6 rounded-lg">
                    <h3 className="text-lg font-semibold text-blue-900 mb-2">API Calls</h3>
                    <p className="text-3xl font-bold text-blue-600">1,247</p>
                    <p className="text-sm text-blue-700">This month</p>
                  </div>
                  
                  <div className="bg-green-50 p-6 rounded-lg">
                    <h3 className="text-lg font-semibold text-green-900 mb-2">Total Savings</h3>
                    <p className="text-3xl font-bold text-green-600">$127.43</p>
                    <p className="text-sm text-green-700">34.2% average</p>
                  </div>
                  
                  <div className="bg-purple-50 p-6 rounded-lg">
                    <h3 className="text-lg font-semibold text-purple-900 mb-2">Active Wallets</h3>
                    <p className="text-3xl font-bold text-purple-600">3</p>
                    <p className="text-sm text-purple-700">Connected</p>
                  </div>
                  
                  <div className="bg-orange-50 p-6 rounded-lg">
                    <h3 className="text-lg font-semibold text-orange-900 mb-2">Uptime</h3>
                    <p className="text-3xl font-bold text-orange-600">99.9%</p>
                    <p className="text-sm text-orange-700">Last 30 days</p>
                  </div>
                </div>

                <div className="grid lg:grid-cols-2 gap-8">
                  <div>
                    <h3 className="text-xl font-semibold mb-4">Recent Activity</h3>
                    <div className="space-y-4">
                      {[
                        { action: 'Optimize', prompt: 'Explain quantum computing', savings: '$0.023', time: '2 min ago' },
                        { action: 'Chat', prompt: 'Hello, how are you?', savings: '$0.015', time: '5 min ago' },
                        { action: 'Optimize', prompt: 'What is machine learning?', savings: '$0.031', time: '12 min ago' },
                        { action: 'Chat', prompt: 'Help with Python', savings: '$0.019', time: '18 min ago' }
                      ].map((item, index) => (
                        <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                          <div>
                            <p className="font-medium">{item.action}: {item.prompt}</p>
                            <p className="text-sm text-gray-500">{item.time}</p>
                          </div>
                          <div className="text-right">
                            <p className="font-semibold text-green-600">Saved {item.savings}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h3 className="text-xl font-semibold mb-4">Provider Usage</h3>
                    <div className="space-y-4">
                      {[
                        { provider: 'OpenAI', calls: 456, cost: '$89.23', savings: '$31.45' },
                        { provider: 'Anthropic', calls: 321, cost: '$67.89', savings: '$23.12' },
                        { provider: 'Perplexity', calls: 470, cost: '$45.67', savings: '$18.34' }
                      ].map((provider, index) => (
                        <div key={index} className="p-4 bg-gray-50 rounded-lg">
                          <div className="flex justify-between items-center mb-2">
                            <h4 className="font-medium">{provider.provider}</h4>
                            <span className="text-sm text-gray-500">{provider.calls} calls</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span>Cost: {provider.cost}</span>
                            <span className="text-green-600">Saved: {provider.savings}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'quickstart' && (
              <div>
                <h2 className="text-3xl font-bold mb-6">Quick Start Guide</h2>
                
                <div className="space-y-8">
                  <div className="bg-blue-50 p-6 rounded-lg">
                    <h3 className="text-xl font-semibold mb-4 text-blue-900">Step 1: Get Your API Key</h3>
                    <p className="text-blue-800 mb-4">
                      Visit the main dashboard to generate your API key for production use.
                    </p>
                    <button className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700">
                      Get API Key
                    </button>
                  </div>

                  <div className="bg-green-50 p-6 rounded-lg">
                    <h3 className="text-xl font-semibold mb-4 text-green-900">Step 2: Choose Your Integration Method</h3>
                    <div className="grid md:grid-cols-3 gap-4">
                      <div className="bg-white p-4 rounded-lg">
                        <h4 className="font-semibold mb-2">JavaScript/Node.js</h4>
                        <p className="text-sm text-gray-600 mb-3">Perfect for web applications</p>
                        <a href="/sdk/javascript/onchain-agent-sdk.js" download className="text-blue-600 hover:underline">
                          Download SDK →
                        </a>
                      </div>
                      <div className="bg-white p-4 rounded-lg">
                        <h4 className="font-semibold mb-2">Python</h4>
                        <p className="text-sm text-gray-600 mb-3">Great for data science and automation</p>
                        <a href="/sdk/python/onchain_agent_sdk.py" download className="text-blue-600 hover:underline">
                          Download SDK →
                        </a>
                      </div>
                      <div className="bg-white p-4 rounded-lg">
                        <h4 className="font-semibold mb-2">cURL</h4>
                        <p className="text-sm text-gray-600 mb-3">Universal HTTP client</p>
                        <a href="/sdk/curl/examples.sh" download className="text-blue-600 hover:underline">
                          Download Examples →
                        </a>
                      </div>
                    </div>
                  </div>

                  <div className="bg-purple-50 p-6 rounded-lg">
                    <h3 className="text-xl font-semibold mb-4 text-purple-900">Step 3: Test Your Integration</h3>
                    <p className="text-purple-800 mb-4">
                      Use our interactive API testing tools to verify your setup.
                    </p>
                    <div className="grid md:grid-cols-2 gap-4">
                      <button 
                        onClick={() => setActiveTab('examples')}
                        className="bg-purple-600 text-white px-4 py-2 rounded-md hover:bg-purple-700"
                      >
                        Try Examples
                      </button>
                      <a 
                        href="/api-docs" 
                        className="bg-purple-600 text-white px-4 py-2 rounded-md hover:bg-purple-700 text-center inline-block"
                      >
                        View API Docs
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'examples' && (
              <div>
                <h2 className="text-3xl font-bold mb-6">Integration Examples</h2>
                
                <div className="space-y-8">
                  {/* JavaScript Example */}
                  <div className="border rounded-lg p-6">
                    <h3 className="text-xl font-semibold mb-4">JavaScript/TypeScript</h3>
                    <pre className="bg-gray-900 text-green-400 p-4 rounded-lg overflow-x-auto">
{`// Initialize client
const client = new OnChainAgent.AIAgentClient({
  apiKey: 'your-api-key',
  baseUrl: 'https://your-domain.com/api/v1'
});

// Optimize AI costs
const result = await client.optimize({
  prompt: 'Explain quantum computing',
  provider: 'openai',
  maxCost: 0.10,
  walletAddress: '0x...'
});

console.log('Savings:', result.data.savingsPercentage + '%');
console.log('Response:', result.data.response);

// Chat with AI
const chatResult = await client.chat({
  message: 'Hello! How can you help me?',
  walletAddress: '0x...'
});

console.log('AI Response:', chatResult.data.message);
console.log('Cost:', '$' + chatResult.data.cost);`}
                    </pre>
                  </div>

                  {/* Python Example */}
                  <div className="border rounded-lg p-6">
                    <h3 className="text-xl font-semibold mb-4">Python</h3>
                    <pre className="bg-gray-900 text-green-400 p-4 rounded-lg overflow-x-auto">
{`from onchain_agent_sdk import AIAgentClient

# Initialize client
client = AIAgentClient(
    api_key='your-api-key',
    base_url='https://your-domain.com/api/v1'
)

# Optimize AI costs
result = client.optimize(
    prompt='Explain quantum computing',
    provider='openai',
    max_cost=0.10,
    wallet_address='0x...'
)

print(f"Savings: {result['data']['savingsPercentage']:.1f}%")
print(f"Response: {result['data']['response']}")

# Chat with AI
chat_result = client.chat(
    message='Hello! How can you help me?',
    wallet_address='0x...'
)

print(f"AI Response: {chat_result['data']['message']}")
print(f"Cost: \${chat_result['data']['cost']:.4f}")`}
                    </pre>
                  </div>

                  {/* cURL Example */}
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
    "message": "Hello! How can you help me?",
    "walletAddress": "0x..."
  }'`}
                    </pre>
                  </div>

                  {/* Real-world Integration */}
                  <div className="border rounded-lg p-6">
                    <h3 className="text-xl font-semibold mb-4">Real-world Integration Example</h3>
                    <p className="text-gray-600 mb-4">
                      Here&apos;s how to integrate cost optimization into your existing AI application:
                    </p>
                    <pre className="bg-gray-900 text-green-400 p-4 rounded-lg overflow-x-auto">
{`// Replace direct OpenAI calls with cost-optimized routing
async function askAI(question, walletAddress) {
  // Old way (expensive)
  // const response = await openai.chat.completions.create({...});
  
  // New way (cost-optimized)
  const client = new OnChainAgent.AIAgentClient({
    apiKey: process.env.ONCHAIN_AGENT_API_KEY,
    baseUrl: process.env.ONCHAIN_AGENT_BASE_URL
  });
  
  const result = await client.optimize({
    prompt: question,
    walletAddress: walletAddress,
    maxCost: 0.05 // Set your budget
  });
  
  return {
    response: result.data.response,
    cost: result.data.optimizedCost,
    savings: result.data.savings,
    savingsPercentage: result.data.savingsPercentage
  };
}

// Usage in your application
const aiResponse = await askAI(
  "Explain machine learning algorithms",
  userWalletAddress
);

console.log(\`Saved \${aiResponse.savingsPercentage}% compared to direct API calls\`);`}
                    </pre>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'monitoring' && (
              <div>
                <h2 className="text-3xl font-bold mb-6">Usage Monitoring</h2>
                
                <div className="space-y-6">
                  <div className="bg-blue-50 p-6 rounded-lg">
                    <h3 className="text-xl font-semibold mb-4 text-blue-900">Real-time Metrics</h3>
                    <div className="grid md:grid-cols-3 gap-4">
                      <div className="bg-white p-4 rounded-lg">
                        <h4 className="font-semibold text-gray-700">API Calls Today</h4>
                        <p className="text-2xl font-bold text-blue-600">247</p>
                      </div>
                      <div className="bg-white p-4 rounded-lg">
                        <h4 className="font-semibold text-gray-700">Cost Today</h4>
                        <p className="text-2xl font-bold text-green-600">$12.34</p>
                      </div>
                      <div className="bg-white p-4 rounded-lg">
                        <h4 className="font-semibold text-gray-700">Savings Today</h4>
                        <p className="text-2xl font-bold text-purple-600">$4.56</p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-gray-50 p-6 rounded-lg">
                    <h3 className="text-xl font-semibold mb-4">Cost Trends</h3>
                    <div className="h-64 bg-white rounded-lg flex items-center justify-center">
                      <p className="text-gray-500">Cost trend chart would be displayed here</p>
                    </div>
                  </div>

                  <div className="bg-gray-50 p-6 rounded-lg">
                    <h3 className="text-xl font-semibold mb-4">Alerts & Notifications</h3>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between p-3 bg-white rounded-lg">
                        <div>
                          <p className="font-medium">Daily spending limit reached</p>
                          <p className="text-sm text-gray-500">You&apos;ve spent $50 today</p>
                        </div>
                        <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full text-xs">
                          Warning
                        </span>
                      </div>
                      <div className="flex items-center justify-between p-3 bg-white rounded-lg">
                        <div>
                          <p className="font-medium">High savings detected</p>
                          <p className="text-sm text-gray-500">45% savings on last 10 calls</p>
                        </div>
                        <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs">
                          Good
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'troubleshooting' && (
              <div>
                <h2 className="text-3xl font-bold mb-6">Help & Troubleshooting</h2>
                
                <div className="space-y-6">
                  <div className="bg-blue-50 p-6 rounded-lg">
                    <h3 className="text-xl font-semibold mb-4 text-blue-900">Common Issues</h3>
                    <div className="space-y-4">
                      <div>
                        <h4 className="font-semibold">API Key Invalid</h4>
                        <p className="text-sm text-blue-800">
                          Make sure you&apos;re using the correct API key from your dashboard. 
                          Check that there are no extra spaces or characters.
                        </p>
                      </div>
                      <div>
                        <h4 className="font-semibold">Wallet Connection Failed</h4>
                        <p className="text-sm text-blue-800">
                          Ensure your wallet address is valid and has sufficient USDC balance 
                          for micropayments.
                        </p>
                      </div>
                      <div>
                        <h4 className="font-semibold">Rate Limiting</h4>
                        <p className="text-sm text-blue-800">
                          If you hit rate limits, implement exponential backoff or contact 
                          support for higher limits.
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-green-50 p-6 rounded-lg">
                    <h3 className="text-xl font-semibold mb-4 text-green-900">Best Practices</h3>
                    <ul className="space-y-2 text-green-800">
                      <li>• Set appropriate maxCost limits to control spending</li>
                      <li>• Monitor your usage regularly through the dashboard</li>
                      <li>• Use the analytics endpoint to track savings</li>
                      <li>• Implement error handling for network issues</li>
                      <li>• Cache responses when appropriate to reduce costs</li>
                    </ul>
                  </div>

                  <div className="bg-purple-50 p-6 rounded-lg">
                    <h3 className="text-xl font-semibold mb-4 text-purple-900">Support Resources</h3>
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <h4 className="font-semibold mb-2">Documentation</h4>
                        <a href="/api-docs" className="text-purple-600 hover:underline">
                          Complete API Documentation →
                        </a>
                      </div>
                      <div>
                        <h4 className="font-semibold mb-2">SDK Downloads</h4>
                        <a href="/developer" className="text-purple-600 hover:underline">
                          Download SDKs →
                        </a>
                      </div>
                      <div>
                        <h4 className="font-semibold mb-2">Status Page</h4>
                        <a href="#" className="text-purple-600 hover:underline">
                          Check API Status →
                        </a>
                      </div>
                      <div>
                        <h4 className="font-semibold mb-2">Contact Support</h4>
                        <a href="mailto:support@onchain-agent.com" className="text-purple-600 hover:underline">
                          Email Support →
                        </a>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

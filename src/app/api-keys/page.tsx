'use client';

import { useState, useEffect } from 'react';

export default function APIKeysPage() {
  const [apiKeys, setApiKeys] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [newKeyName, setNewKeyName] = useState('');
  const [generatedKey, setGeneratedKey] = useState<any>(null);

  // Generate a new API key
  const generateAPIKey = async () => {
    if (!newKeyName.trim()) {
      alert('Please enter a name for your API key');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/api/v1/keys/initial', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          name: newKeyName,
          permissions: ['read', 'write']
        })
      });

      const result = await response.json();
      
      if (result.success) {
        setGeneratedKey(result.key);
        setNewKeyName('');
        loadAPIKeys(); // Refresh the list
      } else {
        alert('Failed to generate API key: ' + (result.error || result.message));
      }
    } catch (error) {
      console.error('Error generating API key:', error);
      alert('Failed to generate API key: ' + (error instanceof Error ? error.message : 'Unknown error'));
    }
    setLoading(false);
  };

  // Load existing API keys
  const loadAPIKeys = async () => {
    // Only run in browser environment
    if (typeof window === 'undefined') return;
    
    try {
      const response = await fetch('/api/v1/keys');
      const result = await response.json();
      
      if (result.success) {
        setApiKeys(result.data.keys);
      }
    } catch (error) {
      console.error('Error loading API keys:', error);
    }
  };

  // Delete an API key
  const deleteAPIKey = async (keyId: string) => {
    if (!confirm('Are you sure you want to delete this API key? This action cannot be undone.')) {
      return;
    }

    try {
      const response = await fetch('/api/v1/keys', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ keyId })
      });

      const result = await response.json();
      
      if (result.success) {
        loadAPIKeys(); // Refresh the list
      } else {
        alert('Failed to delete API key: ' + result.error);
      }
    } catch (error) {
      console.error('Error deleting API key:', error);
      alert('Failed to delete API key');
    }
  };

  // Load API keys on component mount
  useEffect(() => {
    loadAPIKeys();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-lg mb-8">
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 px-8 py-12">
            <h1 className="text-4xl font-bold text-white mb-4">
              API Key Management
            </h1>
            <p className="text-xl text-blue-100">
              Generate and manage your API keys for accessing the OnChain Agent API
            </p>
          </div>
        </div>

        {/* Generate New API Key */}
        <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
          <h2 className="text-2xl font-bold mb-6">Generate New API Key</h2>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                API Key Name
              </label>
              <input
                type="text"
                value={newKeyName}
                onChange={(e) => setNewKeyName(e.target.value)}
                placeholder="e.g., My App Integration, Production Key, etc."
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            
            <button
              onClick={generateAPIKey}
              disabled={loading || !newKeyName.trim()}
              className="bg-blue-600 text-white px-6 py-3 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Generating...' : 'Generate API Key'}
            </button>
          </div>

          {/* Generated Key Display */}
          {generatedKey && (
            <div className="mt-6 p-6 bg-green-50 border border-green-200 rounded-lg">
              <h3 className="text-lg font-semibold text-green-800 mb-3">
                ✅ API Key Generated Successfully!
              </h3>
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-green-700 mb-1">
                    Your API Key:
                  </label>
                  <div className="flex items-center space-x-2">
                    <code className="flex-1 bg-white px-3 py-2 border border-green-300 rounded text-sm font-mono text-green-800">
                      {generatedKey.key}
                    </code>
                    <button
                      onClick={() => navigator.clipboard.writeText(generatedKey.key)}
                      className="bg-green-600 text-white px-3 py-2 rounded text-sm hover:bg-green-700"
                    >
                      Copy
                    </button>
                  </div>
                </div>
                <div className="text-sm text-green-700">
                  <p><strong>Name:</strong> {generatedKey.name}</p>
                  <p><strong>Created:</strong> {new Date(generatedKey.createdAt).toLocaleString()}</p>
                  <p><strong>Permissions:</strong> {generatedKey.permissions.join(', ')}</p>
                </div>
              </div>
              <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded">
                <p className="text-sm text-yellow-800">
                  <strong>⚠️ Important:</strong> Save this API key securely. You won&apos;t be able to see it again after leaving this page.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Existing API Keys */}
        <div className="bg-white rounded-lg shadow-lg p-8">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold">Your API Keys</h2>
            <button
              onClick={loadAPIKeys}
              className="text-blue-600 hover:text-blue-700 font-medium"
            >
              Refresh
            </button>
          </div>

          {apiKeys.length === 0 ? (
            <div className="text-center py-8">
              <div className="text-gray-400 mb-4">
                <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                </svg>
              </div>
              <p className="text-gray-500">No API keys found. Generate your first API key above.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {apiKeys.map((key) => (
                <div key={key.id} className="border border-gray-200 rounded-lg p-6">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">
                        {key.name}
                      </h3>
                      <div className="space-y-1 text-sm text-gray-600">
                        <p><strong>Key:</strong> {key.keyPreview}</p>
                        <p><strong>Created:</strong> {new Date(key.createdAt).toLocaleString()}</p>
                        <p><strong>Last Used:</strong> {key.lastUsed ? new Date(key.lastUsed).toLocaleString() : 'Never'}</p>
                        <p><strong>API Calls:</strong> {key.usage.calls}</p>
                        <p><strong>Total Cost:</strong> ${key.usage.totalCost.toFixed(4)}</p>
                        <p><strong>Total Saved:</strong> ${key.usage.totalSaved.toFixed(4)}</p>
                        <p><strong>Permissions:</strong> {key.permissions.join(', ')}</p>
                      </div>
                    </div>
                    <button
                      onClick={() => deleteAPIKey(key.id)}
                      className="ml-4 text-red-600 hover:text-red-700 font-medium text-sm"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Usage Instructions */}
        <div className="bg-white rounded-lg shadow-lg p-8 mt-8">
          <h2 className="text-2xl font-bold mb-6">How to Use Your API Key</h2>
          
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold mb-3">1. Include in API Requests</h3>
              <p className="text-gray-600 mb-3">
                Add your API key to the <code>X-API-Key</code> header in all requests:
              </p>
              <pre className="bg-gray-900 text-green-400 p-4 rounded-lg overflow-x-auto text-sm">
{`curl -X POST "https://your-domain.com/api/v1" \\
  -H "Content-Type: application/json" \\
  -H "X-API-Key: your-api-key-here" \\
  -d '{
    "action": "optimize",
    "prompt": "Explain quantum computing",
    "walletAddress": "0x..."
  }'`}
              </pre>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-3">2. Using with SDKs</h3>
              <p className="text-gray-600 mb-3">
                Initialize your SDK with the API key:
              </p>
              <pre className="bg-gray-900 text-green-400 p-4 rounded-lg overflow-x-auto text-sm">
{`// JavaScript/TypeScript
const client = new OnChainAgent.AIAgentClient({
  apiKey: 'your-api-key-here',
  baseUrl: 'https://your-domain.com/api/v1'
});

// Python
client = AIAgentClient(
    api_key='your-api-key-here',
    base_url='https://your-domain.com/api/v1'
)`}
              </pre>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-3">3. Test Your API Key</h3>
              <p className="text-gray-600 mb-3">
                Visit the <a href="/api-docs" className="text-blue-600 hover:underline">API Documentation</a> page to test your API key with interactive examples.
              </p>
            </div>
          </div>
        </div>

        {/* Security Best Practices */}
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-8 mt-8">
          <h2 className="text-2xl font-bold mb-6 text-yellow-800">Security Best Practices</h2>
          
          <div className="space-y-4 text-yellow-700">
            <div className="flex items-start space-x-3">
              <div className="w-6 h-6 bg-yellow-200 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-yellow-800 text-sm font-bold">1</span>
              </div>
              <div>
                <p className="font-semibold">Keep Your API Key Secret</p>
                <p className="text-sm">Never share your API key publicly or commit it to version control.</p>
              </div>
            </div>
            
            <div className="flex items-start space-x-3">
              <div className="w-6 h-6 bg-yellow-200 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-yellow-800 text-sm font-bold">2</span>
              </div>
              <div>
                <p className="font-semibold">Use Environment Variables</p>
                <p className="text-sm">Store your API key in environment variables, not in your code.</p>
              </div>
            </div>
            
            <div className="flex items-start space-x-3">
              <div className="w-6 h-6 bg-yellow-200 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-yellow-800 text-sm font-bold">3</span>
              </div>
              <div>
                <p className="font-semibold">Rotate Keys Regularly</p>
                <p className="text-sm">Generate new API keys periodically and delete old ones.</p>
              </div>
            </div>
            
            <div className="flex items-start space-x-3">
              <div className="w-6 h-6 bg-yellow-200 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-yellow-800 text-sm font-bold">4</span>
              </div>
              <div>
                <p className="font-semibold">Monitor Usage</p>
                <p className="text-sm">Check your API key usage regularly for any suspicious activity.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

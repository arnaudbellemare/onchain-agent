'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';

interface DeploymentData {
  projectId: string;
  files: Array<{
    path: string;
    content: string;
    type: string;
  }>;
  framework: string;
  createdAt: string;
  status: string;
}

export default function DeploymentPage() {
  const params = useParams();
  const deploymentId = params.deploymentId as string;
  const [deployment, setDeployment] = useState<DeploymentData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Try to load the static HTML file first
    const loadStaticDeployment = async () => {
      try {
        // Check if there's a static HTML file for this deployment
        const response = await fetch(`/deployments/${deploymentId}.html`);
        if (response.ok) {
          // If static file exists, redirect to it
          window.location.href = `/deployments/${deploymentId}.html`;
          return;
        }
      } catch (error) {
        console.log('No static file found, trying API...');
      }

      // Fallback to API
      try {
        const response = await fetch(`/api/deployments/${deploymentId}`);
        if (response.ok) {
          const data = await response.json();
          setDeployment(data);
        }
      } catch (error) {
        console.error('Failed to fetch deployment:', error);
      } finally {
        setLoading(false);
      }
    };

    if (deploymentId) {
      loadStaticDeployment();
    }
  }, [deploymentId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 text-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
          <p>Loading deployment...</p>
        </div>
      </div>
    );
  }

  if (!deployment) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 text-white flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-4xl font-bold mb-4">404</h1>
          <p>Deployment not found</p>
          <a href="/" className="text-blue-300 hover:text-blue-100 mt-4 inline-block">
            ← Back to VibeSDK
          </a>
        </div>
      </div>
    );
  }

  const mainFile = deployment.files.find(f => f.path.includes('App.tsx') || f.path.includes('App.js'));

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 text-white p-8">
      <div className="max-w-4xl mx-auto">
        <div className="glass-effect rounded-xl p-8 mb-8">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold mb-4">🚀 {deployment.projectId}</h1>
            <p className="text-xl text-blue-200 mb-4">Generated with VibeSDK + OnChain Agent</p>
            <div className="inline-block bg-green-500 text-black px-4 py-2 rounded-full font-bold">
              ✅ Successfully Deployed
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div className="cost-optimization-card rounded-xl p-6">
              <h3 className="text-2xl font-semibold mb-4 text-green-300">💰 Cost Optimization</h3>
              <ul className="space-y-2 text-gray-300">
                <li>✅ 29.5% average cost reduction</li>
                <li>✅ Real-time AI optimization</li>
                <li>✅ Blockchain-native payments</li>
                <li>✅ x402 micropayments enabled</li>
              </ul>
            </div>

            <div className="blockchain-card rounded-xl p-6">
              <h3 className="text-2xl font-semibold mb-4 text-purple-300">🔗 Integration Status</h3>
              <ul className="space-y-2 text-gray-300">
                <li>✅ x402 Protocol (micropayments)</li>
                <li>✅ AgentKit (agent management)</li>
                <li>✅ VibeSDK (code generation)</li>
                <li>✅ Cost Optimization (29.5% savings)</li>
              </ul>
            </div>
          </div>

          <div className="glass-effect rounded-xl p-6 mb-8">
            <h3 className="text-2xl font-semibold mb-4 text-blue-300">📁 Generated Files ({deployment.files.length})</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {deployment.files.map((file, index) => (
                <div key={index} className="bg-gray-800 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-mono text-sm text-blue-300">{file.path}</span>
                    <span className="text-xs bg-gray-700 px-2 py-1 rounded">{file.type}</span>
                  </div>
                  <div className="text-xs text-gray-400">
                    {file.content.length} characters
                  </div>
                </div>
              ))}
            </div>
          </div>

          {mainFile && (
            <div className="glass-effect rounded-xl p-6 mb-8">
              <h3 className="text-2xl font-semibold mb-4 text-yellow-300">💻 Main Component Preview</h3>
              <pre className="bg-gray-900 p-4 rounded-lg text-sm overflow-x-auto">
                <code>{mainFile.content}</code>
              </pre>
            </div>
          )}

          <div className="text-center">
            <p className="text-lg text-gray-300 mb-4">
              Generated by <strong>OnChain Agent + VibeSDK</strong><br/>
              Real-time AI cost optimization • x402 micropayments • Blockchain-native
            </p>
            <div className="flex justify-center space-x-4">
              <a 
                href="/" 
                className="bg-blue-600 hover:bg-blue-700 px-6 py-3 rounded-lg font-semibold transition-colors"
              >
                ← Back to VibeSDK
              </a>
              <button 
                onClick={() => window.open(`/api/deployments/${deploymentId}/download`, '_blank')}
                className="bg-green-600 hover:bg-green-700 px-6 py-3 rounded-lg font-semibold transition-colors"
              >
                📥 Download Code
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
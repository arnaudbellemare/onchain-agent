'use client';

import { useState } from 'react';
import Link from 'next/link';
import SavingsTracker from '@/components/SavingsTracker';

interface GenerationResult {
  files: Array<{
    path: string;
    content: string;
    type: string;
  }>;
  projectStructure: string[];
  costOptimization: {
    originalCost: string;
    optimizedCost: string;
    savings: string;
    savingsPercentage: string;
  };
  deployment: {
    previewUrl: string;
    deploymentStatus: string;
  };
}

export default function VibeCodingPage() {
  const [prompt, setPrompt] = useState('');
  const [framework, setFramework] = useState('react');
  const [features, setFeatures] = useState<string[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [result, setResult] = useState<GenerationResult | null>(null);
  const [isDeploying, setIsDeploying] = useState(false);
  const [deploymentUrl, setDeploymentUrl] = useState('');
  const [currentSavings, setCurrentSavings] = useState(null);

  const handleGenerate = async () => {
    if (!prompt.trim()) return;

    setIsGenerating(true);
    try {
      const response = await fetch('/api/generate-code', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt,
          framework,
          features,
          optimizationEnabled: true
        })
      });

      const data = await response.json();
      if (data.success) {
        setResult(data.result);
        setCurrentSavings(data.result.costOptimization);
      } else {
        console.error('Generation failed:', data.error);
      }
    } catch (error) {
      console.error('Generation error:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDeploy = async () => {
    if (!result) return;

    setIsDeploying(true);
    try {
      const response = await fetch('/api/deploy', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          projectId: `vibe-${Date.now()}`,
          files: result.files,
          framework,
          useOptimization: true
        })
      });

      const data = await response.json();
      if (data.success) {
        setDeploymentUrl(data.result.deployment.url);
      } else {
        console.error('Deployment failed:', data.error);
      }
    } catch (error) {
      console.error('Deployment error:', error);
    } finally {
      setIsDeploying(false);
    }
  };

  const addFeature = () => {
    const newFeature = prompt('Enter a feature:');
    if (newFeature) {
      setFeatures([...features, newFeature]);
    }
  };

  const removeFeature = (index: number) => {
    setFeatures(features.filter((_, i) => i !== index));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 text-white">
      {/* Navigation */}
      <nav className="bg-black/20 backdrop-blur-lg border-b border-white/10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="text-2xl font-bold">
              🚀 OnChain Agent
            </Link>
            <div className="flex items-center space-x-4">
              <Link href="/" className="text-blue-300 hover:text-blue-100">
                Home
              </Link>
              <Link href="/vibe-coding" className="text-white font-semibold">
                Vibe Coding
              </Link>
            </div>
          </div>
        </div>
      </nav>

      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-4">
            🎨 AI Vibe Coding
          </h1>
          <p className="text-xl text-blue-200 mb-2">
            Describe your app, get optimized code with cost savings
          </p>
          <div className="flex items-center justify-center space-x-4 text-sm text-gray-300">
            <span className="flex items-center">
              <span className="w-2 h-2 bg-green-400 rounded-full mr-2"></span>
              Real-time cost optimization
            </span>
            <span className="flex items-center">
              <span className="w-2 h-2 bg-purple-400 rounded-full mr-2"></span>
              x402 micropayments
            </span>
            <span className="flex items-center">
              <span className="w-2 h-2 bg-blue-400 rounded-full mr-2"></span>
              Cloudflare deployment
            </span>
          </div>
        </div>

        <div className="max-w-4xl mx-auto">
          {/* Savings Tracker */}
          {currentSavings && (
            <SavingsTracker requestSavings={currentSavings} />
          )}

          {/* Input Section */}
          <div className="glass-effect rounded-xl p-6 mb-8">
            <h2 className="text-2xl font-semibold mb-4">What do you want to build?</h2>
            
            <div className="mb-4">
              <label className="block text-sm font-medium mb-2">
                Describe your application
              </label>
              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="e.g., Create a todo app with authentication, real-time updates, and dark mode"
                className="w-full p-3 rounded-lg bg-white/20 border border-white/30 text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows={4}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium mb-2">
                  Framework
                </label>
                <select
                  value={framework}
                  onChange={(e) => setFramework(e.target.value)}
                  className="w-full p-3 rounded-lg bg-white/20 border border-white/30 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="react">React</option>
                  <option value="next">Next.js</option>
                  <option value="vue">Vue.js</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Features
                </label>
                <button
                  onClick={addFeature}
                  className="w-full p-3 rounded-lg bg-blue-600 hover:bg-blue-700 transition-colors"
                >
                  + Add Feature
                </button>
              </div>
            </div>

            {features.length > 0 && (
              <div className="mb-4">
                <label className="block text-sm font-medium mb-2">
                  Added Features
                </label>
                <div className="flex flex-wrap gap-2">
                  {features.map((feature, index) => (
                    <span
                      key={index}
                      className="bg-blue-600 text-white px-3 py-1 rounded-full text-sm flex items-center gap-2"
                    >
                      {feature}
                      <button
                        onClick={() => removeFeature(index)}
                        className="text-red-300 hover:text-red-100"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              </div>
            )}

            <button
              onClick={handleGenerate}
              disabled={!prompt.trim() || isGenerating}
              className="w-full py-3 px-6 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg font-semibold transition-all duration-200"
            >
              {isGenerating ? 'Generating with Cost Optimization...' : 'Generate Code with Cost Optimization'}
            </button>
          </div>

          {/* Results Section */}
          {result && (
            <div className="glass-effect rounded-xl p-6 mb-8">
              <h2 className="text-2xl font-semibold mb-4">Generated Application</h2>
              
              {/* Cost Optimization Results */}
              <div className="cost-optimization-card rounded-lg p-4 mb-6">
                <h3 className="text-lg font-semibold text-green-300 mb-2">
                  💰 Cost Optimization Results
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <span className="text-gray-300">Original Cost:</span>
                    <div className="font-mono">{result.costOptimization.originalCost}</div>
                  </div>
                  <div>
                    <span className="text-gray-300">Optimized Cost:</span>
                    <div className="font-mono">{result.costOptimization.optimizedCost}</div>
                  </div>
                  <div>
                    <span className="text-gray-300">Savings:</span>
                    <div className="font-mono text-green-400">{result.costOptimization.savings}</div>
                  </div>
                  <div>
                    <span className="text-gray-300">Savings %:</span>
                    <div className="font-mono text-green-400">{result.costOptimization.savingsPercentage}</div>
                  </div>
                </div>
              </div>

              {/* Project Structure */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold mb-2">Project Structure</h3>
                <div className="bg-black/30 rounded-lg p-4 font-mono text-sm">
                  {result.projectStructure.map((item, index) => (
                    <div key={index} className="text-gray-300">
                      {item}
                    </div>
                  ))}
                </div>
              </div>

              {/* Generated Files */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold mb-2">Generated Files</h3>
                <div className="space-y-2">
                  {result.files.map((file, index) => (
                    <div key={index} className="bg-black/30 rounded-lg p-3">
                      <div className="flex items-center justify-between">
                        <span className="font-mono text-sm">{file.path}</span>
                        <span className="text-xs text-gray-400">{file.content.length} chars</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Deployment */}
              <div className="flex gap-4">
                <button
                  onClick={handleDeploy}
                  disabled={isDeploying}
                  className="flex-1 py-3 px-6 bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg font-semibold transition-all duration-200"
                >
                  {isDeploying ? 'Deploying to Cloudflare...' : 'Deploy to Cloudflare Workers'}
                </button>
              </div>

              {deploymentUrl && (
                <div className="mt-4 p-4 bg-green-500/20 border border-green-500/50 rounded-lg">
                  <h3 className="text-lg font-semibold text-green-300 mb-2">
                    🚀 Deployment Successful!
                  </h3>
                  <a
                    href={deploymentUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-300 hover:text-blue-100 underline"
                  >
                    {deploymentUrl}
                  </a>
                </div>
              )}
            </div>
          )}

          {/* How It Works */}
          <div className="glass-effect rounded-xl p-6">
            <h2 className="text-2xl font-semibold mb-4">How Vibe Coding Works</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-3">
                  <span className="text-xl">1</span>
                </div>
                <h3 className="text-lg font-semibold mb-2">Describe Your App</h3>
                <p className="text-sm text-gray-300">
                  Tell us what you want to build in natural language. Our AI understands your requirements.
                </p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-green-600 rounded-full flex items-center justify-center mx-auto mb-3">
                  <span className="text-xl">2</span>
                </div>
                <h3 className="text-lg font-semibold mb-2">Cost Optimization</h3>
                <p className="text-sm text-gray-300">
                  We optimize your prompt to reduce AI costs by 3.5% - 15.6% while maintaining quality.
                </p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-purple-600 rounded-full flex items-center justify-center mx-auto mb-3">
                  <span className="text-xl">3</span>
                </div>
                <h3 className="text-lg font-semibold mb-2">Deploy & Save</h3>
                <p className="text-sm text-gray-300">
                  Get your app deployed to Cloudflare Workers with real cost savings and blockchain payments.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

'use client';

import { useState } from 'react';
import Link from 'next/link';

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

export default function HomePage() {

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 text-white">
      {/* Navigation */}
      <nav className="bg-black/20 backdrop-blur-lg border-b border-white/10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="text-2xl font-bold">
              🚀 OnChain Agent
            </div>
            <div className="flex items-center space-x-4">
              <Link href="/" className="text-white font-semibold">
                Home
              </Link>
              <Link href="/vibe-coding" className="text-blue-300 hover:text-blue-100">
                Vibe Coding
              </Link>
            </div>
          </div>
        </div>
      </nav>

      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold mb-6">
            AI Vibe Coding Platform
          </h1>
          <p className="text-2xl text-blue-200 mb-4">
            Powered by OnChain Agent Cost Optimization
          </p>
          <p className="text-lg text-gray-300 mb-8">
            Build applications with AI while saving on API costs through real-time optimization
          </p>
          
          <Link 
            href="/vibe-coding"
            className="inline-block py-4 px-8 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 rounded-lg font-semibold text-xl transition-all duration-200 transform hover:scale-105"
          >
            Start Vibe Coding →
          </Link>
        </div>

        <div className="max-w-6xl mx-auto">
          {/* How It Works */}
          <div className="glass-effect rounded-xl p-8 mb-12">
            <h2 className="text-3xl font-semibold mb-8 text-center">How Vibe Coding Works</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl">1</span>
                </div>
                <h3 className="text-xl font-semibold mb-3">Describe Your App</h3>
                <p className="text-gray-300">
                  Tell us what you want to build in natural language. Our AI understands your requirements and optimizes prompts for cost efficiency.
                </p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl">2</span>
                </div>
                <h3 className="text-xl font-semibold mb-3">Cost Optimization</h3>
                <p className="text-gray-300">
                  We optimize your prompt to reduce AI costs by 3.5% - 15.6% while maintaining quality. Real savings, real revenue.
                </p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl">3</span>
                </div>
                <h3 className="text-xl font-semibold mb-3">Deploy & Save</h3>
                <p className="text-gray-300">
                  Get your app deployed to Cloudflare Workers with real cost savings and blockchain micropayments via x402 protocol.
                </p>
              </div>
            </div>
          </div>

          {/* Features Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
            <div className="cost-optimization-card rounded-xl p-6">
              <h3 className="text-2xl font-semibold mb-4 text-green-300">💰 Cost Optimization</h3>
              <ul className="space-y-3 text-gray-300">
                <li className="flex items-center">
                  <span className="w-2 h-2 bg-green-400 rounded-full mr-3"></span>
                  Real-time AI cost reduction (3.5% - 15.6% savings)
                </li>
                <li className="flex items-center">
                  <span className="w-2 h-2 bg-green-400 rounded-full mr-3"></span>
                  Optimized prompt generation
                </li>
                <li className="flex items-center">
                  <span className="w-2 h-2 bg-green-400 rounded-full mr-3"></span>
                  Cost monitoring and analytics
                </li>
                <li className="flex items-center">
                  <span className="w-2 h-2 bg-green-400 rounded-full mr-3"></span>
                  Multi-model optimization
                </li>
              </ul>
            </div>

            <div className="blockchain-card rounded-xl p-6">
              <h3 className="text-2xl font-semibold mb-4 text-purple-300">🔗 Blockchain Integration</h3>
              <ul className="space-y-3 text-gray-300">
                <li className="flex items-center">
                  <span className="w-2 h-2 bg-purple-400 rounded-full mr-3"></span>
                  x402 micropayments
                </li>
                <li className="flex items-center">
                  <span className="w-2 h-2 bg-purple-400 rounded-full mr-3"></span>
                  USDC payments on Base network
                </li>
                <li className="flex items-center">
                  <span className="w-2 h-2 bg-purple-400 rounded-full mr-3"></span>
                  Real-time cost optimization
                </li>
                <li className="flex items-center">
                  <span className="w-2 h-2 bg-purple-400 rounded-full mr-3"></span>
                  13% fee on cost savings
                </li>
              </ul>
            </div>
          </div>

          {/* Revenue Model */}
          <div className="glass-effect rounded-xl p-8 mb-12">
            <h2 className="text-3xl font-semibold mb-6 text-center">Revenue Model</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-green-400 mb-2">$0.000044</div>
                <div className="text-gray-300">Average fee per request</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-400 mb-2">$0.044</div>
                <div className="text-gray-300">Daily revenue (1000 requests)</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-purple-400 mb-2">$1,606</div>
                <div className="text-gray-300">Monthly revenue (1M requests)</div>
              </div>
            </div>
          </div>

          {/* CTA Section */}
          <div className="text-center">
            <h2 className="text-3xl font-semibold mb-4">Ready to Start Building?</h2>
            <p className="text-lg text-gray-300 mb-8">
              Experience the future of AI development with real cost optimization
            </p>
            <Link 
              href="/vibe-coding"
              className="inline-block py-4 px-8 bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 rounded-lg font-semibold text-xl transition-all duration-200 transform hover:scale-105"
            >
              Start Vibe Coding Now →
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

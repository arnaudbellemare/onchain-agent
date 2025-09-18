'use client';

import React, { useState } from 'react';

interface UseCase {
  id: string;
  category: string;
  title: string;
  description: string;
  example: string;
  cost: string;
  benefit: string;
  icon: string;
  color: string;
}

interface LiveDemo {
  id: string;
  useCase: string;
  action: string;
  cost: number;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  timestamp: Date;
  result?: string;
}

export default function X402UseCaseShowcase() {
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [liveDemos, setLiveDemos] = useState<LiveDemo[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);

  const useCases: UseCase[] = [
    // Agents Accessing APIs for On Demand Requests
    {
      id: 'research-platform',
      category: 'agents',
      title: 'Research Platform - Pay-Per-Article',
      description: 'AI-driven research tools pay only for relevant content, eliminating bundled paywalls',
      example: 'AI research agent pays $0.25 per premium article instead of $50/month subscription',
      cost: '$0.25 per article',
      benefit: '90% cost reduction for selective content access',
      icon: '📚',
      color: 'blue'
    },
    {
      id: 'video-streaming',
      category: 'agents',
      title: 'Video Streaming - Pay-Per-Second',
      description: 'AI agents pay for exact content consumption, replacing subscription models',
      example: 'AI training agent pays $0.001 per second of educational content watched',
      cost: '$0.001 per second',
      benefit: 'Pay only for consumed content, not unused subscriptions',
      icon: '🎥',
      color: 'purple'
    },
    {
      id: 'trading-ai',
      category: 'agents',
      title: 'Trading AI - Real-Time Market Data',
      description: 'Trading algorithms pay for market data only when making decisions',
      example: 'Trading AI pays $0.02 per stock market data request during active trading',
      cost: '$0.02 per request',
      benefit: 'Eliminate expensive real-time data subscriptions',
      icon: '📈',
      color: 'green'
    },

    // Pay-Per-Use AI Model Inference Monetization
    {
      id: 'computer-vision',
      category: 'ai-models',
      title: 'Computer Vision API',
      description: 'Pay per image classification instead of fixed enterprise fees',
      example: 'E-commerce platform pays $0.005 per product image classification',
      cost: '$0.005 per image',
      benefit: 'Scale costs with actual usage, not capacity',
      icon: '👁️',
      color: 'indigo'
    },
    {
      id: 'synthetic-voice',
      category: 'ai-models',
      title: 'Synthetic Voice AI',
      description: 'Flexible monetization for voice generation services',
      example: 'Podcast creator pays $0.10 per audio clip generation',
      cost: '$0.10 per audio clip',
      benefit: 'Flexible pricing for variable content needs',
      icon: '🎤',
      color: 'pink'
    },

    // Agents Paying for Cloud Compute & Storage
    {
      id: 'gpu-resources',
      category: 'cloud-compute',
      title: 'GPU Resources - Pay-Per-Minute',
      description: 'Autonomous agents purchase compute resources as needed',
      example: 'AI training agent pays $0.50 per GPU-minute for model training',
      cost: '$0.50 per GPU-minute',
      benefit: 'No upfront infrastructure investment required',
      icon: '🖥️',
      color: 'orange'
    },
    {
      id: 'cloud-storage',
      category: 'cloud-compute',
      title: 'Cloud Storage - Pay-Per-GB',
      description: 'AI models expand storage dynamically for context and learning',
      example: 'RL agent pays $0.01 per GB stored for training data expansion',
      cost: '$0.01 per GB',
      benefit: 'Dynamic scaling without capacity planning',
      icon: '💾',
      color: 'teal'
    },

    // Contract Retrieval for Agents
    {
      id: 'financial-news',
      category: 'contract-retrieval',
      title: 'Financial AI Assistant',
      description: 'AI pays for premium financial news and research',
      example: 'Financial AI pays $0.25 per premium news article for market analysis',
      cost: '$0.25 per article',
      benefit: 'Access premium content without full subscriptions',
      icon: '📰',
      color: 'yellow'
    },
    {
      id: 'legal-research',
      category: 'contract-retrieval',
      title: 'Legal Research Agent',
      description: 'AI accesses court rulings and legal documents on-demand',
      example: 'Legal AI pays $0.10 per court ruling document for case research',
      cost: '$0.10 per document',
      benefit: 'Avoid expensive legal database subscriptions',
      icon: '⚖️',
      color: 'red'
    },

    // Micropayments for Human Access to Content
    {
      id: 'substack-writer',
      category: 'human-content',
      title: 'Substack Writer - Pay-Per-Article',
      description: 'Casual readers pay for individual articles instead of subscriptions',
      example: 'Reader pays $0.25 per article instead of $10/month subscription',
      cost: '$0.25 per article',
      benefit: 'Lower barrier to entry for casual readers',
      icon: '✍️',
      color: 'emerald'
    },
    {
      id: 'research-journal',
      category: 'human-content',
      title: 'Research Journal - Pay-Per-Whitepaper',
      description: 'Researchers pay for individual papers instead of annual memberships',
      example: 'Researcher pays $2.00 per whitepaper download instead of $200/year membership',
      cost: '$2.00 per whitepaper',
      benefit: 'Access specific research without full journal subscriptions',
      icon: '📄',
      color: 'cyan'
    },
    {
      id: 'premium-podcast',
      category: 'human-content',
      title: 'Premium Podcast - Pay-Per-Episode',
      description: 'Listeners pay for individual episodes instead of monthly subscriptions',
      example: 'Listener pays $0.50 per premium episode instead of $5/month subscription',
      cost: '$0.50 per episode',
      benefit: 'Pay only for episodes you want to hear',
      icon: '🎧',
      color: 'violet'
    },
    {
      id: 'pay-per-play-game',
      category: 'human-content',
      title: 'Game - Pay-Per-Play',
      description: 'Players pay per game session instead of large purchases or ads',
      example: 'Player pays $0.10 per game play instead of $20 purchase or watching ads',
      cost: '$0.10 per play',
      benefit: 'Try before you buy, no ads, fair pricing',
      icon: '🎮',
      color: 'lime'
    }
  ];

  const categories = [
    { id: 'all', name: 'All Use Cases', icon: '🌟' },
    { id: 'agents', name: 'AI Agents', icon: '🤖' },
    { id: 'ai-models', name: 'AI Models', icon: '🧠' },
    { id: 'cloud-compute', name: 'Cloud Compute', icon: '☁️' },
    { id: 'contract-retrieval', name: 'Contract Retrieval', icon: '📋' },
    { id: 'human-content', name: 'Human Content', icon: '👥' }
  ];

  const filteredUseCases = activeCategory === 'all' 
    ? useCases 
    : useCases.filter(uc => uc.category === activeCategory);

  const runLiveDemo = async (useCase: UseCase) => {
    setIsProcessing(true);
    
    const demo: LiveDemo = {
      id: Date.now().toString(),
      useCase: useCase.title,
      action: useCase.example,
      cost: parseFloat(useCase.cost.replace(/[^0-9.]/g, '')),
      status: 'pending',
      timestamp: new Date()
    };

    setLiveDemos(prev => [demo, ...prev]);

    // Simulate x402 payment process
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    setLiveDemos(prev => prev.map(d => 
      d.id === demo.id ? { ...d, status: 'processing' } : d
    ));

    await new Promise(resolve => setTimeout(resolve, 2000));

    setLiveDemos(prev => prev.map(d => 
      d.id === demo.id 
        ? { 
            ...d, 
            status: 'completed',
            result: `✅ x402 payment successful! ${useCase.benefit}`
          }
        : d
    ));

    setIsProcessing(false);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'text-yellow-600 bg-yellow-100';
      case 'processing': return 'text-blue-600 bg-blue-100';
      case 'completed': return 'text-green-600 bg-green-100';
      case 'failed': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return '⏳';
      case 'processing': return '💳';
      case 'completed': return '✅';
      case 'failed': return '❌';
      default: return '❓';
    }
  };

  const getColorClasses = (color: string) => {
    const colorMap: Record<string, string> = {
      blue: 'bg-blue-50 border-blue-200 text-blue-800',
      purple: 'bg-purple-50 border-purple-200 text-purple-800',
      green: 'bg-green-50 border-green-200 text-green-800',
      indigo: 'bg-indigo-50 border-indigo-200 text-indigo-800',
      pink: 'bg-pink-50 border-pink-200 text-pink-800',
      orange: 'bg-orange-50 border-orange-200 text-orange-800',
      teal: 'bg-teal-50 border-teal-200 text-teal-800',
      yellow: 'bg-yellow-50 border-yellow-200 text-yellow-800',
      red: 'bg-red-50 border-red-200 text-red-800',
      emerald: 'bg-emerald-50 border-emerald-200 text-emerald-800',
      cyan: 'bg-cyan-50 border-cyan-200 text-cyan-800',
      violet: 'bg-violet-50 border-violet-200 text-violet-800',
      lime: 'bg-lime-50 border-lime-200 text-lime-800'
    };
    return colorMap[color] || 'bg-gray-50 border-gray-200 text-gray-800';
  };

  return (
    <div className="max-w-7xl mx-auto p-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          🚀 x402 Protocol Use Cases Showcase
        </h1>
        <p className="text-xl text-gray-600 max-w-4xl">
          Real examples of how AI agents and humans are using x402 protocol for seamless, 
          pay-per-use transactions across various contexts
        </p>
      </div>

      {/* Category Filter */}
      <div className="flex flex-wrap gap-2 mb-8">
        {categories.map(category => (
          <button
            key={category.id}
            onClick={() => setActiveCategory(category.id)}
            className={`px-4 py-2 rounded-lg font-medium transition-all ${
              activeCategory === category.id
                ? 'bg-blue-600 text-white shadow-lg'
                : 'bg-white text-gray-700 hover:bg-blue-50 border border-gray-200'
            }`}
          >
            {category.icon} {category.name}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Use Cases Grid */}
        <div className="lg:col-span-2">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filteredUseCases.map(useCase => (
              <div 
                key={useCase.id} 
                className={`border-2 rounded-xl p-6 ${getColorClasses(useCase.color)}`}
              >
                <div className="flex items-center mb-4">
                  <div className="text-3xl mr-3">{useCase.icon}</div>
                  <h3 className="text-lg font-semibold">{useCase.title}</h3>
                </div>
                
                <p className="text-sm mb-4 opacity-90">
                  {useCase.description}
                </p>
                
                <div className="space-y-2 mb-4">
                  <div className="text-sm">
                    <span className="font-medium">Example:</span> {useCase.example}
                  </div>
                  <div className="text-sm">
                    <span className="font-medium">Cost:</span> {useCase.cost}
                  </div>
                  <div className="text-sm">
                    <span className="font-medium">Benefit:</span> {useCase.benefit}
                  </div>
                </div>
                
                <button
                  onClick={() => runLiveDemo(useCase)}
                  disabled={isProcessing}
                  className="w-full px-4 py-2 bg-white bg-opacity-50 hover:bg-opacity-70 rounded-lg font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isProcessing ? 'Processing...' : 'Run Live Demo'}
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Live Demo Results */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-xl shadow-lg p-6 sticky top-8">
            <h2 className="text-xl font-bold text-gray-900 mb-6">🔴 Live Demo Results</h2>
            
            {liveDemos.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-500">No demos run yet</p>
                <p className="text-sm text-gray-400 mt-2">
                  Click &quot;Run Live Demo&quot; on any use case to see x402 in action
                </p>
              </div>
            ) : (
              <div className="space-y-4 max-h-96 overflow-y-auto">
                {liveDemos.map(demo => (
                  <div key={demo.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium text-gray-900 text-sm">{demo.useCase}</h4>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(demo.status)}`}>
                        {getStatusIcon(demo.status)} {demo.status}
                      </span>
                    </div>
                    
                    <div className="text-xs text-gray-600 space-y-1">
                      <p><strong>Action:</strong> {demo.action}</p>
                      <p><strong>Cost:</strong> ${demo.cost} USDC</p>
                      <p><strong>Time:</strong> {demo.timestamp.toLocaleTimeString()}</p>
                      {demo.result && (
                        <p className="text-green-600 font-medium">{demo.result}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Key Takeaways */}
      <div className="mt-12 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl shadow-lg p-8 text-white">
        <h2 className="text-2xl font-bold mb-6">💡 Key Takeaways</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 className="text-lg font-semibold mb-3">🤖 AI Agent Benefits</h3>
            <ul className="space-y-2 text-sm opacity-90">
              <li>• Autonomous resource purchasing without pre-funded accounts</li>
              <li>• Pay-per-use eliminates expensive subscriptions</li>
              <li>• Real-time access to premium APIs and content</li>
              <li>• Seamless integration with existing AI workflows</li>
            </ul>
          </div>
          <div>
            <h3 className="text-lg font-semibold mb-3">👥 Human Benefits</h3>
            <ul className="space-y-2 text-sm opacity-90">
              <li>• Lower barriers to premium content access</li>
              <li>• Pay only for what you consume</li>
              <li>• No subscription commitments or cancellations</li>
              <li>• Fair pricing based on actual usage</li>
            </ul>
          </div>
        </div>
        
        <div className="mt-6 p-4 bg-white bg-opacity-20 rounded-lg">
          <p className="text-sm">
            <strong>With x402, providers of contextual data can now seamlessly monetize using existing frameworks 
            like the Model Context Payment (MCP) protocol.</strong> The evolution of AI-driven systems demands 
            a payment infrastructure that is as seamless and autonomous as the agents using it.
          </p>
        </div>
      </div>
    </div>
  );
}

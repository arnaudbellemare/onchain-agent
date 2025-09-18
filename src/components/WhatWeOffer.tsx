'use client';

import React, { useState } from 'react';
import ROICalculator from './ROICalculator';
import X402OptimizationCycle from './X402OptimizationCycle';
import X402APIIntegration from './X402APIIntegration';
import X402UseCaseShowcase from './X402UseCaseShowcase';
import BusinessIntegrationWidget from './BusinessIntegrationWidget';
import RealTimeCostMonitoring from './RealTimeCostMonitoring';
import CostReductionExplanation from './CostReductionExplanation';

interface Service {
  id: string;
  title: string;
  description: string;
  icon: string;
  costReduction: string;
  howItWorks: string[];
  realExample: string;
  savings: string;
}

export default function WhatWeOffer() {
  const [selectedService, setSelectedService] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'services' | 'roi' | 'cycle' | 'examples' | 'integration' | 'monitoring' | 'explanation' | 'universal'>('services');

  const services: Service[] = [
    {
      id: 'payment',
      title: 'Payment Integration',
      description: 'Enhance Stripe/PayPal with x402 protocol for 20-30% cost reduction',
      icon: 'payment',
      costReduction: '20-30%',
      howItWorks: [
        'Replace subscription fees with pay-per-transaction x402 micropayments',
        'Eliminate payment processing fees through direct USDC transfers',
        'AI automatically routes payments to cheapest providers',
        'Real-time cost optimization without manual intervention'
      ],
      realExample: 'E-commerce store: $2,000/month Stripe fees → $1,400/month with x402 = $600/month savings',
      savings: '$7,200/year'
    },
    {
      id: 'ai-api',
      title: 'AI API Optimization',
      description: 'Optimize OpenAI/Anthropic costs with x402 micropayments',
      icon: 'ai',
      costReduction: '30-50%',
      howItWorks: [
        'Pay per API call instead of monthly subscriptions',
        'AI automatically switches between providers for best rates',
        'Smart caching reduces redundant API calls by 80%',
        'Predictive analytics prevents cost spikes'
      ],
      realExample: 'AI startup: $5,000/month OpenAI subscription → $2,500/month with x402 = $2,500/month savings',
      savings: '$30,000/year'
    },
    {
      id: 'gpu',
      title: 'GPU Cost Reduction',
      description: 'Automate AWS/GCP GPU costs with AgentKit optimization',
      icon: 'gpu',
      costReduction: '40-60%',
      howItWorks: [
        'AI automatically scales GPU usage based on demand',
        'Smart scheduling uses spot instances during low-cost periods',
        'Load balancing across multiple cloud providers',
        'Automatic shutdown of unused resources'
      ],
      realExample: 'ML company: $8,000/month AWS GPU costs → $3,200/month with AgentKit = $4,800/month savings',
      savings: '$57,600/year'
    },
    {
      id: 'data-api',
      title: 'Data API Optimization',
      description: 'Reduce data service costs with smart caching and routing',
      icon: 'data',
      costReduction: '25-40%',
      howItWorks: [
        'Intelligent caching reduces API calls by 70%',
        'Smart routing finds cheapest data providers',
        'Batch processing optimizes data requests',
        'Predictive loading reduces peak-hour costs'
      ],
      realExample: 'Analytics company: $3,000/month data API costs → $1,800/month with optimization = $1,200/month savings',
      savings: '$14,400/year'
    },
    {
      id: 'infrastructure',
      title: 'Infrastructure Automation',
      description: 'Automate cloud costs with intelligent resource management',
      icon: 'cloud',
      costReduction: '35-50%',
      howItWorks: [
        'AI automatically rightsizes cloud resources',
        'Predictive scaling prevents over-provisioning',
        'Multi-cloud optimization finds best prices',
        'Automatic cost alerts and optimization suggestions'
      ],
      realExample: 'SaaS company: $10,000/month cloud costs → $5,000/month with automation = $5,000/month savings',
      savings: '$60,000/year'
    },
    {
      id: 'workflow',
      title: 'Workflow Automation',
      description: 'Automate business processes with AI-powered workflows',
      icon: 'workflow',
      costReduction: '50-70%',
      howItWorks: [
        'AI automates repetitive business processes',
        'Smart decision-making reduces manual work',
        'Predictive maintenance prevents downtime',
        'Autonomous operations run 24/7 without human oversight'
      ],
      realExample: 'Enterprise: $15,000/month manual processes → $4,500/month with automation = $10,500/month savings',
      savings: '$126,000/year'
    },
    {
      id: 'x402-compatibility',
      title: 'x402 API Compatibility',
      description: 'Make any API x402-compatible with micropayments and autonomous optimization',
      icon: 'bridge',
      costReduction: '30-60%',
      howItWorks: [
        'Convert traditional APIs to x402 micropayment model',
        'Add autonomous cost optimization to any service',
        'Enable pay-per-use for subscription-based APIs',
        'Provide universal API cost monitoring and switching'
      ],
      realExample: 'SaaS company: $8,000/month API subscriptions → $3,200/month with x402 compatibility = $4,800/month savings',
      savings: '$57,600/year'
    }
  ];

  const selectedServiceData = services.find(s => s.id === selectedService);

  const renderServiceIcon = (iconType: string) => {
    const iconProps = {
      className: "w-6 h-6 text-white",
      fill: "none",
      stroke: "currentColor",
      viewBox: "0 0 24 24"
    };

    switch (iconType) {
      case 'payment':
        return (
          <svg {...iconProps}>
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
          </svg>
        );
      case 'ai':
        return (
          <svg {...iconProps}>
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
          </svg>
        );
      case 'gpu':
        return (
          <svg {...iconProps}>
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" />
          </svg>
        );
      case 'data':
        return (
          <svg {...iconProps}>
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
        );
      case 'cloud':
        return (
          <svg {...iconProps}>
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10" />
          </svg>
        );
      case 'workflow':
        return (
          <svg {...iconProps}>
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
        );
      case 'bridge':
        return (
          <svg {...iconProps}>
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
          </svg>
        );
      default:
        return (
          <svg {...iconProps}>
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
        );
    }
  };

  return (
    <div className="max-w-7xl mx-auto p-8">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          What We Can Do For You
        </h1>
        <p className="text-xl text-gray-900 max-w-4xl mx-auto">
          We reduce your business costs by 20-70% using autonomous optimization, x402 protocol micropayments, and AI automation. We make any API x402-compatible and provide pay-per-use access to all services.
        </p>
      </div>

      {/* Tab Navigation */}
      <div className="flex justify-center mb-8">
        <div className="bg-gray-100 p-1 rounded-lg">
          {[
            { id: 'services', label: 'Our Services', icon: '🎯' },
            { id: 'roi', label: 'ROI Calculator', icon: '💰' },
            { id: 'cycle', label: 'Optimization Cycle', icon: '🔄' },
            { id: 'examples', label: 'x402 Examples', icon: '⚡' },
            { id: 'integration', label: 'Integration Tools', icon: '🔧' },
            { id: 'monitoring', label: 'Cost Monitoring', icon: '📊' },
            { id: 'explanation', label: 'How We Save', icon: '💡' },
            { id: 'universal', label: 'Universal API Optimization', icon: '🌐' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as 'services' | 'roi' | 'cycle' | 'examples' | 'integration' | 'monitoring' | 'explanation' | 'universal')}
              className={`px-6 py-3 rounded-lg font-medium transition-all ${
                activeTab === tab.id
                  ? 'bg-blue-600 text-white shadow-lg'
                  : 'text-gray-900 hover:bg-blue-50'
              }`}
            >
              {tab.icon} {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content */}
      {activeTab === 'services' && (
        <>
          {/* Services Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
        {services.map((service) => (
          <div
            key={service.id}
            onClick={() => setSelectedService(service.id)}
            className={`p-6 rounded-xl border-2 cursor-pointer transition-all duration-300 ${
              selectedService === service.id
                ? 'border-blue-500 bg-blue-50 shadow-lg'
                : 'border-gray-200 bg-white hover:border-blue-300 hover:shadow-md'
            }`}
          >
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl mb-6 flex items-center justify-center mx-auto">
                {renderServiceIcon(service.icon)}
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">{service.title}</h3>
              <p className="text-gray-900 mb-4">{service.description}</p>
              <div className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-semibold">
                {service.costReduction} Cost Reduction
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* How It Works Section */}
      {selectedServiceData && (
        <div className="bg-white rounded-xl shadow-lg p-8 mb-8">
          <div className="text-center mb-8">
            <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-blue-600 rounded-3xl mb-6 flex items-center justify-center mx-auto">
              {renderServiceIcon(selectedServiceData.icon)}
            </div>
            <h2 className="text-3xl font-bold text-gray-900 mb-2">{selectedServiceData.title}</h2>
            <p className="text-xl text-gray-900 mb-4">{selectedServiceData.description}</p>
            <div className="bg-green-100 text-green-800 px-6 py-3 rounded-full text-lg font-bold inline-block">
              {selectedServiceData.costReduction} Cost Reduction
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* How It Works */}
            <div>
              <h3 className="text-2xl font-bold text-gray-900 mb-6">How We Do This in Reality</h3>
              <div className="space-y-4">
                {selectedServiceData.howItWorks.map((step, index) => (
                  <div key={index} className="flex items-start">
                    <div className="bg-blue-100 text-blue-800 rounded-full w-8 h-8 flex items-center justify-center font-bold text-sm mr-4 mt-1">
                      {index + 1}
                    </div>
                    <p className="text-gray-900">{step}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Real Example */}
            <div>
              <h3 className="text-2xl font-bold text-gray-900 mb-6">Real Example</h3>
              <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
                <p className="text-gray-900 mb-4 font-medium">{selectedServiceData.realExample}</p>
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-green-600 mb-2">
                      {selectedServiceData.savings}
                    </div>
                    <div className="text-sm text-gray-900">Annual Savings</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Get Started */}
          <div className="mt-8 text-center">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
              <h4 className="text-xl font-bold text-gray-900 mb-4">Ready to Save Money?</h4>
              <p className="text-gray-900 mb-6">
                Contact us to implement {selectedServiceData.title.toLowerCase()} optimization for your business
              </p>
              <div className="flex justify-center space-x-4">
                <a 
                  href="mailto:hello@your-domain.com" 
                  className="bg-blue-600 text-white px-8 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors"
                >
                  📧 Get Started
                </a>
                <a 
                  href="/contact" 
                  className="bg-green-600 text-white px-8 py-3 rounded-lg font-medium hover:bg-green-700 transition-colors"
                >
                  💬 Schedule Demo
                </a>
              </div>
            </div>
          </div>
        </div>
      )}

          {/* Summary Stats */}
          <div className="bg-gradient-to-r from-blue-50 to-green-50 rounded-xl p-8 border border-blue-200">
            <h3 className="text-2xl font-bold text-gray-900 text-center mb-8">Why Choose Us?</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="text-4xl font-bold text-blue-600 mb-2">20-70%</div>
                <div className="text-gray-900 font-medium">Cost Reduction</div>
                <div className="text-sm text-gray-900">Average savings across all services</div>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold text-green-600 mb-2">24/7</div>
                <div className="text-gray-900 font-medium">AI Automation</div>
                <div className="text-sm text-gray-900">Continuous optimization without human intervention</div>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold text-purple-600 mb-2">100%</div>
                <div className="text-gray-900 font-medium">Transparent</div>
                <div className="text-sm text-gray-900">Real-time cost tracking and savings visibility</div>
              </div>
            </div>
          </div>
        </>
      )}

      {/* ROI Calculator Tab */}
      {activeTab === 'roi' && (
        <div className="bg-white rounded-xl shadow-lg p-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">ROI Calculator</h2>
          <ROICalculator />
        </div>
      )}

      {/* Optimization Cycle Tab */}
      {activeTab === 'cycle' && (
        <div className="bg-white rounded-xl shadow-lg p-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">Autonomous Optimization Cycle</h2>
          <X402OptimizationCycle />
        </div>
      )}

      {/* x402 Examples Tab */}
      {activeTab === 'examples' && (
        <div className="space-y-8">
          <div className="bg-white rounded-xl shadow-lg p-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">x402 Protocol API Integration</h2>
            <X402APIIntegration />
          </div>
          
          <div className="bg-white rounded-xl shadow-lg p-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">x402 Use Cases Showcase</h2>
            <X402UseCaseShowcase />
          </div>
        </div>
      )}

      {/* Integration Tools Tab */}
      {activeTab === 'integration' && (
        <div className="bg-white rounded-xl shadow-lg p-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">Business Integration Tools</h2>
          <BusinessIntegrationWidget />
        </div>
      )}

      {/* Real-time Cost Monitoring Tab */}
      {activeTab === 'monitoring' && (
        <RealTimeCostMonitoring />
      )}

      {/* Cost Reduction Explanation Tab */}
      {activeTab === 'explanation' && (
        <CostReductionExplanation />
      )}

      {/* Universal API Optimization Tab */}
      {activeTab === 'universal' && (
        <div className="space-y-8">
          <div className="bg-white rounded-xl shadow-lg p-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">Universal API Cost Optimization</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
              <div className="bg-blue-50 rounded-lg p-6 border border-blue-200">
                <div className="text-center">
                  <div className="text-4xl mb-4">🌐</div>
                  <h3 className="text-xl font-bold text-gray-900 mb-3">Make Any API x402-Compatible</h3>
                  <p className="text-gray-900 text-sm">
                    Convert traditional subscription-based APIs to micropayment model. Add x402 protocol support to any service.
                  </p>
                </div>
              </div>
              
              <div className="bg-green-50 rounded-lg p-6 border border-green-200">
                <div className="text-center">
                  <div className="text-4xl mb-4">💳</div>
                  <h3 className="text-xl font-bold text-gray-900 mb-3">Pay-Per-Use for Any Service</h3>
                  <p className="text-gray-900 text-sm">
                    Transform subscription models into pay-per-request. Only pay for what you actually use, when you use it.
                  </p>
                </div>
              </div>
              
              <div className="bg-purple-50 rounded-lg p-6 border border-purple-200">
                <div className="text-center">
                  <div className="text-4xl mb-4">🤖</div>
                  <h3 className="text-xl font-bold text-gray-900 mb-3">Autonomous Cost Optimization</h3>
                  <p className="text-gray-900 text-sm">
                    AI continuously monitors, compares, and optimizes costs across all your API providers automatically.
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-r from-blue-50 to-green-50 rounded-xl p-8 border border-blue-200">
              <h3 className="text-2xl font-bold text-gray-900 mb-6 text-center">How Universal Optimization Works</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <h4 className="text-lg font-semibold text-gray-900 mb-4">Traditional API Model</h4>
                  <ul className="space-y-2 text-sm text-gray-900">
                    <li>• Monthly subscriptions regardless of usage</li>
                    <li>• Fixed pricing tiers</li>
                    <li>• Manual cost monitoring</li>
                    <li>• Vendor lock-in</li>
                    <li>• High minimum commitments</li>
                  </ul>
                </div>
                
                <div>
                  <h4 className="text-lg font-semibold text-gray-900 mb-4">Our Universal Model</h4>
                  <ul className="space-y-2 text-sm text-gray-900">
                    <li>• Pay only for actual usage</li>
                    <li>• Dynamic pricing optimization</li>
                    <li>• Autonomous cost monitoring</li>
                    <li>• Multi-provider flexibility</li>
                    <li>• No minimum commitments</li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="mt-8 bg-white rounded-xl p-8 border border-gray-200">
              <h3 className="text-2xl font-bold text-gray-900 mb-6 text-center">Supported API Types</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <div className="text-2xl mb-2">🧠</div>
                  <div className="font-semibold text-gray-900">AI APIs</div>
                  <div className="text-sm text-gray-900">OpenAI, Anthropic, Google AI</div>
                </div>
                
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <div className="text-2xl mb-2">☁️</div>
                  <div className="font-semibold text-gray-900">Cloud Services</div>
                  <div className="text-sm text-gray-900">AWS, Google Cloud, Azure</div>
                </div>
                
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <div className="text-2xl mb-2">💳</div>
                  <div className="font-semibold text-gray-900">Payment APIs</div>
                  <div className="text-sm text-gray-900">Stripe, PayPal, Square</div>
                </div>
                
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <div className="text-2xl mb-2">📊</div>
                  <div className="font-semibold text-gray-900">Data APIs</div>
                  <div className="text-sm text-gray-900">Any REST/GraphQL API</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

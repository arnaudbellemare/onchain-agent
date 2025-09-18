'use client';

import React, { useState } from 'react';
import ROICalculator from './ROICalculator';
import X402OptimizationCycle from './X402OptimizationCycle';
import X402APIIntegration from './X402APIIntegration';
import X402UseCaseShowcase from './X402UseCaseShowcase';
import BusinessIntegrationWidget from './BusinessIntegrationWidget';
import RealTimeCostMonitoring from './RealTimeCostMonitoring';

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
  const [activeTab, setActiveTab] = useState<'services' | 'roi' | 'cycle' | 'examples' | 'integration' | 'monitoring'>('services');

  const services: Service[] = [
    {
      id: 'payment',
      title: 'Payment Integration',
      description: 'Enhance Stripe/PayPal with x402 protocol for 20-30% cost reduction',
      icon: '💳',
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
      icon: '🤖',
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
      icon: '🖥️',
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
      icon: '📊',
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
      icon: '☁️',
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
      icon: '🔄',
      costReduction: '50-70%',
      howItWorks: [
        'AI automates repetitive business processes',
        'Smart decision-making reduces manual work',
        'Predictive maintenance prevents downtime',
        'Autonomous operations run 24/7 without human oversight'
      ],
      realExample: 'Enterprise: $15,000/month manual processes → $4,500/month with automation = $10,500/month savings',
      savings: '$126,000/year'
    }
  ];

  const selectedServiceData = services.find(s => s.id === selectedService);

  return (
    <div className="max-w-7xl mx-auto p-8">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          What We Can Do For You
        </h1>
        <p className="text-xl text-gray-900 max-w-4xl mx-auto">
          We reduce your business costs by 20-70% using x402 protocol micropayments and AI automation
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
            { id: 'monitoring', label: 'Cost Monitoring', icon: '📊' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as 'services' | 'roi' | 'cycle' | 'examples' | 'integration' | 'monitoring')}
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
              <div className="text-4xl mb-4">{service.icon}</div>
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
            <div className="text-5xl mb-4">{selectedServiceData.icon}</div>
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
                <div className="text-sm text-gray-600">Average savings across all services</div>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold text-green-600 mb-2">24/7</div>
                <div className="text-gray-900 font-medium">AI Automation</div>
                <div className="text-sm text-gray-600">Continuous optimization without human intervention</div>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold text-purple-600 mb-2">100%</div>
                <div className="text-gray-900 font-medium">Transparent</div>
                <div className="text-sm text-gray-600">Real-time cost tracking and savings visibility</div>
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
          <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">x402 + AgentKit Optimization Cycle</h2>
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
    </div>
  );
}

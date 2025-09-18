'use client';

import React, { useState } from 'react';

interface Step {
  id: string;
  title: string;
  description: string;
  details: string[];
  icon: string;
  color: string;
}

export default function HowItWorks() {
  const [activeStep, setActiveStep] = useState(0);

  const steps: Step[] = [
    {
      id: 'connect',
      title: 'Connect Your Infrastructure',
      description: 'Integrate your existing APIs, cloud services, and payment systems',
      details: [
        'Connect your current API providers (OpenAI, AWS, Stripe, etc.)',
        'Link your USDC wallet for micropayments',
        'Configure your business parameters and cost thresholds',
        'Set up monitoring for your existing infrastructure'
      ],
      icon: '🔗',
      color: 'blue'
    },
    {
      id: 'analyze',
      title: 'AI Analysis & Optimization',
      description: 'Our system analyzes your usage patterns and identifies optimization opportunities',
      details: [
        'AI analyzes your current API usage and costs',
        'Identifies patterns and inefficiencies in your infrastructure',
        'Discovers alternative providers with better pricing',
        'Calculates potential savings for each optimization'
      ],
      icon: '🧠',
      color: 'purple'
    },
    {
      id: 'implement',
      title: 'Autonomous Implementation',
      description: 'x402 protocol and AgentKit automatically implement cost optimizations',
      details: [
        'x402 protocol replaces subscriptions with pay-per-use micropayments',
        'AgentKit automatically switches to optimal providers',
        'Smart caching reduces redundant API calls by 80%',
        'Autonomous scaling adjusts resources based on demand'
      ],
      icon: '⚡',
      color: 'green'
    },
    {
      id: 'monitor',
      title: 'Real-time Monitoring',
      description: 'Track savings, performance, and optimization status in real-time',
      details: [
        'Live dashboard shows real-time cost savings',
        'Monitor API performance and response times',
        'Track optimization cycles and efficiency metrics',
        'Receive alerts for cost spikes or performance issues'
      ],
      icon: '📊',
      color: 'orange'
    },
    {
      id: 'scale',
      title: 'Continuous Optimization',
      description: 'The system continuously learns and optimizes for maximum savings',
      details: [
        'AI learns from your usage patterns and improves over time',
        'Automatically discovers new optimization opportunities',
        'Scales optimizations across your entire infrastructure',
        'Provides predictive analytics for future cost planning'
      ],
      icon: '🚀',
      color: 'teal'
    }
  ];

  const getColorClasses = (color: string, isActive: boolean) => {
    const colors = {
      blue: isActive ? 'from-blue-500 to-blue-600' : 'from-blue-100 to-blue-200',
      purple: isActive ? 'from-purple-500 to-purple-600' : 'from-purple-100 to-purple-200',
      green: isActive ? 'from-green-500 to-green-600' : 'from-green-100 to-green-200',
      orange: isActive ? 'from-orange-500 to-orange-600' : 'from-orange-100 to-orange-200',
      teal: isActive ? 'from-teal-500 to-teal-600' : 'from-teal-100 to-teal-200'
    };
    return colors[color as keyof typeof colors] || 'from-gray-100 to-gray-200';
  };

  return (
    <div className="max-w-7xl mx-auto p-8">
      <div className="text-center mb-16">
        <h1 className="text-5xl font-light text-gray-900 mb-6">
          How It Works
        </h1>
        <p className="text-xl text-gray-600 max-w-4xl mx-auto leading-relaxed">
          Our intelligent system seamlessly integrates with your existing infrastructure to deliver unprecedented cost savings through advanced automation and optimization.
        </p>
      </div>

      {/* Step Navigation */}
      <div className="flex justify-center mb-12">
        <div className="flex space-x-2 bg-gray-100 p-2 rounded-xl">
          {steps.map((step, index) => (
            <button
              key={step.id}
              onClick={() => setActiveStep(index)}
              className={`px-6 py-3 rounded-lg font-medium transition-all duration-300 ${
                activeStep === index
                  ? 'bg-white shadow-lg text-gray-900'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-white/50'
              }`}
            >
              {step.title}
            </button>
          ))}
        </div>
      </div>

      {/* Active Step Content */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
        <div className="space-y-8">
          <div className="space-y-4">
            <div className="flex items-center space-x-4">
              <div className={`w-16 h-16 bg-gradient-to-br ${getColorClasses(steps[activeStep].color, true)} rounded-2xl flex items-center justify-center text-2xl`}>
                {steps[activeStep].icon}
              </div>
              <div>
                <h2 className="text-3xl font-semibold text-gray-900">
                  {steps[activeStep].title}
                </h2>
                <p className="text-lg text-gray-600">
                  {steps[activeStep].description}
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            {steps[activeStep].details.map((detail, index) => (
              <div key={index} className="flex items-start space-x-3">
                <div className={`w-2 h-2 bg-gradient-to-r ${getColorClasses(steps[activeStep].color, true)} rounded-full mt-2 flex-shrink-0`}></div>
                <p className="text-gray-700 leading-relaxed">{detail}</p>
              </div>
            ))}
          </div>

          {/* Progress Indicator */}
          <div className="pt-8">
            <div className="flex items-center justify-between text-sm text-gray-500 mb-2">
              <span>Step {activeStep + 1} of {steps.length}</span>
              <span>{Math.round(((activeStep + 1) / steps.length) * 100)}% Complete</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className={`h-2 bg-gradient-to-r ${getColorClasses(steps[activeStep].color, true)} rounded-full transition-all duration-500`}
                style={{ width: `${((activeStep + 1) / steps.length) * 100}%` }}
              ></div>
            </div>
          </div>
        </div>

        {/* Visual Representation */}
        <div className="relative">
          <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-3xl p-8 border border-gray-200">
            <div className="space-y-6">
              {/* Current Step Highlight */}
              <div className="text-center">
                <div className={`w-24 h-24 bg-gradient-to-br ${getColorClasses(steps[activeStep].color, true)} rounded-3xl flex items-center justify-center text-4xl mx-auto mb-4 shadow-lg`}>
                  {steps[activeStep].icon}
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  {steps[activeStep].title}
                </h3>
                <p className="text-gray-600">
                  {steps[activeStep].description}
                </p>
              </div>

              {/* Flow Indicators */}
              <div className="flex justify-center space-x-4">
                {steps.map((step, index) => (
                  <div key={step.id} className="flex flex-col items-center">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-all duration-300 ${
                      index <= activeStep 
                        ? `bg-gradient-to-br ${getColorClasses(step.color, true)} text-white` 
                        : 'bg-gray-200 text-gray-500'
                    }`}>
                      {index + 1}
                    </div>
                    {index < steps.length - 1 && (
                      <div className={`w-8 h-0.5 mt-2 transition-all duration-300 ${
                        index < activeStep ? `bg-gradient-to-r ${getColorClasses(step.color, true)}` : 'bg-gray-200'
                      }`}></div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Technical Details */}
      <div className="mt-20">
        <h2 className="text-3xl font-light text-gray-900 text-center mb-12">
          Technical Implementation
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-200">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">x402 Protocol Integration</h3>
            <ul className="space-y-3 text-gray-700">
              <li className="flex items-start">
                <div className="w-1.5 h-1.5 bg-blue-600 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                <span>Replace subscription models with pay-per-use micropayments</span>
              </li>
              <li className="flex items-start">
                <div className="w-1.5 h-1.5 bg-blue-600 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                <span>Direct USDC transfers eliminate payment processing fees</span>
              </li>
              <li className="flex items-start">
                <div className="w-1.5 h-1.5 bg-blue-600 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                <span>Real-time cost tracking and optimization</span>
              </li>
              <li className="flex items-start">
                <div className="w-1.5 h-1.5 bg-blue-600 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                <span>Autonomous payment routing to optimal providers</span>
              </li>
            </ul>
          </div>

          <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-200">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">AgentKit Automation</h3>
            <ul className="space-y-3 text-gray-700">
              <li className="flex items-start">
                <div className="w-1.5 h-1.5 bg-green-600 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                <span>AI-powered resource scaling and optimization</span>
              </li>
              <li className="flex items-start">
                <div className="w-1.5 h-1.5 bg-green-600 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                <span>Intelligent caching reduces API calls by 80%</span>
              </li>
              <li className="flex items-start">
                <div className="w-1.5 h-1.5 bg-green-600 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                <span>Multi-cloud load balancing and cost optimization</span>
              </li>
              <li className="flex items-start">
                <div className="w-1.5 h-1.5 bg-green-600 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                <span>Predictive analytics prevent cost spikes</span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Results Section */}
      <div className="mt-20 bg-gradient-to-r from-gray-900 to-gray-800 rounded-3xl p-12 text-white">
        <div className="text-center space-y-8">
          <h2 className="text-3xl font-light">Expected Results</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="text-4xl font-bold text-green-400 mb-2">20-70%</div>
              <div className="text-gray-300">Cost Reduction</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-blue-400 mb-2">24/7</div>
              <div className="text-gray-300">Autonomous Operation</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-purple-400 mb-2">80%</div>
              <div className="text-gray-300">Reduced API Calls</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

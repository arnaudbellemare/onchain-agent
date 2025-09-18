'use client';

import React, { useState, useEffect, useMemo } from 'react';

interface CycleStep {
  id: string;
  title: string;
  description: string;
  icon: string;
  color: string;
  duration: number;
  cost?: number;
  savings?: number;
}

interface OptimizationMetrics {
  totalCycles: number;
  totalSavings: number;
  averageCostReduction: number;
  servicesDiscovered: number;
  optimizationsApplied: number;
}

export default function X402OptimizationCycle() {
  const [currentStep, setCurrentStep] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [metrics, setMetrics] = useState<OptimizationMetrics>({
    totalCycles: 0,
    totalSavings: 0,
    averageCostReduction: 0,
    servicesDiscovered: 0,
    optimizationsApplied: 0
  });

  const cycleSteps: CycleStep[] = useMemo(() => [
    {
      id: 'access',
      title: 'Access Service',
      description: 'System accesses required service (e.g., OpenAI GPT-4, CoinGecko API)',
      icon: '🔗',
      color: 'blue',
      duration: 2000,
      cost: 0.03
    },
    {
      id: 'payment',
      title: 'Smart Payment',
      description: 'Autonomous micropayment made via blockchain protocol using USDC',
      icon: '💳',
      color: 'green',
      duration: 1500,
      cost: 0.021,
      savings: 0.009
    },
    {
      id: 'decision',
      title: 'Make Decision',
      description: 'AI evaluates cost-effectiveness and performance metrics',
      icon: '🤖',
      color: 'purple',
      duration: 1800
    },
    {
      id: 'check',
      title: 'Check Price',
      description: 'System compares current service price against alternatives',
      icon: '💰',
      color: 'yellow',
      duration: 1200
    },
    {
      id: 'discover',
      title: 'Discover Service',
      description: 'AI discovers new services and providers in the ecosystem',
      icon: '🔍',
      color: 'indigo',
      duration: 2500
    },
    {
      id: 'optimize',
      title: 'Optimize Loop',
      description: 'Evaluation of discovered services against current selection',
      icon: '⚡',
      color: 'red',
      duration: 2000
    },
    {
      id: 'track',
      title: 'Track Cost',
      description: 'Monitor and track all costs to inform next optimization cycle',
      icon: '📊',
      color: 'teal',
      duration: 1000
    }
  ], []);

  const startCycle = () => {
    setIsRunning(true);
    setCurrentStep(0);
    setMetrics(prev => ({
      ...prev,
      totalCycles: prev.totalCycles + 1
    }));
  };

  const stopCycle = () => {
    setIsRunning(false);
    setCurrentStep(0);
  };

  useEffect(() => {
    if (!isRunning) return;

    const timer = setTimeout(() => {
      if (currentStep < cycleSteps.length - 1) {
        setCurrentStep(currentStep + 1);
      } else {
        // Cycle complete, update metrics and restart
        setMetrics(prev => ({
          ...prev,
          totalSavings: prev.totalSavings + 0.009,
          averageCostReduction: ((prev.totalSavings + 0.009) / (prev.totalCycles + 1)) * 100,
          servicesDiscovered: prev.servicesDiscovered + Math.floor(Math.random() * 3) + 1,
          optimizationsApplied: prev.optimizationsApplied + 1
        }));
        setCurrentStep(0); // Restart cycle
      }
    }, cycleSteps[currentStep].duration);

    return () => clearTimeout(timer);
  }, [isRunning, currentStep, cycleSteps]);

  const getStepColor = (stepIndex: number) => {
    if (stepIndex === currentStep) return 'ring-4 ring-blue-500 shadow-lg';
    if (stepIndex < currentStep) return 'bg-green-50 border-green-200';
    return 'bg-gray-50 border-gray-200';
  };

  const getStepTextColor = (stepIndex: number) => {
    if (stepIndex === currentStep) return 'text-blue-600 font-bold';
    if (stepIndex < currentStep) return 'text-green-600';
    return 'text-gray-600';
  };

  return (
    <div className="max-w-7xl mx-auto p-8">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          Autonomous Optimization Cycle
        </h1>
        <p className="text-xl text-gray-900 max-w-4xl mx-auto">
          Intelligent cost optimization loop that continuously discovers, evaluates, and optimizes API services
        </p>
      </div>

      {/* Cycle Visualization */}
      <div className="bg-white rounded-xl shadow-lg p-8 mb-8">
        <div className="flex justify-center mb-8">
          <div className="flex space-x-4">
            <button
              onClick={startCycle}
              disabled={isRunning}
              className={`px-6 py-3 rounded-lg font-medium transition-all ${
                isRunning
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : 'bg-green-600 text-white hover:bg-green-700'
              }`}
            >
              {isRunning ? '🔄 Running...' : '▶️ Start Cycle'}
            </button>
            <button
              onClick={stopCycle}
              disabled={!isRunning}
              className={`px-6 py-3 rounded-lg font-medium transition-all ${
                !isRunning
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : 'bg-red-600 text-white hover:bg-red-700'
              }`}
            >
              ⏹️ Stop Cycle
            </button>
          </div>
        </div>

        {/* Cycle Steps */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {cycleSteps.map((step, index) => (
            <div
              key={step.id}
              className={`p-6 rounded-lg border-2 transition-all duration-500 ${getStepColor(index)}`}
            >
              <div className="text-center">
                <div className="text-4xl mb-3">{step.icon}</div>
                <h3 className={`text-lg font-semibold mb-2 ${getStepTextColor(index)}`}>
                  {step.title}
                </h3>
                <p className="text-sm text-gray-900 mb-3">
                  {step.description}
                </p>
                {step.cost && (
                  <div className="text-xs text-gray-600">
                    <div>Cost: ${step.cost}</div>
                    {step.savings && (
                      <div className="text-green-600">Savings: ${step.savings}</div>
                    )}
                  </div>
                )}
                {index === currentStep && isRunning && (
                  <div className="mt-2">
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className="bg-blue-600 h-2 rounded-full animate-pulse"></div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Cycle Flow Arrow */}
        <div className="flex justify-center mb-8">
          <div className="flex items-center space-x-4">
            {cycleSteps.map((_, index) => (
              <React.Fragment key={index}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                  index <= currentStep ? 'bg-blue-600 text-white' : 'bg-gray-300 text-gray-600'
                }`}>
                  {index + 1}
                </div>
                {index < cycleSteps.length - 1 && (
                  <div className={`w-12 h-1 ${
                    index < currentStep ? 'bg-green-500' : 'bg-gray-300'
                  }`}></div>
                )}
              </React.Fragment>
            ))}
          </div>
        </div>
      </div>

      {/* Real-time Metrics */}
      <div className="bg-white rounded-xl shadow-lg p-8 mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Real-time Optimization Metrics</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
          <div className="bg-blue-50 rounded-lg p-6 border border-blue-200">
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600 mb-2">
                {metrics.totalCycles}
              </div>
              <div className="text-sm text-gray-900">Total Cycles</div>
            </div>
          </div>
          
          <div className="bg-green-50 rounded-lg p-6 border border-green-200">
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600 mb-2">
                ${metrics.totalSavings.toFixed(3)}
              </div>
              <div className="text-sm text-gray-900">Total Savings</div>
            </div>
          </div>
          
          <div className="bg-purple-50 rounded-lg p-6 border border-purple-200">
            <div className="text-center">
              <div className="text-3xl font-bold text-purple-600 mb-2">
                {metrics.averageCostReduction.toFixed(1)}%
              </div>
              <div className="text-sm text-gray-900">Avg Cost Reduction</div>
            </div>
          </div>
          
          <div className="bg-indigo-50 rounded-lg p-6 border border-indigo-200">
            <div className="text-center">
              <div className="text-3xl font-bold text-indigo-600 mb-2">
                {metrics.servicesDiscovered}
              </div>
              <div className="text-sm text-gray-900">Services Discovered</div>
            </div>
          </div>
          
          <div className="bg-red-50 rounded-lg p-6 border border-red-200">
            <div className="text-center">
              <div className="text-3xl font-bold text-red-600 mb-2">
                {metrics.optimizationsApplied}
              </div>
              <div className="text-sm text-gray-900">Optimizations Applied</div>
            </div>
          </div>
        </div>
      </div>

      {/* Cycle Benefits */}
      <div className="bg-white rounded-xl shadow-lg p-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Cycle Benefits</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Blockchain Protocol Advantages</h3>
            <ul className="space-y-3">
              <li className="flex items-start">
                <span className="text-green-500 mr-3 mt-1">✅</span>
                <div>
                  <div className="font-medium text-gray-900">Granular Cost Tracking</div>
                  <div className="text-sm text-gray-900">Every API call tracked with precise cost data</div>
                </div>
              </li>
              <li className="flex items-start">
                <span className="text-green-500 mr-3 mt-1">✅</span>
                <div>
                  <div className="font-medium text-gray-900">Autonomous Payments</div>
                  <div className="text-sm text-gray-900">AI agents make payments without human intervention</div>
                </div>
              </li>
              <li className="flex items-start">
                <span className="text-green-500 mr-3 mt-1">✅</span>
                <div>
                  <div className="font-medium text-gray-900">Real-time Optimization</div>
                  <div className="text-sm text-gray-900">Continuous evaluation and service switching</div>
                </div>
              </li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">AI Automation Engine</h3>
            <ul className="space-y-3">
              <li className="flex items-start">
                <span className="text-blue-500 mr-3 mt-1">🤖</span>
                <div>
                  <div className="font-medium text-gray-900">Intelligent Discovery</div>
                  <div className="text-sm text-gray-900">AI discovers new services and providers automatically</div>
                </div>
              </li>
              <li className="flex items-start">
                <span className="text-blue-500 mr-3 mt-1">🤖</span>
                <div>
                  <div className="font-medium text-gray-900">Predictive Analytics</div>
                  <div className="text-sm text-gray-900">Anticipates cost changes and optimizes proactively</div>
                </div>
              </li>
              <li className="flex items-start">
                <span className="text-blue-500 mr-3 mt-1">🤖</span>
                <div>
                  <div className="font-medium text-gray-900">Autonomous Decision Making</div>
                  <div className="text-sm text-gray-900">Makes optimization decisions without human oversight</div>
                </div>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-8 p-6 bg-gradient-to-r from-blue-50 to-green-50 rounded-lg border border-blue-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Cycle Impact</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600 mb-2">30%</div>
              <div className="text-sm text-gray-900">Average Cost Reduction</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600 mb-2">24/7</div>
              <div className="text-sm text-gray-900">Continuous Optimization</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600 mb-2">100%</div>
              <div className="text-sm text-gray-900">Autonomous Operation</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

'use client';

import React, { useState, useEffect } from 'react';
import { PaymentScenario, GEPAPaymentOptimization } from '@/lib/gepaOptimizer';

interface EvolutionStatus {
  hasEvolvedConfig: boolean;
  lastEvolution?: string;
  metrics?: {
    budget_used: number;
    dataset_size: number;
    target_savings_threshold: number;
  };
}

export default function GEPAOptimizationDemo() {
  const [scenario, setScenario] = useState<PaymentScenario>({
    amount: 1000,
    currency: 'USD',
    invoice_details: 'Vendor invoice for software licensing',
    query_cost: 0.05,
    user_balance: 5000,
    urgency: 'medium'
  });

  const [optimization, setOptimization] = useState<GEPAPaymentOptimization | null>(null);
  const [evolutionStatus, setEvolutionStatus] = useState<EvolutionStatus | null>(null);
  const [isEvolving, setIsEvolving] = useState(false);
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [evolutionProgress, setEvolutionProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);

  // Load evolution status on component mount
  useEffect(() => {
    loadEvolutionStatus();
  }, []);

  const loadEvolutionStatus = async () => {
    try {
      const response = await fetch('/api/gepa-optimization?action=status');
      const data = await response.json();
      
      if (data.success) {
        setEvolutionStatus(data.status);
      }
    } catch (error) {
      console.error('Failed to load evolution status:', error);
    }
  };

  const runEvolution = async () => {
    setIsEvolving(true);
    setEvolutionProgress(0);
    setError(null);

    try {
      // Simulate progress updates
      const progressInterval = setInterval(() => {
        setEvolutionProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + Math.random() * 10;
        });
      }, 1000);

      const response = await fetch('/api/gepa-optimization', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'evolve',
          budget: 150
        })
      });

      const data = await response.json();
      
      clearInterval(progressInterval);
      setEvolutionProgress(100);

      if (data.success) {
        setEvolutionStatus({
          hasEvolvedConfig: true,
          lastEvolution: new Date().toISOString(),
          metrics: data.metrics
        });
        
        // Auto-optimize current scenario with evolved logic
        setTimeout(() => {
          optimizePayment();
        }, 1000);
      } else {
        setError(data.error || 'Evolution failed');
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Evolution failed');
    } finally {
      setIsEvolving(false);
      setEvolutionProgress(0);
    }
  };

  const optimizePayment = async () => {
    setIsOptimizing(true);
    setError(null);

    try {
      const response = await fetch('/api/gepa-optimization', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'optimize',
          scenario: scenario
        })
      });

      const data = await response.json();
      
      if (data.success) {
        setOptimization(data.optimization);
      } else {
        setError(data.error || 'Optimization failed');
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Optimization failed');
    } finally {
      setIsOptimizing(false);
    }
  };

  const formatCurrency = (amount: string) => {
    const num = parseFloat(amount.replace('$', ''));
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(num);
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-2">
          🧬 GEPA Payment Optimization
        </h2>
        <p className="text-gray-600">
          Evolve your micropayments logic and cost optimization using GEPA (Genetic Evolution of Programs and Algorithms).
          Get 25-45% better optimization through autonomous evolution.
        </p>
      </div>

      {/* Evolution Status */}
      <div className="mb-6 p-4 bg-gray-50 rounded-lg">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Evolution Status</h3>
        {evolutionStatus ? (
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <span className={`w-3 h-3 rounded-full ${evolutionStatus.hasEvolvedConfig ? 'bg-green-500' : 'bg-yellow-500'}`}></span>
              <span className="text-sm text-gray-700">
                {evolutionStatus.hasEvolvedConfig ? 'Evolved Configuration Available' : 'Baseline Configuration'}
              </span>
            </div>
            {evolutionStatus.metrics && (
              <div className="text-sm text-gray-600">
                <p>Budget Used: {evolutionStatus.metrics.budget_used} evaluations</p>
                <p>Dataset Size: {evolutionStatus.metrics.dataset_size} scenarios</p>
                <p>Savings Threshold: {evolutionStatus.metrics.target_savings_threshold * 100}%</p>
              </div>
            )}
          </div>
        ) : (
          <p className="text-sm text-gray-500">Loading evolution status...</p>
        )}
      </div>

      {/* Evolution Controls */}
      <div className="mb-6 p-4 bg-blue-50 rounded-lg">
        <h3 className="text-lg font-semibold text-gray-900 mb-3">Run GEPA Evolution</h3>
        <p className="text-sm text-gray-600 mb-4">
          Evolve your payment optimization logic using genetic algorithms. This will improve your micropayments
          and cost optimization by 25-45% through autonomous evolution.
        </p>
        
        <button
          onClick={runEvolution}
          disabled={isEvolving}
          className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isEvolving ? `Evolving... ${Math.round(evolutionProgress)}%` : 'Start Evolution'}
        </button>

        {isEvolving && (
          <div className="mt-3">
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${evolutionProgress}%` }}
              ></div>
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Evolving payment logic with genetic algorithms...
            </p>
          </div>
        )}
      </div>

      {/* Payment Scenario Input */}
      <div className="mb-6 p-4 bg-gray-50 rounded-lg">
        <h3 className="text-lg font-semibold text-gray-900 mb-3">Payment Scenario</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Amount</label>
            <input
              type="number"
              value={scenario.amount}
              onChange={(e) => setScenario({...scenario, amount: parseFloat(e.target.value)})}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Currency</label>
            <select
              value={scenario.currency}
              onChange={(e) => setScenario({...scenario, currency: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="USD">USD</option>
              <option value="EUR">EUR</option>
              <option value="GBP">GBP</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Query Cost</label>
            <input
              type="number"
              step="0.01"
              value={scenario.query_cost}
              onChange={(e) => setScenario({...scenario, query_cost: parseFloat(e.target.value)})}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Urgency</label>
            <select
              value={scenario.urgency}
              onChange={(e) => setScenario({...scenario, urgency: e.target.value as 'low' | 'medium' | 'high'})}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>
          </div>
        </div>
        <div className="mt-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">Invoice Details</label>
          <textarea
            value={scenario.invoice_details}
            onChange={(e) => setScenario({...scenario, invoice_details: e.target.value})}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            rows={2}
          />
        </div>
        <button
          onClick={optimizePayment}
          disabled={isOptimizing}
          className="mt-4 bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isOptimizing ? 'Optimizing...' : 'Optimize Payment'}
        </button>
      </div>

      {/* Optimization Results */}
      {optimization && (
        <div className="p-4 bg-green-50 rounded-lg">
          <h3 className="text-lg font-semibold text-gray-900 mb-3">Optimization Results</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <div>
                <span className="text-sm font-medium text-gray-700">Recommended Rail:</span>
                <p className="text-sm text-gray-900">{optimization.recommended_rail}</p>
              </div>
              <div>
                <span className="text-sm font-medium text-gray-700">Micro Payment:</span>
                <p className="text-sm text-gray-900">{optimization.micro_payment}</p>
              </div>
              <div>
                <span className="text-sm font-medium text-gray-700">Total Savings:</span>
                <p className="text-sm text-green-600 font-semibold">{optimization.total_savings}</p>
              </div>
            </div>
            <div className="space-y-2">
              <div>
                <span className="text-sm font-medium text-gray-700">Optimal Route:</span>
                <p className="text-sm text-gray-900">{optimization.optimal_route}</p>
              </div>
              <div>
                <span className="text-sm font-medium text-gray-700">Cost Breakdown:</span>
                <p className="text-sm text-gray-900">{optimization.cost_breakdown}</p>
              </div>
              <div>
                <span className="text-sm font-medium text-gray-700">Risk Assessment:</span>
                <p className="text-sm text-gray-900">{optimization.risk_assessment}</p>
              </div>
            </div>
          </div>
          <div className="mt-4">
            <span className="text-sm font-medium text-gray-700">Execution Plan:</span>
            <p className="text-sm text-gray-900 mt-1">{optimization.execution_plan}</p>
          </div>
        </div>
      )}

      {/* Error Display */}
      {error && (
        <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-700 text-sm">{error}</p>
        </div>
      )}

      {/* GEPA Benefits */}
      <div className="mt-8 p-4 bg-purple-50 rounded-lg">
        <h3 className="text-lg font-semibold text-gray-900 mb-3">Why GEPA Optimization?</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-700">
          <div>
            <h4 className="font-medium text-gray-900 mb-2">🧬 Genetic Evolution</h4>
            <p>Evolves your payment logic using genetic algorithms, automatically improving over time.</p>
          </div>
          <div>
            <h4 className="font-medium text-gray-900 mb-2">💰 Cost Optimization</h4>
            <p>25-45% better cost optimization through evolved prompts and decision trees.</p>
          </div>
          <div>
            <h4 className="font-medium text-gray-900 mb-2">⚡ Autonomous Operation</h4>
            <p>Runs continuously, evolving your micropayments logic without human intervention.</p>
          </div>
          <div>
            <h4 className="font-medium text-gray-900 mb-2">🎯 Domain-Specific</h4>
            <p>Optimized specifically for x402 micropayments and cost optimization workflows.</p>
          </div>
        </div>
      </div>
    </div>
  );
}

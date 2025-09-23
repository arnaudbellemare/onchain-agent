'use client';

import { useState, useEffect } from 'react';

interface SavingsData {
  totalRequests: number;
  totalOriginalCost: number;
  totalOptimizedCost: number;
  totalSavings: number;
  totalFees: number;
  userNetSavings: number;
  averageSavingsPercentage: number;
}

interface SavingsTrackerProps {
  requestSavings: {
    originalCost: string;
    optimizedCost: string;
    savings: string;
    savingsPercentage: string;
  };
}

export default function SavingsTracker({ requestSavings }: SavingsTrackerProps) {
  const [savingsData, setSavingsData] = useState<SavingsData>({
    totalRequests: 0,
    totalOriginalCost: 0,
    totalOptimizedCost: 0,
    totalSavings: 0,
    totalFees: 0,
    userNetSavings: 0,
    averageSavingsPercentage: 0
  });

  useEffect(() => {
    // Load saved data from localStorage
    const savedData = localStorage.getItem('vibe-coding-savings');
    if (savedData) {
      setSavingsData(JSON.parse(savedData));
    }
  }, []);

  useEffect(() => {
    if (requestSavings) {
      const originalCost = parseFloat(requestSavings.originalCost.replace('$', ''));
      const optimizedCost = parseFloat(requestSavings.optimizedCost.replace('$', ''));
      const savings = parseFloat(requestSavings.savings.replace('$', ''));
      const savingsPercentage = parseFloat(requestSavings.savingsPercentage.replace('%', ''));

      const newData = {
        totalRequests: savingsData.totalRequests + 1,
        totalOriginalCost: savingsData.totalOriginalCost + originalCost,
        totalOptimizedCost: savingsData.totalOptimizedCost + optimizedCost,
        totalSavings: savingsData.totalSavings + savings,
        totalFees: savingsData.totalFees + (savings * 0.13), // 13% fee
        userNetSavings: savingsData.userNetSavings + (savings * 0.87), // 87% to user
        averageSavingsPercentage: ((savingsData.averageSavingsPercentage * savingsData.totalRequests) + savingsPercentage) / (savingsData.totalRequests + 1)
      };

      setSavingsData(newData);
      localStorage.setItem('vibe-coding-savings', JSON.stringify(newData));
    }
  }, [requestSavings]);

  const resetSavings = () => {
    setSavingsData({
      totalRequests: 0,
      totalOriginalCost: 0,
      totalOptimizedCost: 0,
      totalSavings: 0,
      totalFees: 0,
      userNetSavings: 0,
      averageSavingsPercentage: 0
    });
    localStorage.removeItem('vibe-coding-savings');
  };

  return (
    <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 mb-8">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-semibold">💰 Real-Time Savings Tracker</h2>
        <button
          onClick={resetSavings}
          className="px-4 py-2 bg-red-600 hover:bg-red-700 rounded-lg text-sm font-medium transition-colors"
        >
          Reset Data
        </button>
      </div>

      {/* Current Request Savings */}
      {requestSavings && (
        <div className="bg-green-500/20 border border-green-500/50 rounded-lg p-4 mb-6">
          <h3 className="text-lg font-semibold text-green-300 mb-3">
            🎯 Current Request Savings
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <span className="text-gray-300">Original Cost:</span>
              <div className="font-mono text-lg">{requestSavings.originalCost}</div>
            </div>
            <div>
              <span className="text-gray-300">Optimized Cost:</span>
              <div className="font-mono text-lg">{requestSavings.optimizedCost}</div>
            </div>
            <div>
              <span className="text-gray-300">Savings:</span>
              <div className="font-mono text-lg text-green-400">{requestSavings.savings}</div>
            </div>
            <div>
              <span className="text-gray-300">Savings %:</span>
              <div className="font-mono text-lg text-green-400">{requestSavings.savingsPercentage}</div>
            </div>
          </div>
        </div>
      )}

      {/* Total Session Savings */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div className="bg-blue-500/20 border border-blue-500/50 rounded-lg p-4">
          <h3 className="text-lg font-semibold text-blue-300 mb-3">
            📊 Session Totals
          </h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-300">Total Requests:</span>
              <span className="font-mono">{savingsData.totalRequests}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-300">Total Original Cost:</span>
              <span className="font-mono">${savingsData.totalOriginalCost.toFixed(6)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-300">Total Optimized Cost:</span>
              <span className="font-mono">${savingsData.totalOptimizedCost.toFixed(6)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-300">Total Savings:</span>
              <span className="font-mono text-green-400">${savingsData.totalSavings.toFixed(6)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-300">Average Savings %:</span>
              <span className="font-mono text-green-400">{savingsData.averageSavingsPercentage.toFixed(1)}%</span>
            </div>
          </div>
        </div>

        <div className="bg-purple-500/20 border border-purple-500/50 rounded-lg p-4">
          <h3 className="text-lg font-semibold text-purple-300 mb-3">
            💰 Revenue & User Benefits
          </h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-300">Your Fees (13%):</span>
              <span className="font-mono text-purple-400">${savingsData.totalFees.toFixed(6)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-300">User Net Savings (87%):</span>
              <span className="font-mono text-green-400">${savingsData.userNetSavings.toFixed(6)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-300">Daily Projection:</span>
              <span className="font-mono text-blue-400">${(savingsData.totalFees * 24).toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-300">Monthly Projection:</span>
              <span className="font-mono text-blue-400">${(savingsData.totalFees * 24 * 30).toFixed(2)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Revenue Analytics */}
      <div className="bg-gradient-to-r from-green-500/20 to-blue-500/20 border border-green-500/50 rounded-lg p-4">
        <h3 className="text-lg font-semibold text-green-300 mb-3">
          📈 Revenue Analytics
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
          <div>
            <div className="text-2xl font-bold text-green-400">
              ${(savingsData.totalFees / Math.max(savingsData.totalRequests, 1)).toFixed(6)}
            </div>
            <div className="text-sm text-gray-300">Average Fee Per Request</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-blue-400">
              ${(savingsData.totalSavings / Math.max(savingsData.totalRequests, 1)).toFixed(6)}
            </div>
            <div className="text-sm text-gray-300">Average Savings Per Request</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-purple-400">
              {savingsData.averageSavingsPercentage.toFixed(1)}%
            </div>
            <div className="text-sm text-gray-300">Average Cost Reduction</div>
          </div>
        </div>
      </div>
    </div>
  );
}

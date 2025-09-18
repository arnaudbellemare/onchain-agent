'use client';

import React, { useState } from 'react';

interface ROICalculation {
  currentCost: number;
  optimizedCost: number;
  monthlySavings: number;
  annualSavings: number;
  yourAnnualFee: number;
  clientNetSavings: number;
  savingsPercent: number;
  roiPercent: number;
}

export default function ROICalculator() {
  const [monthlyAPICalls, setMonthlyAPICalls] = useState<number>(100000);
  const [currentCostPerCall, setCurrentCostPerCall] = useState<number>(0.03);
  const [yourFeePercent, setYourFeePercent] = useState<number>(25);
  const [implementationCost, setImplementationCost] = useState<number>(25000);

  const calculateROI = (): ROICalculation => {
    const currentMonthlyCost = monthlyAPICalls * currentCostPerCall;
    const x402MonthlyCost = monthlyAPICalls * (currentCostPerCall * 0.7); // 30% discount
    const monthlySavings = currentMonthlyCost - x402MonthlyCost;
    const annualSavings = monthlySavings * 12;
    const yourAnnualFee = annualSavings * (yourFeePercent / 100);
    const clientNetSavings = annualSavings - yourAnnualFee;
    const savingsPercent = (monthlySavings / currentMonthlyCost) * 100;
    const roiPercent = ((clientNetSavings - implementationCost) / implementationCost) * 100;

    return {
      currentCost: currentMonthlyCost,
      optimizedCost: x402MonthlyCost,
      monthlySavings,
      annualSavings,
      yourAnnualFee,
      clientNetSavings,
      savingsPercent,
      roiPercent
    };
  };

  const roi = calculateROI();

  return (
    <div className="max-w-4xl mx-auto p-8 bg-white rounded-xl shadow-lg">
      <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">
        💰 x402 + AgentKit ROI Calculator
      </h2>
      
      <div className="grid md:grid-cols-2 gap-8">
        {/* Input Section */}
        <div className="space-y-6">
          <h3 className="text-xl font-semibold text-gray-900 mb-4">📊 Current API Usage</h3>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Monthly API Calls
            </label>
            <input
              type="number"
              value={monthlyAPICalls}
              onChange={(e) => setMonthlyAPICalls(Number(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="100000"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Current Cost Per Call ($)
            </label>
            <input
              type="number"
              step="0.001"
              value={currentCostPerCall}
              onChange={(e) => setCurrentCostPerCall(Number(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="0.03"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Your Fee Percentage (%)
            </label>
            <input
              type="number"
              value={yourFeePercent}
              onChange={(e) => setYourFeePercent(Number(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="25"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Implementation Cost ($)
            </label>
            <input
              type="number"
              value={implementationCost}
              onChange={(e) => setImplementationCost(Number(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="25000"
            />
          </div>
        </div>

        {/* Results Section */}
        <div className="space-y-6">
          <h3 className="text-xl font-semibold text-gray-900 mb-4">📈 Cost Optimization Results</h3>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 bg-red-50 rounded-lg">
              <p className="text-sm text-gray-600">Current Monthly Cost</p>
              <p className="text-2xl font-bold text-red-600">
                ${roi.currentCost.toLocaleString()}
              </p>
            </div>
            
            <div className="p-4 bg-green-50 rounded-lg">
              <p className="text-sm text-gray-600">Optimized Monthly Cost</p>
              <p className="text-2xl font-bold text-green-600">
                ${roi.optimizedCost.toLocaleString()}
              </p>
            </div>
            
            <div className="p-4 bg-blue-50 rounded-lg">
              <p className="text-sm text-gray-600">Monthly Savings</p>
              <p className="text-2xl font-bold text-blue-600">
                ${roi.monthlySavings.toLocaleString()}
              </p>
            </div>
            
            <div className="p-4 bg-purple-50 rounded-lg">
              <p className="text-sm text-gray-600">Savings %</p>
              <p className="text-2xl font-bold text-purple-600">
                {roi.savingsPercent.toFixed(1)}%
              </p>
            </div>
          </div>

          <div className="p-6 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg text-white">
            <h4 className="text-lg font-semibold mb-4">💼 Business Impact</h4>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span>Annual Savings:</span>
                <span className="font-bold">${roi.annualSavings.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span>Your Annual Fee ({yourFeePercent}%):</span>
                <span className="font-bold">${roi.yourAnnualFee.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span>Client Net Savings:</span>
                <span className="font-bold">${roi.clientNetSavings.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span>ROI (1st Year):</span>
                <span className="font-bold">{roi.roiPercent.toFixed(0)}%</span>
              </div>
            </div>
          </div>

          <div className="p-4 bg-yellow-50 rounded-lg">
            <h4 className="font-semibold text-yellow-800 mb-2">🎯 Key Benefits</h4>
            <ul className="text-sm text-yellow-700 space-y-1">
              <li>✅ 30% immediate cost reduction</li>
              <li>✅ No subscription overhead</li>
              <li>✅ 24/7 autonomous optimization</li>
              <li>✅ Granular cost tracking</li>
              <li>✅ Direct USDC payments</li>
            </ul>
          </div>
        </div>
      </div>

      <div className="mt-8 p-6 bg-gray-50 rounded-lg">
        <h4 className="text-lg font-semibold text-gray-900 mb-4">🚀 Ready to Save Money?</h4>
        <div className="flex flex-wrap gap-4">
          <button className="px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors">
            Schedule Demo
          </button>
          <button className="px-6 py-3 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition-colors">
            Start Pilot Program
          </button>
          <button className="px-6 py-3 bg-purple-600 text-white rounded-lg font-semibold hover:bg-purple-700 transition-colors">
            Download Case Study
          </button>
        </div>
      </div>
    </div>
  );
}

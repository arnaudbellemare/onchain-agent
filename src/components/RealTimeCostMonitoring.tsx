'use client';

import React, { useState, useEffect } from 'react';

interface CostMetrics {
  totalSpent: number;
  totalSaved: number;
  currentOptimization: number;
  activeServices: number;
  last24hSavings: number;
  monthlyProjection: number;
}

interface PaymentHistory {
  id: string;
  timestamp: Date;
  service: string;
  amount: number;
  savings: number;
  walletAddress: string;
  status: 'completed' | 'pending' | 'failed';
}

interface OptimizationStatus {
  isActive: boolean;
  lastOptimization: Date;
  cyclesCompleted: number;
  averageSavings: number;
  nextOptimization: Date;
}

export default function RealTimeCostMonitoring() {
  const [costMetrics, setCostMetrics] = useState<CostMetrics>({
    totalSpent: 0,
    totalSaved: 0,
    currentOptimization: 0,
    activeServices: 0,
    last24hSavings: 0,
    monthlyProjection: 0
  });

  const [paymentHistory, setPaymentHistory] = useState<PaymentHistory[]>([]);
  const [optimizationStatus, setOptimizationStatus] = useState<OptimizationStatus>({
    isActive: false,
    lastOptimization: new Date(),
    cyclesCompleted: 0,
    averageSavings: 0,
    nextOptimization: new Date()
  });

  const [selectedWallet, setSelectedWallet] = useState<string>('');

  // Simulate real-time data updates
  useEffect(() => {
    const interval = setInterval(() => {
      setCostMetrics(prev => ({
        totalSpent: prev.totalSpent + Math.random() * 10,
        totalSaved: prev.totalSaved + Math.random() * 15,
        currentOptimization: Math.min(prev.currentOptimization + Math.random() * 2, 100),
        activeServices: Math.floor(Math.random() * 5) + 3,
        last24hSavings: prev.last24hSavings + Math.random() * 5,
        monthlyProjection: prev.monthlyProjection + Math.random() * 20
      }));

      // Add new payment to history
      const newPayment: PaymentHistory = {
        id: Date.now().toString(),
        timestamp: new Date(),
        service: ['OpenAI', 'AWS', 'CoinGecko', 'Dune Analytics'][Math.floor(Math.random() * 4)],
        amount: Math.random() * 5,
        savings: Math.random() * 3,
        walletAddress: '0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6',
        status: 'completed'
      };

      setPaymentHistory(prev => [newPayment, ...prev.slice(0, 9)]);
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  const roiPercentage = costMetrics.totalSpent > 0 ? (costMetrics.totalSaved / costMetrics.totalSpent) * 100 : 0;

  return (
    <div className="max-w-7xl mx-auto p-8">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          💰 Real-time Cost Monitoring
        </h1>
        <p className="text-xl text-gray-900 max-w-4xl mx-auto">
          Track your x402 + AgentKit savings in real-time with autonomous optimization
        </p>
      </div>

      {/* Wallet Selection */}
      <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Wallet Analytics</h2>
        <div className="flex items-center space-x-4">
          <input
            type="text"
            placeholder="Enter wallet address (0x...)"
            value={selectedWallet}
            onChange={(e) => setSelectedWallet(e.target.value)}
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <button className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors">
            Track Wallet
          </button>
        </div>
      </div>

      {/* Real-time Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-red-500">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Total Spent</h3>
              <p className="text-3xl font-bold text-red-600">
                ${costMetrics.totalSpent.toFixed(2)}
              </p>
            </div>
            <div className="text-4xl">💸</div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-green-500">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Total Saved</h3>
              <p className="text-3xl font-bold text-green-600">
                ${costMetrics.totalSaved.toFixed(2)}
              </p>
            </div>
            <div className="text-4xl">💰</div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-blue-500">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">ROI</h3>
              <p className="text-3xl font-bold text-blue-600">
                {roiPercentage.toFixed(1)}%
              </p>
            </div>
            <div className="text-4xl">📈</div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-purple-500">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">24h Savings</h3>
              <p className="text-3xl font-bold text-purple-600">
                ${costMetrics.last24hSavings.toFixed(2)}
              </p>
            </div>
            <div className="text-4xl">⚡</div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-orange-500">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Active Services</h3>
              <p className="text-3xl font-bold text-orange-600">
                {costMetrics.activeServices}
              </p>
            </div>
            <div className="text-4xl">🔗</div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-teal-500">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Monthly Projection</h3>
              <p className="text-3xl font-bold text-teal-600">
                ${costMetrics.monthlyProjection.toFixed(2)}
              </p>
            </div>
            <div className="text-4xl">📊</div>
          </div>
        </div>
      </div>

      {/* Autonomous Optimization Status */}
      <div className="bg-white rounded-xl shadow-lg p-8 mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">🤖 Autonomous Optimization Status</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Optimization Progress</h3>
              <div className={`px-3 py-1 rounded-full text-sm font-medium ${
                optimizationStatus.isActive 
                  ? 'bg-green-100 text-green-800' 
                  : 'bg-gray-100 text-gray-800'
              }`}>
                {optimizationStatus.isActive ? 'Active' : 'Inactive'}
              </div>
            </div>
            
            <div className="w-full bg-gray-200 rounded-full h-3 mb-4">
              <div 
                className="bg-blue-600 h-3 rounded-full transition-all duration-500"
                style={{ width: `${costMetrics.currentOptimization}%` }}
              ></div>
            </div>
            <p className="text-sm text-gray-600">
              {costMetrics.currentOptimization.toFixed(1)}% optimization achieved
            </p>
          </div>

          <div className="space-y-4">
            <div className="flex justify-between">
              <span className="text-gray-900">Cycles Completed:</span>
              <span className="font-semibold">{optimizationStatus.cyclesCompleted}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-900">Average Savings:</span>
              <span className="font-semibold text-green-600">
                ${optimizationStatus.averageSavings.toFixed(2)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-900">Last Optimization:</span>
              <span className="font-semibold">
                {optimizationStatus.lastOptimization.toLocaleTimeString()}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-900">Next Optimization:</span>
              <span className="font-semibold">
                {optimizationStatus.nextOptimization.toLocaleTimeString()}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Payment History and Analytics */}
      <div className="bg-white rounded-xl shadow-lg p-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">📊 Payment History & Analytics</h2>
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 font-semibold text-gray-900">Timestamp</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-900">Service</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-900">Amount</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-900">Savings</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-900">Wallet</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-900">Status</th>
              </tr>
            </thead>
            <tbody>
              {paymentHistory.map((payment) => (
                <tr key={payment.id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="py-3 px-4 text-gray-900">
                    {payment.timestamp.toLocaleTimeString()}
                  </td>
                  <td className="py-3 px-4 text-gray-900 font-medium">
                    {payment.service}
                  </td>
                  <td className="py-3 px-4 text-gray-900">
                    ${payment.amount.toFixed(3)}
                  </td>
                  <td className="py-3 px-4 text-green-600 font-semibold">
                    ${payment.savings.toFixed(3)}
                  </td>
                  <td className="py-3 px-4 text-gray-600 font-mono text-sm">
                    {payment.walletAddress.slice(0, 8)}...{payment.walletAddress.slice(-6)}
                  </td>
                  <td className="py-3 px-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      payment.status === 'completed' 
                        ? 'bg-green-100 text-green-800'
                        : payment.status === 'pending'
                        ? 'bg-yellow-100 text-yellow-800'
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {payment.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {paymentHistory.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            No payment history available. Start making x402 payments to see analytics.
          </div>
        )}
      </div>

      {/* ROI Calculations and Savings Projections */}
      <div className="mt-8 bg-gradient-to-r from-blue-50 to-green-50 rounded-xl p-8 border border-blue-200">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">📈 ROI Calculations & Savings Projections</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-lg p-6 border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Current ROI</h3>
            <div className="text-3xl font-bold text-green-600 mb-2">
              {roiPercentage.toFixed(1)}%
            </div>
            <p className="text-sm text-gray-600">
              Return on investment from x402 + AgentKit optimization
            </p>
          </div>

          <div className="bg-white rounded-lg p-6 border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Monthly Savings</h3>
            <div className="text-3xl font-bold text-blue-600 mb-2">
              ${costMetrics.monthlyProjection.toFixed(2)}
            </div>
            <p className="text-sm text-gray-600">
              Projected monthly savings based on current usage
            </p>
          </div>

          <div className="bg-white rounded-lg p-6 border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Annual Projection</h3>
            <div className="text-3xl font-bold text-purple-600 mb-2">
              ${(costMetrics.monthlyProjection * 12).toFixed(2)}
            </div>
            <p className="text-sm text-gray-600">
              Projected annual savings with continued optimization
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

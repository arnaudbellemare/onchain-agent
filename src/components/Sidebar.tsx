"use client";

import { useState } from "react";

interface MarketData {
  symbol: string;
  price: string;
  change24h: string;
  change24hPercent: string;
}

interface SidebarProps {
  onQuickAction: (command: string) => void;
}

export default function Sidebar({ onQuickAction }: SidebarProps) {
  const [activeTab, setActiveTab] = useState("market");

  const marketData: MarketData[] = [
    { symbol: "ETH", price: "$2,897.45", change24h: "+$127.45", change24hPercent: "+4.61%" },
    { symbol: "BTC", price: "$67,234.12", change24h: "+$1,234.56", change24hPercent: "+1.87%" },
    { symbol: "USDC", price: "$1.00", change24h: "$0.00", change24hPercent: "0.00%" },
    { symbol: "USDT", price: "$1.00", change24h: "+$0.001", change24hPercent: "+0.10%" },
  ];

  const quickActions = [
    { label: "Check Balance", command: "check my balance", icon: "💰", color: "blue" },
    { label: "Send ETH", command: "Send 0.1 ETH to", icon: "📤", color: "green" },
    { label: "Swap Tokens", command: "Swap 1 ETH to USDC", icon: "🔄", color: "purple" },
    { label: "Wallet Info", command: "Show wallet address", icon: "🏦", color: "indigo" },
  ];

  const notifications = [
    { id: 1, type: "success", message: "Transaction confirmed", time: "2 min ago" },
    { id: 2, type: "info", message: "New token added to portfolio", time: "1 hour ago" },
    { id: 3, type: "warning", message: "Low gas fees detected", time: "3 hours ago" },
  ];

  return (
    <div className="w-80 bg-gray-800 border-l border-gray-700 p-6 space-y-6">
      {/* Tabs */}
      <div className="flex space-x-1 bg-gray-700 rounded-lg p-1">
        <button
          onClick={() => setActiveTab("market")}
          className={`flex-1 py-2 px-3 text-sm font-medium rounded-md transition-colors ${
            activeTab === "market"
              ? "bg-gray-600 text-white"
              : "text-gray-300 hover:text-white"
          }`}
        >
          Market
        </button>
        <button
          onClick={() => setActiveTab("actions")}
          className={`flex-1 py-2 px-3 text-sm font-medium rounded-md transition-colors ${
            activeTab === "actions"
              ? "bg-gray-600 text-white"
              : "text-gray-300 hover:text-white"
          }`}
        >
          Actions
        </button>
        <button
          onClick={() => setActiveTab("alerts")}
          className={`flex-1 py-2 px-3 text-sm font-medium rounded-md transition-colors ${
            activeTab === "alerts"
              ? "bg-gray-600 text-white"
              : "text-gray-300 hover:text-white"
          }`}
        >
          Alerts
        </button>
      </div>

      {/* Market Data */}
      {activeTab === "market" && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-white">Market Overview</h3>
          <div className="space-y-3">
            {marketData.map((asset, index) => (
              <div key={index} className="flex justify-between items-center p-3 bg-gray-700 rounded-lg">
                <div>
                  <div className="text-sm font-medium text-white">{asset.symbol}</div>
                  <div className="text-xs text-gray-400">{asset.price}</div>
                </div>
                <div className="text-right">
                  <div className={`text-sm font-medium ${
                    asset.change24h.startsWith('+') ? 'text-green-400' : 
                    asset.change24h.startsWith('-') ? 'text-red-400' : 
                    'text-gray-400'
                  }`}>
                    {asset.change24h}
                  </div>
                  <div className={`text-xs ${
                    asset.change24h.startsWith('+') ? 'text-green-400' : 
                    asset.change24h.startsWith('-') ? 'text-red-400' : 
                    'text-gray-400'
                  }`}>
                    {asset.change24hPercent}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Quick Actions */}
      {activeTab === "actions" && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-white">Quick Actions</h3>
          <div className="space-y-3">
            {quickActions.map((action, index) => (
              <button
                key={index}
                onClick={() => onQuickAction(action.command)}
                className={`w-full flex items-center p-3 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors border-l-4 border-${action.color}-500`}
              >
                <span className="text-xl mr-3">{action.icon}</span>
                <span className="text-white text-sm font-medium">{action.label}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Notifications */}
      {activeTab === "alerts" && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-white">Recent Activity</h3>
          <div className="space-y-3">
            {notifications.map((notification) => (
              <div key={notification.id} className="p-3 bg-gray-700 rounded-lg">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <p className="text-sm text-white">{notification.message}</p>
                    <p className="text-xs text-gray-400 mt-1">{notification.time}</p>
                  </div>
                  <div className={`w-2 h-2 rounded-full mt-1 ${
                    notification.type === 'success' ? 'bg-green-400' :
                    notification.type === 'warning' ? 'bg-yellow-400' :
                    'bg-blue-400'
                  }`}></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Network Status */}
      <div className="mt-8 p-4 bg-gray-700 rounded-lg">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-white">Network Status</span>
          <div className="w-2 h-2 bg-green-400 rounded-full"></div>
        </div>
        <div className="text-xs text-gray-400">Base Sepolia</div>
        <div className="text-xs text-gray-400">Connected</div>
      </div>
    </div>
  );
}

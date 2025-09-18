"use client";

import { useState } from "react";

interface AIAction {
  id: string;
  type: "send" | "swap" | "request";
  description: string;
  amount: string;
  token: string;
  recipient?: string;
  status: "pending" | "approved" | "rejected" | "completed";
  timestamp: Date;
  aiReason: string;
}

export default function AIDashboard() {
  const [aiActions, setAiActions] = useState<AIAction[]>([
    {
      id: "1",
      type: "send",
      description: "Pay for coffee",
      amount: "0.01",
      token: "ETH",
      recipient: "0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6",
      status: "pending",
      timestamp: new Date(),
      aiReason: "User requested coffee payment via voice command"
    },
    {
      id: "2",
      type: "swap",
      description: "Convert ETH to USDC for stable spending",
      amount: "0.5",
      token: "ETH",
      status: "approved",
      timestamp: new Date(Date.now() - 3600000),
      aiReason: "Automatic rebalancing based on spending patterns"
    }
  ]);

  const handleApprove = (id: string) => {
    setAiActions(prev => prev.map(action => 
      action.id === id ? { ...action, status: "approved" as const } : action
    ));
  };

  const handleReject = (id: string) => {
    setAiActions(prev => prev.map(action => 
      action.id === id ? { ...action, status: "rejected" as const } : action
    ));
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending": return "text-yellow-400";
      case "approved": return "text-green-400";
      case "rejected": return "text-red-400";
      case "completed": return "text-blue-400";
      default: return "text-gray-400";
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "send": return "↗";
      case "swap": return "⇄";
      case "request": return "↙";
      default: return "?";
    }
  };

  return (
    <div className="space-y-8">
      {/* AI Status */}
      <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-8">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-2xl font-light text-white">AI Assistant Status</h3>
          <div className="flex items-center space-x-3">
            <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
            <span className="text-sm text-green-400 font-medium">Active</span>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center">
            <div className="text-3xl font-light text-white mb-1">{aiActions.length}</div>
            <div className="text-sm text-gray-400">Total Actions</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-light text-green-400 mb-1">
              {aiActions.filter(a => a.status === "approved").length}
            </div>
            <div className="text-sm text-gray-400">Approved</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-light text-yellow-400 mb-1">
              {aiActions.filter(a => a.status === "pending").length}
            </div>
            <div className="text-sm text-gray-400">Pending</div>
          </div>
        </div>
      </div>

      {/* AI Actions */}
      <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl overflow-hidden">
        <div className="px-8 py-6 border-b border-white/10">
          <h3 className="text-2xl font-light text-white">AI Actions</h3>
        </div>
        <div className="divide-y divide-white/10">
          {aiActions.map((action) => (
            <div key={action.id} className="px-8 py-6 hover:bg-white/5 transition-colors duration-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-6">
                  <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
                    <span className="text-white font-semibold text-lg">{getTypeIcon(action.type)}</span>
                  </div>
                  <div>
                    <div className="font-medium text-white text-lg">{action.description}</div>
                    <div className="text-sm text-gray-400 mt-1">{action.aiReason}</div>
                    <div className="text-xs text-gray-500 mt-1">
                      {action.timestamp.toLocaleString()}
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-6">
                  <div className="text-right">
                    <div className="font-medium text-white text-lg">
                      {action.amount} {action.token}
                    </div>
                    <div className={`text-sm font-medium ${getStatusColor(action.status)}`}>
                      {action.status.charAt(0).toUpperCase() + action.status.slice(1)}
                    </div>
                  </div>
                  {action.status === "pending" && (
                    <div className="flex space-x-3">
                      <button
                        onClick={() => handleApprove(action.id)}
                        className="px-6 py-2 bg-green-600 hover:bg-green-700 text-white text-sm rounded-xl transition-all duration-200 hover:scale-105 font-medium"
                      >
                        Approve
                      </button>
                      <button
                        onClick={() => handleReject(action.id)}
                        className="px-6 py-2 bg-red-600 hover:bg-red-700 text-white text-sm rounded-xl transition-all duration-200 hover:scale-105 font-medium"
                      >
                        Reject
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* AI Settings */}
      <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-8">
        <h3 className="text-2xl font-light text-white mb-6">AI Settings</h3>
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <div className="font-medium text-white text-lg">Auto-approve small transactions</div>
              <div className="text-sm text-gray-400 mt-1">Automatically approve transactions under 0.01 ETH</div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" className="sr-only peer" />
              <div className="w-12 h-6 bg-gray-700 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-800 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <div className="font-medium text-white text-lg">Smart rebalancing</div>
              <div className="text-sm text-gray-400 mt-1">Automatically rebalance portfolio based on market conditions</div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" className="sr-only peer" defaultChecked />
              <div className="w-12 h-6 bg-gray-700 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-800 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <div className="font-medium text-white text-lg">Voice commands</div>
              <div className="text-sm text-gray-400 mt-1">Enable voice-activated transactions</div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" className="sr-only peer" />
              <div className="w-12 h-6 bg-gray-700 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-800 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>
        </div>
      </div>
    </div>
  );
}

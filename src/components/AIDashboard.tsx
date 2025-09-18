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
    <div className="space-y-6">
      {/* AI Status */}
      <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-white">AI Assistant Status</h3>
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            <span className="text-sm text-green-400">Active</span>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="text-center">
            <div className="text-2xl font-semibold text-white">{aiActions.length}</div>
            <div className="text-sm text-gray-400">Total Actions</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-semibold text-green-400">
              {aiActions.filter(a => a.status === "approved").length}
            </div>
            <div className="text-sm text-gray-400">Approved</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-semibold text-yellow-400">
              {aiActions.filter(a => a.status === "pending").length}
            </div>
            <div className="text-sm text-gray-400">Pending</div>
          </div>
        </div>
      </div>

      {/* AI Actions */}
      <div className="bg-gray-900 border border-gray-800 rounded-lg">
        <div className="px-6 py-4 border-b border-gray-800">
          <h3 className="text-lg font-semibold text-white">AI Actions</h3>
        </div>
        <div className="divide-y divide-gray-800">
          {aiActions.map((action) => (
            <div key={action.id} className="px-6 py-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
                    <span className="text-white font-semibold">{getTypeIcon(action.type)}</span>
                  </div>
                  <div>
                    <div className="font-semibold text-white">{action.description}</div>
                    <div className="text-sm text-gray-400">{action.aiReason}</div>
                    <div className="text-xs text-gray-500">
                      {action.timestamp.toLocaleString()}
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="text-right">
                    <div className="font-semibold text-white">
                      {action.amount} {action.token}
                    </div>
                    <div className={`text-sm ${getStatusColor(action.status)}`}>
                      {action.status.charAt(0).toUpperCase() + action.status.slice(1)}
                    </div>
                  </div>
                  {action.status === "pending" && (
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleApprove(action.id)}
                        className="px-3 py-1 bg-green-600 hover:bg-green-700 text-white text-sm rounded-lg transition-colors"
                      >
                        Approve
                      </button>
                      <button
                        onClick={() => handleReject(action.id)}
                        className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white text-sm rounded-lg transition-colors"
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
      <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-white mb-4">AI Settings</h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="font-medium text-white">Auto-approve small transactions</div>
              <div className="text-sm text-gray-400">Automatically approve transactions under 0.01 ETH</div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" className="sr-only peer" />
              <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-800 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <div className="font-medium text-white">Smart rebalancing</div>
              <div className="text-sm text-gray-400">Automatically rebalance portfolio based on market conditions</div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" className="sr-only peer" defaultChecked />
              <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-800 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <div className="font-medium text-white">Voice commands</div>
              <div className="text-sm text-gray-400">Enable voice-activated transactions</div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" className="sr-only peer" />
              <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-800 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>
        </div>
      </div>
    </div>
  );
}

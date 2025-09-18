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
      description: "x402 API Payment: OpenAI GPT-4",
      amount: "0.001",
      token: "USDC",
      recipient: "0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6",
      status: "completed",
      timestamp: new Date(Date.now() - 300000),
      aiReason: "Autonomous AI agent paid for API access using x402 protocol"
    },
    {
      id: "2",
      type: "swap",
      description: "AgentKit: Convert ETH to USDC for payroll",
      amount: "2.5",
      token: "ETH",
      status: "completed",
      timestamp: new Date(Date.now() - 1800000),
      aiReason: "Smart contract executed via AgentKit for monthly payroll preparation"
    },
    {
      id: "3",
      type: "send",
      description: "x402 Micropayment: Weather API",
      amount: "0.0005",
      token: "USDC",
      status: "completed",
      timestamp: new Date(Date.now() - 600000),
      aiReason: "Pay-per-query data service accessed autonomously"
    },
    {
      id: "4",
      type: "send",
      description: "AgentKit: Employee Salary Payment",
      amount: "5000",
      token: "USDC",
      recipient: "0x8ba1f109551bD432803012645Hac136c",
      status: "pending",
      timestamp: new Date(),
      aiReason: "Automated payroll execution via AgentKit blockchain integration"
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
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="text-center">
            <div className="text-3xl font-light text-white mb-1">{aiActions.length}</div>
            <div className="text-sm text-gray-300">Total Actions</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-light text-green-400 mb-1">
              {aiActions.filter(a => a.status === "completed").length}
            </div>
            <div className="text-sm text-gray-300">Completed</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-light text-yellow-400 mb-1">
              {aiActions.filter(a => a.status === "pending").length}
            </div>
            <div className="text-sm text-gray-300">Pending</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-light text-blue-400 mb-1">
              {aiActions.filter(a => a.type === "send" && a.amount.includes("0.00")).length}
            </div>
            <div className="text-sm text-gray-300">x402 Payments</div>
          </div>
        </div>
      </div>

      {/* AI Actions */}
      <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl overflow-hidden">
        <div className="px-8 py-6 border-b border-white/10">
          <h3 className="text-2xl font-light text-white">AI Actions</h3>
          <p className="text-sm text-gray-300 mt-2">Real blockchain transactions powered by AgentKit and x402 protocol</p>
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
                    <div className="text-sm text-gray-300 mt-1">{action.aiReason}</div>
                    <div className="text-xs text-gray-400 mt-1">
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

      {/* x402 & AgentKit Examples */}
      <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-8">
        <h3 className="text-2xl font-light text-white mb-6">x402 & AgentKit Examples</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-6">
            <h4 className="text-lg font-semibold text-blue-400 mb-3">🔗 x402 Protocol</h4>
            <div className="space-y-2 text-sm text-gray-300">
              <div>• <strong>API Payments:</strong> $0.001 per OpenAI call</div>
              <div>• <strong>Micropayments:</strong> $0.0005 per weather query</div>
              <div>• <strong>Autonomous:</strong> No accounts or authentication</div>
              <div>• <strong>Machine-to-Machine:</strong> AI agents pay for services</div>
            </div>
          </div>
          <div className="bg-green-500/10 border border-green-500/20 rounded-xl p-6">
            <h4 className="text-lg font-semibold text-green-400 mb-3">🤖 AgentKit Integration</h4>
            <div className="space-y-2 text-sm text-gray-300">
              <div>• <strong>Real Transactions:</strong> Actual blockchain operations</div>
              <div>• <strong>Token Swaps:</strong> ETH ↔ USDC via DEX</div>
              <div>• <strong>Payroll:</strong> Automated salary payments</div>
              <div>• <strong>Smart Contracts:</strong> Programmable business logic</div>
            </div>
          </div>
        </div>
        
        <div className="bg-purple-500/10 border border-purple-500/20 rounded-xl p-6">
          <h4 className="text-lg font-semibold text-purple-400 mb-3">💡 Try These Commands</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-300">
            <div>
              <div className="font-medium text-white mb-2">x402 Examples:</div>
              <div>• "Process x402 API payment"</div>
              <div>• "Enable micropayment services"</div>
              <div>• "Call x402 API 5 times"</div>
            </div>
            <div>
              <div className="font-medium text-white mb-2">AgentKit Examples:</div>
              <div>• "Send 0.1 ETH to 0x..."</div>
              <div>• "Swap 1 ETH to USDC"</div>
              <div>• "Check my wallet balance"</div>
            </div>
          </div>
        </div>
      </div>

      {/* AI Settings */}
      <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-8">
        <h3 className="text-2xl font-light text-white mb-6">AI Settings</h3>
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <div className="font-medium text-white text-lg">Auto-approve small transactions</div>
              <div className="text-sm text-gray-300 mt-1">Automatically approve transactions under 0.01 ETH</div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" className="sr-only peer" />
              <div className="w-12 h-6 bg-gray-700 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-800 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <div className="font-medium text-white text-lg">Smart rebalancing</div>
              <div className="text-sm text-gray-300 mt-1">Automatically rebalance portfolio based on market conditions</div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" className="sr-only peer" defaultChecked />
              <div className="w-12 h-6 bg-gray-700 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-800 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <div className="font-medium text-white text-lg">Voice commands</div>
              <div className="text-sm text-gray-300 mt-1">Enable voice-activated transactions</div>
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

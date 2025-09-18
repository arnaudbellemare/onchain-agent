"use client";

import { useState, useEffect } from "react";
import WalletConnection from "@/components/WalletConnection";
import TransactionModal from "@/components/TransactionModal";
import Notification from "@/components/Notification";
import AIDashboard from "@/components/AIDashboard";

interface PortfolioData {
  totalBalance: string;
  totalValue: string;
  assets: Array<{
    symbol: string;
    name: string;
    balance: string;
    value: string;
    change24h: string;
    change24hPercent: string;
  }>;
}

export default function Home() {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [message, setMessage] = useState("");
  const [response, setResponse] = useState("");
  const [loading, setLoading] = useState(false);
  const [portfolioData, setPortfolioData] = useState<PortfolioData | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalType, setModalType] = useState<"send" | "swap" | "request">("send");
  const [selectedAsset, setSelectedAsset] = useState<{ symbol: string; name: string; balance: string; value: string; change24h: string; change24hPercent: string } | null>(null);
  const [notification, setNotification] = useState({
    message: "",
    type: "info" as "success" | "error" | "info",
    isVisible: false
  });

  // Mock portfolio data
  useEffect(() => {
    setPortfolioData({
      totalBalance: "2.8473",
      totalValue: "$8,541.90",
      assets: [
        {
          symbol: "ETH",
          name: "Ethereum",
          balance: "2.8473",
          value: "$8,541.90",
          change24h: "+$127.45",
          change24hPercent: "+1.52%",
        },
        {
          symbol: "USDC",
          name: "USD Coin",
          balance: "1,500.00",
          value: "$1,500.00",
          change24h: "$0.00",
          change24hPercent: "0.00%",
        },
      ],
    });
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;

    setLoading(true);
    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messages: [{ role: "user", content: message }],
        }),
      });

      const data = await res.json();
      console.log("API Response:", data);
      
      if (data.success) {
        setResponse(data.message);
      } else {
        setResponse(`Error: ${data.error || data.message || "Unknown error"}`);
      }
    } catch (error) {
      setResponse(`Error: ${error instanceof Error ? error.message : "Unknown error"}`);
    } finally {
      setLoading(false);
    }
  };

  const handleModalConfirm = (data: { type: string; amount: string; token?: string; recipient?: string; fromToken?: string; toToken?: string; slippage?: number; message?: string }) => {
    if (data.type === "send" && data.token && data.recipient) {
      setMessage(`Send ${data.amount} ${data.token} to ${data.recipient}`);
      setNotification({
        message: `Sending ${data.amount} ${data.token} to ${data.recipient.substring(0, 6)}...`,
        type: "info",
        isVisible: true
      });
    } else if (data.type === "swap" && data.fromToken && data.toToken) {
      setMessage(`Swap ${data.amount} ${data.fromToken} to ${data.toToken}`);
      setNotification({
        message: `Swapping ${data.amount} ${data.fromToken} to ${data.toToken}...`,
        type: "info",
        isVisible: true
      });
    } else if (data.type === "request" && data.token && data.recipient) {
      const requestMessage = data.message ? ` for ${data.message}` : "";
      setMessage(`Request ${data.amount} ${data.token} from ${data.recipient}${requestMessage}`);
      setNotification({
        message: `Payment request sent for ${data.amount} ${data.token}`,
        type: "info",
        isVisible: true
      });
    }
    setActiveTab("ai");
  };

  const quickActions = [
    { 
      label: "Send", 
      icon: "↗", 
      action: () => {
        setSelectedAsset({ 
          symbol: "ETH", 
          name: "Ethereum", 
          balance: portfolioData?.totalBalance || "0",
          value: portfolioData?.totalValue || "$0",
          change24h: "+$0.00",
          change24hPercent: "+0.00%"
        });
        setModalType("send");
        setModalOpen(true);
      }
    },
    { 
      label: "Swap", 
      icon: "⇄", 
      action: () => {
        setSelectedAsset({ 
          symbol: "ETH", 
          name: "Ethereum", 
          balance: portfolioData?.totalBalance || "0",
          value: portfolioData?.totalValue || "$0",
          change24h: "+$0.00",
          change24hPercent: "+0.00%"
        });
        setModalType("swap");
        setModalOpen(true);
      }
    },
    { 
      label: "Request", 
      icon: "↙", 
      action: () => {
        setSelectedAsset({ 
          symbol: "ETH", 
          name: "Ethereum", 
          balance: portfolioData?.totalBalance || "0",
          value: portfolioData?.totalValue || "$0",
          change24h: "+$0.00",
          change24hPercent: "+0.00%"
        });
        setModalType("request");
        setModalOpen(true);
      }
    },
    { 
      label: "AI", 
      icon: "🤖", 
      action: () => setActiveTab("ai")
    },
  ];

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <header className="border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-8">
              <h1 className="text-xl font-semibold text-white">AgentKit</h1>
              <nav className="hidden md:flex space-x-6">
                <button
                  onClick={() => setActiveTab("dashboard")}
                  className={`text-sm font-medium transition-colors ${
                    activeTab === "dashboard" 
                      ? "text-white" 
                      : "text-gray-400 hover:text-white"
                  }`}
                >
                  Dashboard
                </button>
                <button
                  onClick={() => setActiveTab("transactions")}
                  className={`text-sm font-medium transition-colors ${
                    activeTab === "transactions" 
                      ? "text-white" 
                      : "text-gray-400 hover:text-white"
                  }`}
                >
                  Transactions
                </button>
                <button
                  onClick={() => setActiveTab("ai")}
                  className={`text-sm font-medium transition-colors ${
                    activeTab === "ai" 
                      ? "text-white" 
                      : "text-gray-400 hover:text-white"
                  }`}
                >
                  AI Assistant
                </button>
                <button
                  onClick={() => setActiveTab("ai-dashboard")}
                  className={`text-sm font-medium transition-colors ${
                    activeTab === "ai-dashboard" 
                      ? "text-white" 
                      : "text-gray-400 hover:text-white"
                  }`}
                >
                  AI Dashboard
                </button>
              </nav>
            </div>
            
            <WalletConnection />
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === "dashboard" && (
          <div className="space-y-8">
            {/* Portfolio Overview */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
                <div className="text-sm text-gray-400 mb-1">Total Balance</div>
                <div className="text-2xl font-semibold text-white">{portfolioData?.totalBalance} ETH</div>
                <div className="text-sm text-gray-400">{portfolioData?.totalValue}</div>
              </div>
              <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
                <div className="text-sm text-gray-400 mb-1">24h Change</div>
                <div className="text-2xl font-semibold text-green-400">+$127.45</div>
                <div className="text-sm text-green-400">+1.52%</div>
              </div>
              <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
                <div className="text-sm text-gray-400 mb-1">Active Assets</div>
                <div className="text-2xl font-semibold text-white">{portfolioData?.assets.length}</div>
                <div className="text-sm text-gray-400">Tokens</div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
              <div className="text-lg font-semibold text-white mb-6">Quick Actions</div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {quickActions.map((action, index) => (
                  <button
                    key={index}
                    onClick={action.action}
                    className="flex flex-col items-center p-6 bg-gray-800 hover:bg-gray-700 border border-gray-700 hover:border-gray-600 rounded-lg transition-all duration-200 group"
                  >
                    <div className="text-2xl mb-2 group-hover:scale-110 transition-transform">
                      {action.icon}
                    </div>
                    <span className="text-sm font-medium text-white">{action.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Assets */}
            <div className="bg-gray-900 border border-gray-800 rounded-lg">
              <div className="px-6 py-4 border-b border-gray-800">
                <h3 className="text-lg font-semibold text-white">Assets</h3>
              </div>
              <div className="divide-y divide-gray-800">
                {portfolioData?.assets.map((asset, index) => (
                  <div key={index} className="px-6 py-4 flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
                        <span className="text-white font-semibold">{asset.symbol.charAt(0)}</span>
                      </div>
                      <div>
                        <div className="font-semibold text-white">{asset.symbol}</div>
                        <div className="text-sm text-gray-400">{asset.name}</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold text-white">{asset.balance}</div>
                      <div className="text-sm text-gray-400">{asset.value}</div>
                    </div>
                    <div className="text-right">
                      <div className={`text-sm font-medium ${asset.change24h.startsWith('+') ? 'text-green-400' : 'text-red-400'}`}>
                        {asset.change24h}
                      </div>
                      <div className={`text-xs ${asset.change24hPercent.startsWith('+') ? 'text-green-400' : 'text-red-400'}`}>
                        {asset.change24hPercent}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === "transactions" && (
          <div className="space-y-6">
            <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-white mb-4">Recent Transactions</h3>
              <div className="text-center py-12">
                <div className="text-gray-400 mb-2">No transactions yet</div>
                <div className="text-sm text-gray-500">Your transaction history will appear here</div>
              </div>
            </div>
          </div>
        )}

        {activeTab === "ai" && (
          <div className="max-w-4xl mx-auto">
            <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
              <h2 className="text-xl font-semibold text-white mb-6">AI Assistant</h2>
              
              {/* Chat Interface */}
              <div className="h-96 overflow-y-auto bg-black border border-gray-800 rounded-lg p-4 mb-6">
                <div className="space-y-4">
                  {response && (
                    <div className="flex justify-start">
                      <div className="bg-gray-800 text-white p-3 rounded-lg max-w-xs whitespace-pre-wrap border border-gray-700">
                        {response}
                      </div>
                    </div>
                  )}
                </div>
              </div>
              
              {/* Input */}
              <form onSubmit={handleSubmit} className="flex space-x-4">
                <input
                  type="text"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Ask your AI assistant to send, swap, or manage your assets..."
                  className="flex-1 p-3 rounded-lg bg-black text-white border border-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  disabled={loading}
                />
                <button
                  type="submit"
                  className="px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-black disabled:opacity-50"
                  disabled={loading}
                >
                  {loading ? "..." : "Send"}
                </button>
              </form>
            </div>
          </div>
        )}

        {activeTab === "ai-dashboard" && (
          <AIDashboard />
        )}
      </div>

      {/* Transaction Modal */}
      <TransactionModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onConfirm={handleModalConfirm}
        type={modalType}
        asset={selectedAsset}
      />

      {/* Notification */}
      <Notification
        message={notification.message}
        type={notification.type}
        isVisible={notification.isVisible}
        onClose={() => setNotification({ ...notification, isVisible: false })}
      />
    </div>
  );
}
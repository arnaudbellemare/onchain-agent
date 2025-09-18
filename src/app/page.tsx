"use client";

import { useState, useEffect } from "react";
import PortfolioCard from "@/components/PortfolioCard";
import AssetRow from "@/components/AssetRow";
import TradingInterface from "@/components/TradingInterface";
import Sidebar from "@/components/Sidebar";

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
  const [activeTab, setActiveTab] = useState("portfolio");
  const [message, setMessage] = useState("");
  const [response, setResponse] = useState("");
  const [loading, setLoading] = useState(false);
  const [portfolioData, setPortfolioData] = useState<PortfolioData | null>(null);

  // Mock portfolio data
  useEffect(() => {
    setPortfolioData({
      totalBalance: "2.8473",
      totalValue: "$8,247.32",
      assets: [
        { symbol: "ETH", name: "Ethereum", balance: "2.8473", value: "$8,247.32", change24h: "+$127.45", change24hPercent: "+1.57%" },
        { symbol: "USDC", name: "USD Coin", balance: "1,250.00", value: "$1,250.00", change24h: "$0.00", change24hPercent: "0.00%" },
        { symbol: "BTC", name: "Bitcoin", balance: "0.0234", value: "$1,567.89", change24h: "-$23.12", change24hPercent: "-1.45%" },
      ]
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

  const quickActions = [
    { label: "Check Balance", command: "check my balance", icon: "💰" },
    { label: "Send ETH", command: "Send 0.1 ETH to", icon: "📤" },
    { label: "Swap Tokens", command: "Swap 1 ETH to USDC", icon: "🔄" },
    { label: "Wallet Info", command: "Show wallet address", icon: "🏦" },
  ];

  const handleAssetSend = (asset: any) => {
    setMessage(`Send 0.1 ${asset.symbol} to`);
  };

  const handleAssetSwap = (asset: any) => {
    setMessage(`Swap 1 ${asset.symbol} to USDC`);
  };

  const handleExecuteSwap = (fromToken: string, toToken: string, amount: string) => {
    setMessage(`Swap ${amount} ${fromToken} to ${toToken}`);
  };

  const handleQuickAction = (command: string) => {
    setMessage(command);
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Header */}
      <header className="bg-gray-800 border-b border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <h1 className="text-xl font-bold text-white">AgentKit Pro</h1>
              </div>
              <nav className="ml-10 flex space-x-8">
                <button
                  onClick={() => setActiveTab("portfolio")}
                  className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    activeTab === "portfolio" 
                      ? "bg-blue-600 text-white" 
                      : "text-gray-300 hover:text-white hover:bg-gray-700"
                  }`}
                >
                  Portfolio
                </button>
                <button
                  onClick={() => setActiveTab("trading")}
                  className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    activeTab === "trading" 
                      ? "bg-blue-600 text-white" 
                      : "text-gray-300 hover:text-white hover:bg-gray-700"
                  }`}
                >
                  Trading
                </button>
                <button
                  onClick={() => setActiveTab("assistant")}
                  className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    activeTab === "assistant" 
                      ? "bg-blue-600 text-white" 
                      : "text-gray-300 hover:text-white hover:bg-gray-700"
                  }`}
                >
                  AI Assistant
                </button>
              </nav>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-sm text-gray-300">
                Base Sepolia
              </div>
              <div className="w-3 h-3 bg-green-400 rounded-full"></div>
            </div>
          </div>
        </div>
      </header>

      <div className="flex">
        <div className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === "portfolio" && (
          <div className="space-y-6">
            {/* Portfolio Overview */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <PortfolioCard
                title="Total Balance"
                value={`${portfolioData?.totalBalance} ETH`}
                subtitle={portfolioData?.totalValue}
              />
              <PortfolioCard
                title="24h Change"
                value="+$104.33"
                change="+$104.33"
                changePercent="+1.28%"
                isPositive={true}
              />
              <PortfolioCard
                title="Active Assets"
                value={portfolioData?.assets.length?.toString() || "0"}
                subtitle="Tokens"
              />
            </div>

            {/* Assets Table */}
            <div className="bg-gray-800 rounded-lg border border-gray-700">
              <div className="px-6 py-4 border-b border-gray-700">
                <h3 className="text-lg font-semibold text-white">Assets</h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-700">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Asset</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Balance</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Value</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">24h Change</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-700">
                    {portfolioData?.assets.map((asset, index) => (
                      <AssetRow
                        key={index}
                        asset={asset}
                        onSend={handleAssetSend}
                        onSwap={handleAssetSwap}
                      />
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {activeTab === "trading" && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Trading Interface */}
            <div className="lg:col-span-2 space-y-6">
              <TradingInterface onExecuteSwap={handleExecuteSwap} />

              {/* Recent Transactions */}
              <div className="bg-gray-800 rounded-lg border border-gray-700">
                <div className="px-6 py-4 border-b border-gray-700">
                  <h3 className="text-lg font-semibold text-white">Recent Transactions</h3>
                </div>
                <div className="p-6">
                  <div className="space-y-4">
                    <div className="flex justify-between items-center py-3 border-b border-gray-700">
                      <div className="flex items-center">
                        <div className="w-8 h-8 bg-green-600 rounded-full flex items-center justify-center">
                          <span className="text-white text-sm">↗</span>
                        </div>
                        <div className="ml-3">
                          <p className="text-sm font-medium text-white">Token Swap</p>
                          <p className="text-xs text-gray-400">1 ETH → 2,847 USDC</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-white">2,847 USDC</p>
                        <p className="text-xs text-gray-400">2 min ago</p>
                      </div>
                    </div>
                    <div className="flex justify-between items-center py-3 border-b border-gray-700">
                      <div className="flex items-center">
                        <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                          <span className="text-white text-sm">↗</span>
                        </div>
                        <div className="ml-3">
                          <p className="text-sm font-medium text-white">Send</p>
                          <p className="text-xs text-gray-400">0.1 ETH to 0x742d...</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-white">0.1 ETH</p>
                        <p className="text-xs text-gray-400">1 hour ago</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="space-y-6">
              <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
                <h3 className="text-lg font-semibold text-white mb-4">Quick Actions</h3>
                <div className="space-y-3">
                  {quickActions.map((action, index) => (
                    <button
                      key={index}
                      onClick={() => setMessage(action.command)}
                      className="w-full flex items-center p-3 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors"
                    >
                      <span className="text-xl mr-3">{action.icon}</span>
                      <span className="text-white">{action.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Market Stats */}
              <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
                <h3 className="text-lg font-semibold text-white mb-4">Market Stats</h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-400">ETH Price</span>
                    <span className="text-white">$2,897.45</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">24h Volume</span>
                    <span className="text-white">$12.4B</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Market Cap</span>
                    <span className="text-white">$348.2B</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === "assistant" && (
          <div className="max-w-4xl mx-auto">
            <div className="bg-gray-800 rounded-lg border border-gray-700">
              <div className="px-6 py-4 border-b border-gray-700">
                <h3 className="text-lg font-semibold text-white">AI Trading Assistant</h3>
                <p className="text-sm text-gray-400">Powered by advanced AI for blockchain operations</p>
              </div>
              
              <div className="p-6">
                <form onSubmit={handleSubmit} className="mb-6">
                  <div className="flex gap-4">
                    <input
                      type="text"
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      placeholder="Ask me to check your wallet balance, send tokens, or interact with smart contracts..."
                      className="flex-1 bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      disabled={loading}
                    />
                    <button
                      type="submit"
                      disabled={loading || !message.trim()}
                      className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      {loading ? "Processing..." : "Send"}
                    </button>
                  </div>
                </form>

                {response && (
                  <div className="bg-gray-700 rounded-lg p-6">
                    <h4 className="text-lg font-semibold text-white mb-3">Assistant Response:</h4>
                    <div className="prose max-w-none">
                      <pre className="whitespace-pre-wrap text-gray-300 font-mono text-sm">
                        {response}
                      </pre>
                    </div>
                  </div>
                )}

                <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-gray-700 p-4 rounded-lg">
                    <h4 className="font-semibold text-white mb-2">💳 Wallet Operations</h4>
                    <p className="text-gray-300 text-sm">
                      Check balances, send tokens, and manage your crypto wallet
                    </p>
                  </div>
                  <div className="bg-gray-700 p-4 rounded-lg">
                    <h4 className="font-semibold text-white mb-2">🔄 Token Swaps</h4>
                    <p className="text-gray-300 text-sm">
                      Execute token swaps and DeFi operations
                    </p>
                  </div>
                  <div className="bg-gray-700 p-4 rounded-lg">
                    <h4 className="font-semibold text-white mb-2">🔗 Smart Contracts</h4>
                    <p className="text-gray-300 text-sm">
                      Interact with DeFi protocols and smart contracts
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
        </div>
        <Sidebar onQuickAction={handleQuickAction} />
      </div>
    </div>
  );
}

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

interface BusinessAction {
  id: string;
  title: string;
  description: string;
  icon: string;
  color: string;
  action: () => void;
}

export default function Home() {
  const [activeTab, setActiveTab] = useState("home");
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

  // Business actions with Apple-like design
  const businessActions: BusinessAction[] = [
    {
      id: "payroll",
      title: "Set-and-Forget Payroll",
      description: "Automate monthly salary payments across all rails",
      icon: "👥",
      color: "from-blue-500 to-blue-600",
      action: () => setMessage("Set up automated payroll for all 25 employees with multi-rail optimization. Auto-pay salaries on the 1st of each month using the most cost-effective rail (ACH for domestic, USDC for international).")
    },
    {
      id: "vendors",
      title: "Smart Vendor Payments",
      description: "AI-optimized invoice processing and payment routing",
      icon: "🏢",
      color: "from-green-500 to-green-600",
      action: () => setMessage("Process all pending vendor invoices with AI-powered matching and optimal payment routing. Auto-pay invoices under $1,000, flag larger amounts for approval.")
    },
    {
      id: "expenses",
      title: "Intelligent Expense Management",
      description: "Custom approval workflows with AI decision making",
      icon: "✈️",
      color: "from-purple-500 to-purple-600",
      action: () => setMessage("Create custom expense approval workflow: auto-approve travel expenses under $500, marketing spend under $1,000, flag everything else for manager review.")
    },
    {
      id: "approvals",
      title: "Multi-Rail Approvals",
      description: "Unified approval system across all payment methods",
      icon: "🔐",
      color: "from-orange-500 to-orange-600",
      action: () => setMessage("Set up unified multi-sig approval for payments over $10,000 across all rails. Require 2-of-3 signatures for large transactions.")
    },
    {
      id: "analytics",
      title: "Predictive Analytics",
      description: "AI-powered cash flow insights and optimization",
      icon: "📊",
      color: "from-indigo-500 to-indigo-600",
      action: () => setMessage("Show predictive cash flow analysis for next 90 days. Identify optimal payment timings for early payment discounts and potential cash crunches.")
    },
    {
      id: "compliance",
      title: "Compliance & Audit",
      description: "Built-in logging and anomaly detection",
      icon: "🔍",
      color: "from-red-500 to-pink-600",
      action: () => setMessage("Generate comprehensive audit report for Q4. Show all transactions, approval chains, and flag any anomalies for compliance review.")
    },
    {
      id: "ai-chat",
      title: "AI Command Center",
      description: "Natural language control for all financial operations",
      icon: "🤖",
      color: "from-pink-500 to-purple-600",
      action: () => setActiveTab("ai")
    }
  ];

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


  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900">
      {/* Header */}
      <header className="backdrop-blur-xl bg-black/20 border-b border-white/10">
        <div className="max-w-6xl mx-auto px-6">
          <div className="flex justify-between items-center h-20">
            <div className="flex items-center space-x-8">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-sm">A</span>
                </div>
                <h1 className="text-2xl font-light text-white">AgentKit</h1>
              </div>
              <nav className="hidden md:flex space-x-8">
                <button
                  onClick={() => setActiveTab("home")}
                  className={`text-sm font-medium transition-all duration-200 ${
                    activeTab === "home" 
                      ? "text-white" 
                      : "text-gray-400 hover:text-white"
                  }`}
                >
                  Home
                </button>
                <button
                  onClick={() => setActiveTab("ai")}
                  className={`text-sm font-medium transition-all duration-200 ${
                    activeTab === "ai" 
                      ? "text-white" 
                      : "text-gray-400 hover:text-white"
                  }`}
                >
                  AI Assistant
                </button>
                <button
                  onClick={() => setActiveTab("ai-dashboard")}
                  className={`text-sm font-medium transition-all duration-200 ${
                    activeTab === "ai-dashboard" 
                      ? "text-white" 
                      : "text-gray-400 hover:text-white"
                  }`}
                >
                  Dashboard
                </button>
              </nav>
            </div>
            
            <WalletConnection />
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-6 py-12">
        {activeTab === "home" && (
          <div className="space-y-12">
            {/* Hero Section */}
            <div className="text-center space-y-6">
              <h1 className="text-5xl font-light text-white leading-tight">
                Business Payments,<br />
                <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                  Simplified
                </span>
              </h1>
              <p className="text-xl text-gray-300 max-w-2xl mx-auto leading-relaxed">
                Let AI handle your payroll, vendor payments, and expense management. 
                Focus on growing your business, not managing transactions.
              </p>
            </div>

            {/* Value Propositions */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Reduce Manual Finance Labor */}
              <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-8">
                <div className="flex items-center space-x-4 mb-4">
                  <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-emerald-600 rounded-xl flex items-center justify-center">
                    <span className="text-white text-xl">⚡</span>
                  </div>
                  <h3 className="text-xl font-medium text-white">Reduce Manual Finance Labor</h3>
                </div>
                <p className="text-gray-300 leading-relaxed mb-4">
                  Fewer repetitive tasks for finance teams: invoice matching, scheduling, 
                  approvals, and reconciliations.
                </p>
                <div className="space-y-2">
                  <div className="flex items-center space-x-2 text-sm text-gray-400">
                    <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                    <span>Automated invoice matching & reconciliation</span>
                  </div>
                  <div className="flex items-center space-x-2 text-sm text-gray-400">
                    <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                    <span>Smart scheduling & approval workflows</span>
                  </div>
                  <div className="flex items-center space-x-2 text-sm text-gray-400">
                    <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                    <span>24/7 operations - agent never sleeps</span>
                  </div>
                </div>
              </div>

              {/* Advanced Workflow Automation */}
              <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-8">
                <div className="flex items-center space-x-4 mb-4">
                  <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-600 rounded-xl flex items-center justify-center">
                    <span className="text-white text-xl">🔧</span>
                  </div>
                  <h3 className="text-xl font-medium text-white">Advanced Workflow Automation</h3>
                </div>
                <p className="text-gray-300 leading-relaxed mb-4">
                  Multi-platform orchestration across ACH, wire, card, and banking APIs. 
                  Programmable approvals: &ldquo;Auto-pay marketing spend &lt; $1k, flag anything else for review.&rdquo;
                </p>
                <div className="space-y-2">
                  <div className="flex items-center space-x-2 text-sm text-gray-400">
                    <span className="w-2 h-2 bg-purple-500 rounded-full"></span>
                    <span>Multi-platform orchestration</span>
                  </div>
                  <div className="flex items-center space-x-2 text-sm text-gray-400">
                    <span className="w-2 h-2 bg-purple-500 rounded-full"></span>
                    <span>Programmable business logic</span>
                  </div>
                  <div className="flex items-center space-x-2 text-sm text-gray-400">
                    <span className="w-2 h-2 bg-purple-500 rounded-full"></span>
                    <span>Smart approval thresholds</span>
                  </div>
                </div>
              </div>

              {/* Smarter Financial Decision-Making */}
              <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-8">
                <div className="flex items-center space-x-4 mb-4">
                  <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-cyan-600 rounded-xl flex items-center justify-center">
                    <span className="text-white text-xl">🧠</span>
                  </div>
                  <h3 className="text-xl font-medium text-white">Smarter Financial Decision-Making</h3>
                </div>
                <p className="text-gray-300 leading-relaxed mb-4">
                  AI-powered cash flow forecasting, optimal payment timings for discounts, 
                  tax optimization, and dynamic rail/FX optimization.
                </p>
                <div className="space-y-2">
                  <div className="flex items-center space-x-2 text-sm text-gray-400">
                    <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                    <span>Predictive cash flow insights</span>
                  </div>
                  <div className="flex items-center space-x-2 text-sm text-gray-400">
                    <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                    <span>Dynamic rail & FX optimization</span>
                  </div>
                  <div className="flex items-center space-x-2 text-sm text-gray-400">
                    <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                    <span>Tax optimization & spend analysis</span>
                  </div>
                </div>
              </div>

              {/* Enhanced Security & Compliance */}
              <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-8">
                <div className="flex items-center space-x-4 mb-4">
                  <div className="w-12 h-12 bg-gradient-to-r from-orange-500 to-red-600 rounded-xl flex items-center justify-center">
                    <span className="text-white text-xl">🔒</span>
                  </div>
                  <h3 className="text-xl font-medium text-white">Enhanced Security & Compliance</h3>
                </div>
                <p className="text-gray-300 leading-relaxed mb-4">
                  Auditable, transparent payments with built-in logging, approval enforcement, 
                  and anomaly detection. SOC 2, GDPR, and public company ready.
                </p>
                <div className="space-y-2">
                  <div className="flex items-center space-x-2 text-sm text-gray-400">
                    <span className="w-2 h-2 bg-orange-500 rounded-full"></span>
                    <span>Built-in audit trails & logging</span>
                  </div>
                  <div className="flex items-center space-x-2 text-sm text-gray-400">
                    <span className="w-2 h-2 bg-orange-500 rounded-full"></span>
                    <span>Anomaly detection & fraud prevention</span>
                  </div>
                  <div className="flex items-center space-x-2 text-sm text-gray-400">
                    <span className="w-2 h-2 bg-orange-500 rounded-full"></span>
                    <span>SOC 2, GDPR, public company compliance</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Competitive Differentiator & Scalability */}
            <div className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 backdrop-blur-xl border border-white/10 rounded-2xl p-8">
              <div className="text-center mb-8">
                <h2 className="text-3xl font-light text-white mb-4">Future-Ready & Scalable</h2>
                <p className="text-gray-300 text-lg max-w-3xl mx-auto">
                  As more suppliers accept digital assets and international business expands, 
                  you&apos;re already equipped for instant global reach.
                </p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="text-center">
                  <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-emerald-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <span className="text-white text-2xl">🌍</span>
                  </div>
                  <h3 className="text-xl font-medium text-white mb-3">Future Readiness</h3>
                  <ul className="text-sm text-gray-400 space-y-2">
                    <li>• Instant global reach with fiat or crypto</li>
                    <li>• Ready for digital asset adoption</li>
                    <li>• International business expansion ready</li>
                    <li>• Multi-currency, multi-rail support</li>
                  </ul>
                </div>
                <div className="text-center">
                  <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <span className="text-white text-2xl">🏢</span>
                  </div>
                  <h3 className="text-xl font-medium text-white mb-3">White-Label & Ecosystem</h3>
                  <ul className="text-sm text-gray-400 space-y-2">
                    <li>• Offer AI automation as a service</li>
                    <li>• Integrate with existing business tools</li>
                    <li>• Partner and client-ready platform</li>
                    <li>• Scalable enterprise architecture</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Business Actions Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {businessActions.map((action) => (
                <button
                  key={action.id}
                  onClick={action.action}
                  className="group relative overflow-hidden bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-8 hover:bg-white/10 transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-blue-500/20"
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  <div className="relative z-10">
                    <div className="text-4xl mb-4 group-hover:scale-110 transition-transform duration-300">
                      {action.icon}
                    </div>
                    <h3 className="text-xl font-medium text-white mb-2 group-hover:text-blue-300 transition-colors">
                      {action.title}
                    </h3>
                    <p className="text-gray-400 text-sm leading-relaxed group-hover:text-gray-300 transition-colors">
                      {action.description}
                    </p>
                  </div>
                </button>
              ))}
            </div>

            {/* Competitive Advantage */}
            <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-8">
              <h2 className="text-2xl font-light text-white mb-6 text-center">Why AgentKit Beats Mainstream Platforms</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="text-center">
                  <div className="w-16 h-16 bg-gradient-to-r from-red-500 to-pink-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <span className="text-white text-2xl">🚫</span>
                  </div>
                  <h3 className="text-lg font-medium text-white mb-2">Traditional Platforms</h3>
                  <ul className="text-sm text-gray-400 space-y-1">
                    <li>• Rigid, one-size-fits-all</li>
                    <li>• Manual processes</li>
                    <li>• Limited customization</li>
                    <li>• Basic reporting</li>
                    <li>• Single rail focus</li>
                  </ul>
                </div>
                <div className="text-center">
                  <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-emerald-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <span className="text-white text-2xl">✅</span>
                  </div>
                  <h3 className="text-lg font-medium text-white mb-2">AgentKit + AI</h3>
                  <ul className="text-sm text-gray-400 space-y-1">
                    <li>• Fully customizable workflows</li>
                    <li>• AI-powered automation</li>
                    <li>• Multi-rail optimization</li>
                    <li>• Predictive analytics</li>
                    <li>• Unified control center</li>
                  </ul>
                </div>
                <div className="text-center">
                  <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <span className="text-white text-2xl">📈</span>
                  </div>
                  <h3 className="text-lg font-medium text-white mb-2">The Result</h3>
                  <ul className="text-sm text-gray-400 space-y-1">
                    <li>• 90% less manual work</li>
                    <li>• 24/7 operations</li>
                    <li>• Custom business logic</li>
                    <li>• Real-time insights</li>
                    <li>• Future-proof architecture</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Portfolio Overview */}
            <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-8">
              <h2 className="text-2xl font-light text-white mb-6">Treasury Overview</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center">
                  <div className="text-3xl font-light text-white mb-1">{portfolioData?.totalValue}</div>
                  <div className="text-sm text-gray-400">Total Treasury</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-light text-green-400 mb-1">+$127.45</div>
                  <div className="text-sm text-gray-400">24h Change</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-light text-white mb-1">{portfolioData?.assets.length}</div>
                  <div className="text-sm text-gray-400">Active Assets</div>
                </div>
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
            <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-8">
              <div className="text-center mb-8">
                <h2 className="text-3xl font-light text-white mb-2">AI Financial Assistant</h2>
                <p className="text-gray-400 mb-4">Ask me to handle your business payments, payroll, or any financial task</p>
                <div className="flex flex-wrap justify-center gap-2">
                  <span className="px-3 py-1 bg-blue-500/20 text-blue-300 text-xs rounded-full border border-blue-500/30">Multi-rail optimization</span>
                  <span className="px-3 py-1 bg-purple-500/20 text-purple-300 text-xs rounded-full border border-purple-500/30">Custom workflows</span>
                  <span className="px-3 py-1 bg-green-500/20 text-green-300 text-xs rounded-full border border-green-500/30">24/7 automation</span>
                  <span className="px-3 py-1 bg-orange-500/20 text-orange-300 text-xs rounded-full border border-orange-500/30">Predictive analytics</span>
                </div>
              </div>
              
              {/* Chat Interface */}
              <div className="h-96 overflow-y-auto bg-black/20 backdrop-blur-xl border border-white/10 rounded-xl p-6 mb-6">
                <div className="space-y-4">
                  {response && (
                    <div className="flex justify-start">
                      <div className="bg-white/10 backdrop-blur-xl text-white p-4 rounded-xl max-w-2xl whitespace-pre-wrap border border-white/10">
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
                  placeholder="Try: 'Pay all employees their monthly salary' or 'Approve all travel expenses under $500'"
                  className="flex-1 p-4 rounded-xl bg-white/5 backdrop-blur-xl text-white border border-white/10 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all duration-200"
                  disabled={loading}
                />
                <button
                  type="submit"
                  className="px-8 py-4 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl font-medium hover:from-blue-600 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-blue-500/50 disabled:opacity-50 transition-all duration-200 hover:scale-105"
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
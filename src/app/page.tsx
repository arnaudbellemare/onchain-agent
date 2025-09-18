"use client";

import { useState, useEffect } from "react";
import WalletConnection from "@/components/WalletConnection";
import TransactionModal from "@/components/TransactionModal";
import Notification from "@/components/Notification";
import AIDashboard from "@/components/AIDashboard";
import EmployeeManagement from "@/components/EmployeeManagement";

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
  const [modalType] = useState<"send" | "swap" | "request">("send");
  const [selectedAsset] = useState<{ symbol: string; name: string; balance: string; value: string; change24h: string; change24hPercent: string } | null>(null);
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
      id: "x402-api",
      title: "x402 API Payments",
      description: "Autonomous AI payments for API access and services",
      icon: "🔗",
      color: "from-cyan-500 to-blue-600",
      action: () => setMessage("Set up x402 protocol for autonomous API payments. Configure AI agents to pay $0.001 per API call using USDC on Base network.")
    },
    {
      id: "micropayments",
      title: "Micropayment Services",
      description: "Pay-per-query and autonomous resource purchasing",
      icon: "💎",
      color: "from-emerald-500 to-teal-600",
      action: () => setMessage("Enable micropayment services for AI agents. Set up pay-per-query data access, autonomous tool purchasing, and machine-to-machine commerce.")
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
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Header */}
      <header className="backdrop-blur-xl bg-black/20 border-b border-white/10">
        <div className="max-w-7xl mx-auto px-8">
          <div className="flex justify-between items-center h-24">
            <div className="flex items-center space-x-8">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
                  <span className="text-white font-bold text-xl">AI</span>
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-white tracking-tight">Onchain Agent</h1>
                  <p className="text-gray-300 font-medium">AI-Powered Business Payments</p>
                </div>
              </div>
              <nav className="hidden lg:flex space-x-2">
                <button
                  onClick={() => setActiveTab("home")}
                  className={`text-base font-semibold transition-all duration-200 px-6 py-3 rounded-xl ${
                    activeTab === "home" 
                      ? "text-white bg-white/10 shadow-lg" 
                      : "text-gray-300 hover:text-white hover:bg-white/5"
                  }`}
                >
                  Start Building
                </button>
                <button
                  onClick={() => setActiveTab("ai")}
                  className={`text-base font-semibold transition-all duration-200 px-6 py-3 rounded-xl ${
                    activeTab === "ai" 
                      ? "text-white bg-white/10 shadow-lg" 
                      : "text-gray-300 hover:text-white hover:bg-white/5"
                  }`}
                >
                  AI Assistant
                </button>
                <button
                  onClick={() => setActiveTab("ai-dashboard")}
                  className={`text-base font-semibold transition-all duration-200 px-6 py-3 rounded-xl ${
                    activeTab === "ai-dashboard" 
                      ? "text-white bg-white/10 shadow-lg" 
                      : "text-gray-300 hover:text-white hover:bg-white/5"
                  }`}
                >
                  Dashboard
                </button>
                <button
                  onClick={() => setActiveTab("employees")}
                  className={`text-base font-semibold transition-all duration-200 px-6 py-3 rounded-xl ${
                    activeTab === "employees" 
                      ? "text-white bg-white/10 shadow-lg" 
                      : "text-gray-300 hover:text-white hover:bg-white/5"
                  }`}
                >
                  Employees
                </button>
              </nav>
            </div>
            
            <WalletConnection />
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-8 py-16">
        {activeTab === "home" && (
          <div className="space-y-20">
            {/* Hero Section */}
            <div className="text-center space-y-8">
              <div className="space-y-6">
                <h1 className="text-6xl md:text-7xl font-bold text-white leading-tight tracking-tight">
                  Business Payments
                  <span className="block bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                    Reimagined
                  </span>
                </h1>
                <p className="text-xl text-gray-300 max-w-3xl mx-auto leading-relaxed font-medium">
                  Transform your business operations with AI-powered payroll, vendor payments, and expense management. 
                  Built for the future of autonomous commerce.
                </p>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-6 justify-center items-center pt-8">
                <button
                  onClick={() => setActiveTab("employees")}
                  className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white px-8 py-4 rounded-2xl font-bold text-lg transition-all duration-200 hover:scale-105 shadow-xl"
                >
                  Start Building
                </button>
                <button
                  onClick={() => setActiveTab("ai")}
                  className="bg-white/10 hover:bg-white/20 backdrop-blur-xl text-white px-8 py-4 rounded-2xl font-bold text-lg transition-all duration-200 border border-white/20"
                >
                  Explore AI
                </button>
              </div>
            </div>

            {/* Value Propositions */}
            <div className="space-y-16">
              <div className="text-center space-y-4">
                <h2 className="text-4xl font-bold text-white">Why Choose Onchain Agent</h2>
                <p className="text-xl text-gray-300 max-w-2xl mx-auto">
                  Built for modern businesses that demand efficiency, security, and innovation
                </p>
              </div>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Reduce Manual Finance Labor */}
                <div className="group bg-gradient-to-br from-green-500/10 to-emerald-600/10 backdrop-blur-xl border border-green-500/20 rounded-3xl p-10 hover:border-green-400/40 transition-all duration-300 hover:scale-105">
                  <div className="space-y-6">
                    <div className="flex items-center space-x-4">
                      <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-emerald-600 rounded-2xl flex items-center justify-center shadow-lg">
                        <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center">
                          <div className="w-4 h-4 bg-green-500 rounded-full animate-pulse"></div>
                        </div>
                      </div>
                      <h3 className="text-2xl font-bold text-white">Reduce Manual Finance Labor</h3>
                    </div>
                    <p className="text-gray-300 text-lg leading-relaxed">
                      Eliminate repetitive tasks for finance teams with intelligent automation for 
                      invoice matching, scheduling, approvals, and reconciliations.
                    </p>
                    <div className="space-y-3">
                      <div className="flex items-center space-x-3 text-gray-300">
                        <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                        <span className="font-medium">Automated invoice processing</span>
                      </div>
                      <div className="flex items-center space-x-3 text-gray-300">
                        <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                        <span className="font-medium">Smart payment scheduling</span>
                      </div>
                      <div className="flex items-center space-x-3 text-gray-300">
                        <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                        <span className="font-medium">24/7 autonomous operations</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Advanced Workflow Automation */}
                <div className="group bg-gradient-to-br from-purple-500/10 to-pink-600/10 backdrop-blur-xl border border-purple-500/20 rounded-3xl p-10 hover:border-purple-400/40 transition-all duration-300 hover:scale-105">
                  <div className="space-y-6">
                    <div className="flex items-center space-x-4">
                      <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-600 rounded-2xl flex items-center justify-center shadow-lg">
                        <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center">
                          <div className="w-4 h-4 bg-purple-500 rounded-full animate-spin"></div>
                        </div>
                      </div>
                      <h3 className="text-2xl font-bold text-white">Advanced Workflow Automation</h3>
                    </div>
                    <p className="text-gray-300 text-lg leading-relaxed">
                      Multi-platform orchestration across ACH, wire, card, and banking APIs with 
                      programmable approvals and custom business logic.
                    </p>
                    <div className="space-y-3">
                      <div className="flex items-center space-x-3 text-gray-300">
                        <div className="w-2 h-2 bg-purple-400 rounded-full"></div>
                        <span className="font-medium">Multi-platform orchestration</span>
                      </div>
                      <div className="flex items-center space-x-3 text-gray-300">
                        <div className="w-2 h-2 bg-purple-400 rounded-full"></div>
                        <span className="font-medium">Programmable business logic</span>
                      </div>
                      <div className="flex items-center space-x-3 text-gray-300">
                        <div className="w-2 h-2 bg-purple-400 rounded-full"></div>
                        <span className="font-medium">Smart approval thresholds</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Smarter Financial Decision-Making */}
                <div className="group bg-gradient-to-br from-blue-500/10 to-cyan-600/10 backdrop-blur-xl border border-blue-500/20 rounded-3xl p-10 hover:border-blue-400/40 transition-all duration-300 hover:scale-105">
                  <div className="space-y-6">
                    <div className="flex items-center space-x-4">
                      <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-cyan-600 rounded-2xl flex items-center justify-center shadow-lg">
                        <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center">
                          <div className="w-4 h-4 bg-blue-500 rounded-full animate-bounce"></div>
                        </div>
                      </div>
                      <h3 className="text-2xl font-bold text-white">Smarter Financial Decision-Making</h3>
                    </div>
                    <p className="text-gray-300 text-lg leading-relaxed">
                      AI-powered cash flow forecasting, optimal payment timings for discounts, 
                      tax optimization, and dynamic rail/FX optimization.
                    </p>
                    <div className="space-y-3">
                      <div className="flex items-center space-x-3 text-gray-300">
                        <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                        <span className="font-medium">Predictive cash flow insights</span>
                      </div>
                      <div className="flex items-center space-x-3 text-gray-300">
                        <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                        <span className="font-medium">Dynamic rail & FX optimization</span>
                      </div>
                      <div className="flex items-center space-x-3 text-gray-300">
                        <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                        <span className="font-medium">Tax optimization & spend analysis</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Enhanced Security & Compliance */}
                <div className="group bg-gradient-to-br from-orange-500/10 to-red-600/10 backdrop-blur-xl border border-orange-500/20 rounded-3xl p-10 hover:border-orange-400/40 transition-all duration-300 hover:scale-105">
                  <div className="space-y-6">
                    <div className="flex items-center space-x-4">
                      <div className="w-16 h-16 bg-gradient-to-r from-orange-500 to-red-600 rounded-2xl flex items-center justify-center shadow-lg">
                        <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center">
                          <div className="w-4 h-4 bg-orange-500 rounded-full animate-pulse"></div>
                        </div>
                      </div>
                      <h3 className="text-2xl font-bold text-white">Enhanced Security & Compliance</h3>
                    </div>
                    <p className="text-gray-300 text-lg leading-relaxed">
                      Auditable, transparent payments with built-in logging, approval enforcement, 
                      and anomaly detection. SOC 2, GDPR, and public company ready.
                    </p>
                    <div className="space-y-3">
                      <div className="flex items-center space-x-3 text-gray-300">
                        <div className="w-2 h-2 bg-orange-400 rounded-full"></div>
                        <span className="font-medium">Built-in audit trails & logging</span>
                      </div>
                      <div className="flex items-center space-x-3 text-gray-300">
                        <div className="w-2 h-2 bg-orange-400 rounded-full"></div>
                        <span className="font-medium">Anomaly detection & fraud prevention</span>
                      </div>
                      <div className="flex items-center space-x-3 text-gray-300">
                        <div className="w-2 h-2 bg-orange-400 rounded-full"></div>
                        <span className="font-medium">SOC 2, GDPR, public company compliance</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* x402 Autonomous AI Commerce */}
            <div className="space-y-16">
              <div className="text-center space-y-4">
                <h2 className="text-4xl font-bold text-white">x402 Autonomous AI Commerce</h2>
                <p className="text-xl text-gray-300 max-w-3xl mx-auto">
                  Powered by x402 protocol - enabling AI agents to autonomously pay for API access, 
                  digital services, and content using instant USDC payments over HTTP.
                </p>
              </div>
              
              <div className="bg-gradient-to-br from-cyan-500/10 to-blue-500/10 backdrop-blur-xl border border-cyan-500/20 rounded-3xl p-12">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="text-center">
                  <div className="w-16 h-16 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <span className="text-white text-2xl">🤖</span>
                  </div>
                  <h3 className="text-xl font-medium text-white mb-3">Machine-to-Machine Payments</h3>
                  <ul className="text-sm text-gray-400 space-y-2">
                    <li>• AI agents pay for API access autonomously</li>
                    <li>• No accounts, sessions, or manual auth</li>
                    <li>• HTTP 402 &ldquo;Payment Required&rdquo; protocol</li>
                    <li>• Instant USDC payments on Base network</li>
                  </ul>
                </div>
                <div className="text-center">
                  <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-emerald-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <span className="text-white text-2xl">⚡</span>
                  </div>
                  <h3 className="text-xl font-medium text-white mb-3">Micropayments & Pay-Per-Use</h3>
                  <ul className="text-sm text-gray-400 space-y-2">
                    <li>• $0.001 per API call micropayments</li>
                    <li>• Pay-per-query data services</li>
                    <li>• Autonomous resource purchasing</li>
                    <li>• Frictionless web payments</li>
                  </ul>
                </div>
                <div className="text-center">
                  <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <span className="text-white text-2xl">🌐</span>
                  </div>
                  <h3 className="text-xl font-medium text-white mb-3">Robot-Native Commerce</h3>
                  <ul className="text-sm text-gray-400 space-y-2">
                    <li>• Universal standard for AI transactions</li>
                    <li>• Open protocol, not Coinbase-locked</li>
                    <li>• Chain-agnostic and extensible</li>
                    <li>• Next-gen autonomous business models</li>
                  </ul>
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
            <div className="space-y-16">
              <div className="text-center space-y-4">
                <h2 className="text-4xl font-bold text-white">Start Building Today</h2>
                <p className="text-xl text-gray-300 max-w-2xl mx-auto">
                  Choose your business automation path and begin transforming your operations
                </p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {businessActions.map((action) => (
                  <button
                    key={action.id}
                    onClick={action.action}
                    className="group bg-gradient-to-br from-white/5 to-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-8 text-left transition-all duration-300 hover:scale-105 hover:border-white/40 hover:shadow-2xl"
                  >
                    <div className="space-y-6">
                      <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all duration-300">
                        <span className="text-white text-2xl">{action.icon}</span>
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-white mb-3 group-hover:text-blue-400 transition-colors">{action.title}</h3>
                        <p className="text-gray-300 leading-relaxed">{action.description}</p>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Competitive Advantage */}
            <div className="space-y-16">
              <div className="text-center space-y-4">
                <h2 className="text-4xl font-bold text-white">Why AgentKit Beats Mainstream Platforms</h2>
                <p className="text-xl text-gray-300 max-w-2xl mx-auto">
                  Built for the future of autonomous business operations
                </p>
              </div>
              
              <div className="bg-gradient-to-br from-white/5 to-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-12">
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
                  </div>

            {/* Portfolio Overview */}
            <div className="space-y-16">
              <div className="text-center space-y-4">
                <h2 className="text-4xl font-bold text-white">Treasury Overview</h2>
                <p className="text-xl text-gray-300 max-w-2xl mx-auto">
                  Real-time view of your business treasury and payment capabilities
                </p>
              </div>
              
              <div className="bg-gradient-to-br from-white/5 to-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-12">
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
          <div className="max-w-5xl mx-auto">
            <div className="space-y-16">
              <div className="text-center space-y-4">
                <h2 className="text-4xl font-bold text-white">AI Financial Assistant</h2>
                <p className="text-xl text-gray-300 max-w-2xl mx-auto">
                  Ask me to handle your business payments, payroll, or any financial task
                </p>
              </div>
              
              <div className="bg-gradient-to-br from-white/5 to-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-12">
                <div className="flex flex-wrap justify-center gap-2">
                  <span className="px-3 py-1 bg-blue-500/20 text-blue-300 text-xs rounded-full border border-blue-500/30">Multi-rail optimization</span>
                  <span className="px-3 py-1 bg-purple-500/20 text-purple-300 text-xs rounded-full border border-purple-500/30">Custom workflows</span>
                  <span className="px-3 py-1 bg-green-500/20 text-green-300 text-xs rounded-full border border-green-500/30">24/7 automation</span>
                  <span className="px-3 py-1 bg-orange-500/20 text-orange-300 text-xs rounded-full border border-orange-500/30">Predictive analytics</span>
                  <span className="px-3 py-1 bg-cyan-500/20 text-cyan-300 text-xs rounded-full border border-cyan-500/30">x402 protocol</span>
                  <span className="px-3 py-1 bg-emerald-500/20 text-emerald-300 text-xs rounded-full border border-emerald-500/30">Micropayments</span>
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
                  placeholder="Try: &ldquo;Pay all employees their monthly salary&rdquo; or &ldquo;Approve all travel expenses under $500&rdquo;"
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
          </div>
        )}

        {activeTab === "ai-dashboard" && (
          <AIDashboard />
        )}

        {activeTab === "employees" && (
          <EmployeeManagement />
        )}

        {activeTab === "guide" && (
          <div className="max-w-6xl mx-auto space-y-20">
            {/* Getting Started */}
            <div className="space-y-16">
              <div className="text-center space-y-4">
                <h2 className="text-4xl font-bold text-white">Getting Started</h2>
                <p className="text-xl text-gray-300 max-w-2xl mx-auto">
                  Follow these steps to begin transforming your business operations
                </p>
              </div>
              
              <div className="bg-gradient-to-br from-white/5 to-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-12">
              <div className="space-y-4">
                <div className="flex items-start space-x-4">
                  <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                    <span className="text-white text-sm font-bold">1</span>
                  </div>
                  <div>
                    <h3 className="text-lg font-medium text-white mb-2">Connect Your Wallet</h3>
                    <p className="text-gray-300">Click &ldquo;Connect Wallet&rdquo; and choose your preferred method: email, social login, or existing wallet (MetaMask, etc.)</p>
                  </div>
                </div>
                <div className="flex items-start space-x-4">
                  <div className="w-8 h-8 bg-gradient-to-r from-green-500 to-emerald-600 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                    <span className="text-white text-sm font-bold">2</span>
                  </div>
                  <div>
                    <h3 className="text-lg font-medium text-white mb-2">Try the AI Assistant</h3>
                    <p className="text-gray-300">Go to &ldquo;AI Assistant&rdquo; tab and start with simple commands like &ldquo;Check my balance&rdquo; or &ldquo;Show me my wallet details&rdquo;</p>
                  </div>
                </div>
                <div className="flex items-start space-x-4">
                  <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-600 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                    <span className="text-white text-sm font-bold">3</span>
                  </div>
                  <div>
                    <h3 className="text-lg font-medium text-white mb-2">Explore Business Features</h3>
                    <p className="text-gray-300">Try the business action cards on the home page or use the AI assistant for complex operations</p>
                  </div>
                </div>
              </div>
              </div>
            </div>

            {/* AI Commands */}
            <div className="space-y-16">
              <div className="text-center space-y-4">
                <h2 className="text-4xl font-bold text-white">AI Commands & Prompts</h2>
                <p className="text-xl text-gray-300 max-w-2xl mx-auto">
                  Master the AI assistant with these powerful commands
                </p>
              </div>
              
              <div className="bg-gradient-to-br from-white/5 to-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-12">
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Basic Commands */}
                <div>
                  <h3 className="text-xl font-medium text-white mb-4">Basic Commands</h3>
                  <div className="space-y-3">
                    <div className="bg-black/20 p-3 rounded-lg">
                      <code className="text-green-400 text-sm">&ldquo;Check my balance&rdquo;</code>
                      <p className="text-gray-400 text-xs mt-1">Get your wallet balance and details</p>
                    </div>
                    <div className="bg-black/20 p-3 rounded-lg">
                      <code className="text-green-400 text-sm">&ldquo;Show my wallet address&rdquo;</code>
                      <p className="text-gray-400 text-xs mt-1">Display your wallet address</p>
                    </div>
                    <div className="bg-black/20 p-3 rounded-lg">
                      <code className="text-green-400 text-sm">&ldquo;Send 0.1 ETH to 0x...&rdquo;</code>
                      <p className="text-gray-400 text-xs mt-1">Send tokens to an address</p>
                    </div>
                  </div>
                </div>

                {/* Business Commands */}
                <div>
                  <h3 className="text-xl font-medium text-white mb-4">Business Operations</h3>
                  <div className="space-y-3">
                    <div className="bg-black/20 p-3 rounded-lg">
                      <code className="text-blue-400 text-sm">&ldquo;Set up automated payroll&rdquo;</code>
                      <p className="text-gray-400 text-xs mt-1">Configure employee salary automation</p>
                    </div>
                    <div className="bg-black/20 p-3 rounded-lg">
                      <code className="text-blue-400 text-sm">&ldquo;Process vendor invoices&rdquo;</code>
                      <p className="text-gray-400 text-xs mt-1">AI-powered invoice processing</p>
                    </div>
                    <div className="bg-black/20 p-3 rounded-lg">
                      <code className="text-blue-400 text-sm">&ldquo;Show cash flow analysis&rdquo;</code>
                      <p className="text-gray-400 text-xs mt-1">Predictive financial insights</p>
                    </div>
                  </div>
                </div>
              </div>
              </div>
            </div>

            {/* Advanced Features */}
            <div className="space-y-16">
              <div className="text-center space-y-4">
                <h2 className="text-4xl font-bold text-white">Advanced Features</h2>
                <p className="text-xl text-gray-300 max-w-2xl mx-auto">
                  Unlock the full potential of autonomous business operations
                </p>
              </div>
              
              <div className="bg-gradient-to-br from-white/5 to-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-12">
              
              <div className="space-y-6">
                {/* x402 Protocol */}
                <div>
                  <h3 className="text-xl font-medium text-white mb-3">🔗 x402 Protocol (AI Commerce)</h3>
                  <div className="space-y-3">
                    <div className="bg-black/20 p-3 rounded-lg">
                      <code className="text-cyan-400 text-sm">&ldquo;Set up x402 protocol for API payments&rdquo;</code>
                      <p className="text-gray-400 text-xs mt-1">Enable autonomous AI payments for API access</p>
                    </div>
                    <div className="bg-black/20 p-3 rounded-lg">
                      <code className="text-cyan-400 text-sm">&ldquo;Enable micropayment services&rdquo;</code>
                      <p className="text-gray-400 text-xs mt-1">Pay-per-query and autonomous purchasing</p>
                    </div>
                  </div>
                </div>

                {/* Compliance & Security */}
                <div>
                  <h3 className="text-xl font-medium text-white mb-3">🔒 Compliance & Security</h3>
                  <div className="space-y-3">
                    <div className="bg-black/20 p-3 rounded-lg">
                      <code className="text-orange-400 text-sm">&ldquo;Generate compliance report&rdquo;</code>
                      <p className="text-gray-400 text-xs mt-1">SOC 2, GDPR, and audit reports</p>
                    </div>
                    <div className="bg-black/20 p-3 rounded-lg">
                      <code className="text-orange-400 text-sm">&ldquo;Set up multi-sig approval&rdquo;</code>
                      <p className="text-gray-400 text-xs mt-1">Multi-signature security for large payments</p>
                    </div>
                  </div>
                </div>
              </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="space-y-16">
              <div className="text-center space-y-4">
                <h2 className="text-4xl font-bold text-white">Quick Actions</h2>
                <p className="text-xl text-gray-300 max-w-2xl mx-auto">
                  Click these buttons on the home page for instant setup
                </p>
              </div>
              
              <div className="bg-gradient-to-br from-white/5 to-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-12">
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="bg-gradient-to-r from-blue-500/10 to-blue-600/10 p-4 rounded-lg border border-blue-500/20">
                  <div className="text-2xl mb-2">👥</div>
                  <h4 className="font-medium text-white mb-1">Set-and-Forget Payroll</h4>
                  <p className="text-gray-400 text-sm">Automate monthly salary payments</p>
                </div>
                <div className="bg-gradient-to-r from-green-500/10 to-green-600/10 p-4 rounded-lg border border-green-500/20">
                  <div className="text-2xl mb-2">🏢</div>
                  <h4 className="font-medium text-white mb-1">Smart Vendor Payments</h4>
                  <p className="text-gray-400 text-sm">AI-optimized invoice processing</p>
                </div>
                <div className="bg-gradient-to-r from-purple-500/10 to-purple-600/10 p-4 rounded-lg border border-purple-500/20">
                  <div className="text-2xl mb-2">✈️</div>
                  <h4 className="font-medium text-white mb-1">Expense Management</h4>
                  <p className="text-gray-400 text-sm">Custom approval workflows</p>
                </div>
                <div className="bg-gradient-to-r from-cyan-500/10 to-cyan-600/10 p-4 rounded-lg border border-cyan-500/20">
                  <div className="text-2xl mb-2">🔗</div>
                  <h4 className="font-medium text-white mb-1">x402 API Payments</h4>
                  <p className="text-gray-400 text-sm">Autonomous AI payments</p>
                </div>
                <div className="bg-gradient-to-r from-emerald-500/10 to-emerald-600/10 p-4 rounded-lg border border-emerald-500/20">
                  <div className="text-2xl mb-2">💎</div>
                  <h4 className="font-medium text-white mb-1">Micropayment Services</h4>
                  <p className="text-gray-400 text-sm">Pay-per-query services</p>
                </div>
                <div className="bg-gradient-to-r from-pink-500/10 to-pink-600/10 p-4 rounded-lg border border-pink-500/20">
                  <div className="text-2xl mb-2">🤖</div>
                  <h4 className="font-medium text-white mb-1">AI Command Center</h4>
                  <p className="text-gray-400 text-sm">Natural language control</p>
                </div>
              </div>
              </div>
            </div>

            {/* Support */}
            <div className="space-y-16">
              <div className="text-center space-y-4">
                <h2 className="text-4xl font-bold text-white">Need Help?</h2>
                <p className="text-xl text-gray-300 max-w-2xl mx-auto">
                  Start with simple commands and gradually explore advanced features. 
                  The AI assistant is designed to understand natural language - just describe what you want to do!
                </p>
              </div>
              
              <div className="bg-gradient-to-br from-blue-500/10 to-purple-500/10 backdrop-blur-xl border border-blue-500/20 rounded-3xl p-12 text-center">
              <div className="flex flex-wrap justify-center gap-4">
                <button
                  onClick={() => setActiveTab("ai")}
                  className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white px-6 py-3 rounded-xl font-medium transition-all duration-200 hover:scale-105"
                >
                  Try AI Assistant
                </button>
                <button
                  onClick={() => setActiveTab("home")}
                  className="bg-white/10 hover:bg-white/20 backdrop-blur-xl text-white px-6 py-3 rounded-xl font-medium transition-all duration-200 border border-white/10"
                >
                  Explore Features
                </button>
              </div>
              </div>
            </div>
          </div>
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
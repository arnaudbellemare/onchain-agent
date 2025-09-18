"use client";

import { useState } from "react";
import WalletConnection from "@/components/WalletConnection";
import WhatWeOffer from "@/components/WhatWeOffer";
import AIDashboard from "@/components/AIDashboard";
import AnimatedOptimizationBackground from "@/components/AnimatedOptimizationBackground";

export default function Home() {
  const [activeTab, setActiveTab] = useState("home");

  return (
    <div className="min-h-screen bg-gray-50 relative">
      {/* Animated Optimization Background */}
      <AnimatedOptimizationBackground />
      {/* Header */}
      <header className="bg-white/90 backdrop-blur-sm shadow-sm border-b border-gray-200 relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-gray-900">x402 + AgentKit</h1>
            </div>
            
            <div className="flex items-center space-x-4">
              <nav className="flex space-x-1">
                <button
                  onClick={() => setActiveTab("home")}
                  className={`text-sm font-medium transition-all duration-200 px-4 py-2 rounded-lg ${
                    activeTab === "home" 
                      ? "text-blue-600 bg-blue-50" 
                      : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                  }`}
                >
                  Home
                </button>
                <button
                  onClick={() => setActiveTab("what-we-offer")}
                  className={`text-sm font-medium transition-all duration-200 px-4 py-2 rounded-lg ${
                    activeTab === "what-we-offer" 
                      ? "text-blue-600 bg-blue-50" 
                      : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                  }`}
                >
                  What We Offer
                </button>
                <button
                  onClick={() => setActiveTab("how-it-works")}
                  className={`text-sm font-medium transition-all duration-200 px-4 py-2 rounded-lg ${
                    activeTab === "how-it-works" 
                      ? "text-blue-600 bg-blue-50" 
                      : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                  }`}
                >
                  How It Works
                </button>
              </nav>
              
              <WalletConnection />
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-8 relative z-10">
        {activeTab === "home" && (
          <div className="text-center space-y-12 relative">
            {/* Content background overlay */}
            <div className="absolute inset-0 bg-white/60 backdrop-blur-sm rounded-3xl -m-8"></div>
            <div className="relative z-10 space-y-12">
            <div className="space-y-6">
              <h1 className="text-5xl font-bold text-gray-900">
                Reduce Your Business Costs by 20-70%
              </h1>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                Using x402 protocol micropayments and AI automation, we help businesses save thousands of dollars on API costs, cloud infrastructure, and payment processing.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
              <div className="bg-white p-8 rounded-xl shadow-lg border border-gray-200">
                <div className="text-4xl mb-4">💳</div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Payment Integration</h3>
                <p className="text-gray-600 mb-4">20-30% cost reduction on Stripe/PayPal fees</p>
                <div className="text-2xl font-bold text-green-600">$7,200/year saved</div>
              </div>
              
              <div className="bg-white p-8 rounded-xl shadow-lg border border-gray-200">
                <div className="text-4xl mb-4">🤖</div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">AI API Optimization</h3>
                <p className="text-gray-600 mb-4">30-50% cost reduction on OpenAI/Anthropic</p>
                <div className="text-2xl font-bold text-green-600">$30,000/year saved</div>
              </div>
              
              <div className="bg-white p-8 rounded-xl shadow-lg border border-gray-200">
                <div className="text-4xl mb-4">🖥️</div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">GPU Cost Reduction</h3>
                <p className="text-gray-600 mb-4">40-60% cost reduction on AWS/GCP</p>
                <div className="text-2xl font-bold text-green-600">$57,600/year saved</div>
              </div>
            </div>

            <div className="space-y-6">
              <h2 className="text-3xl font-bold text-gray-900">How We Do This in Reality</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
                <div className="bg-blue-50 p-6 rounded-xl border border-blue-200">
                  <h3 className="text-xl font-bold text-gray-900 mb-4">x402 Protocol</h3>
                  <ul className="space-y-2 text-gray-900">
                    <li>• Replace subscriptions with pay-per-use micropayments</li>
                    <li>• Eliminate payment processing fees with direct USDC transfers</li>
                    <li>• AI automatically routes to cheapest providers</li>
                    <li>• Real-time cost optimization without manual intervention</li>
                  </ul>
                </div>
                
                <div className="bg-green-50 p-6 rounded-xl border border-green-200">
                  <h3 className="text-xl font-bold text-gray-900 mb-4">AgentKit Automation</h3>
                  <ul className="space-y-2 text-gray-900">
                    <li>• AI automatically scales resources based on demand</li>
                    <li>• Smart scheduling uses spot instances during low-cost periods</li>
                    <li>• Load balancing across multiple cloud providers</li>
                    <li>• Predictive analytics prevents cost spikes</li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-r from-blue-50 to-green-50 rounded-xl p-8 border border-blue-200">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Ready to Save Money?</h2>
              <p className="text-gray-900 mb-6">
                Contact us to implement cost optimization for your business
              </p>
              <div className="flex justify-center space-x-4">
                <a 
                  href="mailto:hello@your-domain.com" 
                  className="bg-blue-600 text-white px-8 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors"
                >
                  📧 Get Started
                </a>
                <a 
                  href="/contact" 
                  className="bg-green-600 text-white px-8 py-3 rounded-lg font-medium hover:bg-green-700 transition-colors"
                >
                  💬 Schedule Demo
                </a>
              </div>
            </div>
            </div>
          </div>
        )}

        {activeTab === "what-we-offer" && (
          <WhatWeOffer />
        )}

        {activeTab === "how-it-works" && (
          <AIDashboard />
        )}
      </main>
    </div>
  );
}

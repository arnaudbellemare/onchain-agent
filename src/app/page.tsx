"use client";

import { useState } from "react";
import WalletConnection from "@/components/WalletConnection";
import WhatWeOffer from "@/components/WhatWeOffer";
import HowItWorks from "@/components/HowItWorks";
import AnimatedOptimizationBackground from "@/components/AnimatedOptimizationBackground";
import HybridOptimizerDemo from "@/components/HybridOptimizerDemo";
import ComprehensiveOptimizerDemo from "@/components/ComprehensiveOptimizerDemo";
import CachingWarning from "@/components/CachingWarning";

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
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-green-600 rounded-lg flex items-center justify-center">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <h1 className="text-2xl font-light text-gray-900">x402 + AgentKit</h1>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <nav className="flex space-x-1">
                <button
                  onClick={() => setActiveTab("home")}
                  className={`text-sm font-medium transition-all duration-200 px-4 py-2 rounded-lg ${
                    activeTab === "home" 
                      ? "text-blue-600 bg-blue-50" 
                      : "text-gray-800 hover:text-gray-900 hover:bg-gray-50"
                  }`}
                >
                  Home
                </button>
                <button
                  onClick={() => setActiveTab("what-we-offer")}
                  className={`text-sm font-medium transition-all duration-200 px-4 py-2 rounded-lg ${
                    activeTab === "what-we-offer" 
                      ? "text-blue-600 bg-blue-50" 
                      : "text-gray-800 hover:text-gray-900 hover:bg-gray-50"
                  }`}
                >
                  What We Offer
                </button>
                <button
                  onClick={() => setActiveTab("how-it-works")}
                  className={`text-sm font-medium transition-all duration-200 px-4 py-2 rounded-lg ${
                    activeTab === "how-it-works" 
                      ? "text-blue-600 bg-blue-50" 
                      : "text-gray-800 hover:text-gray-900 hover:bg-gray-50"
                  }`}
                >
                  How It Works
                </button>
                <button
                  onClick={() => setActiveTab("hybrid")}
                  className={`text-sm font-medium transition-all duration-200 px-4 py-2 rounded-lg ${
                    activeTab === "hybrid" 
                      ? "text-blue-600 bg-blue-50" 
                      : "text-gray-800 hover:text-gray-900 hover:bg-gray-50"
                  }`}
                >
                  Hybrid Optimizer
                </button>
                <button
                  onClick={() => setActiveTab("comprehensive")}
                  className={`text-sm font-medium transition-all duration-200 px-4 py-2 rounded-lg ${
                    activeTab === "comprehensive" 
                      ? "text-blue-600 bg-blue-50" 
                      : "text-gray-800 hover:text-gray-900 hover:bg-gray-50"
                  }`}
                >
                  Comprehensive
                </button>
                <a
                  href="/api-docs"
                  className="text-sm font-medium transition-all duration-200 px-4 py-2 rounded-lg text-gray-800 hover:text-gray-900 hover:bg-gray-50"
                >
                  API Docs
                </a>
                <a
                  href="/developer"
                  className="text-sm font-medium transition-all duration-200 px-4 py-2 rounded-lg text-gray-800 hover:text-gray-900 hover:bg-gray-50"
                >
                  Developer
                </a>
              </nav>
              
              <WalletConnection />
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-8 relative z-10">
        {activeTab === "home" && (
          <div className="relative">
            <CachingWarning />
            {/* Hero Section */}
            <div className="text-center space-y-16 relative z-10">
              <div className="space-y-8">
                <div className="space-y-6">
                  <h1 className="text-6xl font-light text-gray-900 tracking-tight">
                    Reduce Business Costs by
                    <span className="block font-semibold bg-gradient-to-r from-blue-600 to-green-600 bg-clip-text text-transparent">
                      20-70%
                    </span>
                  </h1>
                  <p className="text-xl text-gray-800 max-w-4xl mx-auto leading-relaxed">
                    Advanced x402 protocol micropayments and AI automation deliver unprecedented cost savings across API infrastructure, cloud computing, and payment processing.
                  </p>
                </div>

                {/* Key Metrics */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
                  <div className="group">
                    <div className="bg-white/80 backdrop-blur-sm p-8 rounded-2xl shadow-sm border border-gray-100 hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
                      <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl mb-6 flex items-center justify-center">
                        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                        </svg>
                      </div>
                      <h3 className="text-xl font-semibold text-gray-900 mb-3">Payment Integration</h3>
                      <p className="text-gray-800 mb-4 leading-relaxed">Eliminate subscription overhead with intelligent micropayment routing</p>
                      <div className="text-3xl font-bold text-green-600">$7,200</div>
                      <div className="text-sm text-gray-700">annual savings</div>
                    </div>
                  </div>
                  
                  <div className="group">
                    <div className="bg-white/80 backdrop-blur-sm p-8 rounded-2xl shadow-sm border border-gray-100 hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
                      <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl mb-6 flex items-center justify-center">
                        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                        </svg>
                      </div>
                      <h3 className="text-xl font-semibold text-gray-900 mb-3">AI API Optimization</h3>
                      <p className="text-gray-800 mb-4 leading-relaxed">Dynamic provider switching and intelligent caching reduce API costs</p>
                      <div className="text-3xl font-bold text-green-600">$30,000</div>
                      <div className="text-sm text-gray-700">annual savings</div>
                    </div>
                  </div>
                  
                  <div className="group">
                    <div className="bg-white/80 backdrop-blur-sm p-8 rounded-2xl shadow-sm border border-gray-100 hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
                      <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-xl mb-6 flex items-center justify-center">
                        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" />
                        </svg>
                      </div>
                      <h3 className="text-xl font-semibold text-gray-900 mb-3">GPU Cost Reduction</h3>
                      <p className="text-gray-800 mb-4 leading-relaxed">Autonomous scaling and spot instance optimization</p>
                      <div className="text-3xl font-bold text-green-600">$57,600</div>
                      <div className="text-sm text-gray-700">annual savings</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Technology Stack */}
              <div className="space-y-8">
                <h2 className="text-3xl font-light text-gray-900">Advanced Technology Stack</h2>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-5xl mx-auto">
                  <div className="bg-gradient-to-br from-blue-50 to-blue-100/50 p-8 rounded-2xl border border-blue-200/50">
                    <div className="flex items-center mb-6">
                      <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center mr-4">
                        <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                        </svg>
                      </div>
                      <h3 className="text-xl font-semibold text-gray-900">x402 Protocol</h3>
                    </div>
                    <ul className="space-y-3 text-gray-800">
                      <li className="flex items-start">
                        <div className="w-1.5 h-1.5 bg-blue-600 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                        <span>Pay-per-use micropayments eliminate subscription overhead</span>
                      </li>
                      <li className="flex items-start">
                        <div className="w-1.5 h-1.5 bg-blue-600 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                        <span>Direct USDC transfers bypass traditional payment processing fees</span>
                      </li>
                      <li className="flex items-start">
                        <div className="w-1.5 h-1.5 bg-blue-600 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                        <span>Intelligent routing automatically selects optimal providers</span>
                      </li>
                      <li className="flex items-start">
                        <div className="w-1.5 h-1.5 bg-blue-600 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                        <span>Real-time optimization without manual intervention</span>
                      </li>
                    </ul>
                  </div>
                  
                  <div className="bg-gradient-to-br from-green-50 to-green-100/50 p-8 rounded-2xl border border-green-200/50">
                    <div className="flex items-center mb-6">
                      <div className="w-10 h-10 bg-green-600 rounded-lg flex items-center justify-center mr-4">
                        <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                        </svg>
                      </div>
                      <h3 className="text-xl font-semibold text-gray-900">AgentKit Automation</h3>
                    </div>
                    <ul className="space-y-3 text-gray-800">
                      <li className="flex items-start">
                        <div className="w-1.5 h-1.5 bg-green-600 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                        <span>Autonomous resource scaling based on real-time demand</span>
                      </li>
                      <li className="flex items-start">
                        <div className="w-1.5 h-1.5 bg-green-600 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                        <span>Smart scheduling leverages spot instances during low-cost periods</span>
                      </li>
                      <li className="flex items-start">
                        <div className="w-1.5 h-1.5 bg-green-600 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                        <span>Multi-cloud load balancing optimizes performance and costs</span>
                      </li>
                      <li className="flex items-start">
                        <div className="w-1.5 h-1.5 bg-green-600 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                        <span>Predictive analytics prevent cost spikes before they occur</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* CTA Section */}
              <div className="bg-gradient-to-r from-gray-900 to-gray-800 rounded-3xl p-12 text-white">
                <div className="max-w-3xl mx-auto text-center space-y-6">
                  <h2 className="text-3xl font-light">Ready to Transform Your Infrastructure?</h2>
                  <p className="text-xl text-gray-100 leading-relaxed">
                    Join forward-thinking businesses already saving thousands with intelligent cost optimization
                  </p>
                  <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
                    <a 
                      href="mailto:hello@your-domain.com" 
                      className="bg-white text-gray-900 px-8 py-4 rounded-xl font-medium hover:bg-gray-100 transition-all duration-300 hover:scale-105"
                    >
                      Get Started
                    </a>
                    <a 
                      href="/contact" 
                      className="border border-gray-600 text-white px-8 py-4 rounded-xl font-medium hover:bg-gray-700 transition-all duration-300 hover:scale-105"
                    >
                      Schedule Demo
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === "what-we-offer" && (
          <WhatWeOffer />
        )}

        {activeTab === "how-it-works" && (
          <HowItWorks />
        )}


        {activeTab === "hybrid" && (
          <HybridOptimizerDemo />
        )}

        {activeTab === "comprehensive" && (
          <ComprehensiveOptimizerDemo />
        )}
      </main>
    </div>
  );
}

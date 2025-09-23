#!/bin/bash

# AI Vibe Coding Platform Deployment Script
# Powered by OnChain Agent Cost Optimization

echo "🚀 Deploying AI Vibe Coding Platform with Cost Optimization..."

# Check if OnChain Agent is running
echo "📡 Checking OnChain Agent connection..."
if curl -s http://localhost:3000/api/v1/optimize > /dev/null; then
    echo "✅ OnChain Agent is running"
else
    echo "❌ OnChain Agent is not running. Please start it first:"
    echo "   cd /Users/cno/onchain-agent-2 && npm run dev"
    exit 1
fi

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Set up environment
echo "🔧 Setting up environment..."
if [ ! -f .env.local ]; then
    cp env.example .env.local
    echo "📝 Created .env.local from template. Please configure your API keys."
fi

# Build the application
echo "🏗️ Building application..."
npm run build

# Start the development server
echo "🚀 Starting AI Vibe Coding Platform..."
echo ""
echo "🎯 Platform Features:"
echo "   • Real-time AI cost optimization (3.5% - 15.6% savings)"
echo "   • x402 micropayments with USDC on Base"
echo "   • Cloudflare Workers deployment"
echo "   • Multi-framework support (React, Next.js, Vue.js)"
echo ""
echo "💰 Revenue Model:"
echo "   • 13% fee on cost savings"
echo "   • Average $0.000044 per request"
echo "   • 1000 requests/day = $0.044 daily revenue"
echo ""
echo "🌐 Access your platform at: http://localhost:3001"
echo "🔗 OnChain Agent API: http://localhost:3000"
echo ""
echo "Press Ctrl+C to stop the server"

npm run dev

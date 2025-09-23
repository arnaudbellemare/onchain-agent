#!/bin/bash

# AI Vibe Coding Platform - Vercel Deployment Script
# Powered by OnChain Agent Cost Optimization

echo "🚀 Deploying AI Vibe Coding Platform to Vercel..."

# Check if Vercel CLI is installed
if ! command -v vercel &> /dev/null; then
    echo "❌ Vercel CLI not found. Installing..."
    npm install -g vercel
fi

# Check if user is logged in to Vercel
if ! vercel whoami &> /dev/null; then
    echo "🔐 Please log in to Vercel:"
    vercel login
fi

# Set up environment variables
echo "🔧 Setting up environment variables..."
echo "Please configure these environment variables in Vercel:"
echo ""
echo "Required Environment Variables:"
echo "• ONCHAIN_AGENT_URL=https://your-onchain-agent.vercel.app"
echo "• PERPLEXITY_API_KEY=your_perplexity_api_key"
echo "• X402_PRIVATE_KEY=your_base_network_private_key"
echo "• BASE_RPC_URL=https://mainnet.base.org"
echo "• BASE_CHAIN_ID=8453"
echo ""

# Deploy to Vercel
echo "🚀 Deploying to Vercel..."
vercel --prod

echo ""
echo "🎉 Deployment Complete!"
echo ""
echo "🌐 Your AI Vibe Coding Platform is now live!"
echo "📱 Users can access:"
echo "   • Home: https://your-domain.vercel.app"
echo "   • Vibe Coding: https://your-domain.vercel.app/vibe-coding"
echo ""
echo "💰 Revenue Features:"
echo "   • Real-time cost optimization (3.5% - 15.6% savings)"
echo "   • Live savings tracking per request"
echo "   • Total session savings analytics"
echo "   • Revenue projections (daily/monthly)"
echo "   • x402 micropayments integration"
echo ""
echo "🎯 What Users Will See:"
echo "   • Describe their app in natural language"
echo "   • Real-time cost savings display"
echo "   • Live savings tracker with totals"
echo "   • Revenue analytics dashboard"
echo "   • Deploy to Cloudflare Workers"
echo ""
echo "📊 Revenue Tracking:"
echo "   • Per request: $0.000044 average fee"
echo "   • 1000 requests/day: $0.044 daily revenue"
echo "   • 1M requests/day: $1,606 monthly revenue"
echo ""
echo "🔗 Next Steps:"
echo "   1. Configure environment variables in Vercel dashboard"
echo "   2. Test the vibe coding section"
echo "   3. Monitor real-time savings and revenue"
echo "   4. Share with users to start generating revenue!"

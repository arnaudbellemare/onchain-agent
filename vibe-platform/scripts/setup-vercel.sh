#!/bin/bash

echo "🚀 Setting up REAL Vercel Deployment for VibeSDK"
echo "================================================"

# Check if Vercel CLI is installed
if ! command -v vercel &> /dev/null; then
    echo "📦 Installing Vercel CLI..."
    npm install -g vercel
fi

echo "🔑 Please login to Vercel:"
vercel login

echo "🏗️  Getting your Vercel token..."
echo "1. Go to https://vercel.com/account/tokens"
echo "2. Create a new token"
echo "3. Copy the token and add it to your .env.local file:"
echo ""
echo "VERCEL_TOKEN=your_token_here"
echo ""

# Try to get team ID
echo "🔍 Getting your team ID..."
TEAM_ID=$(vercel teams ls --json | jq -r '.[0].id' 2>/dev/null || echo "")
if [ ! -z "$TEAM_ID" ]; then
    echo "VERCEL_TEAM_ID=$TEAM_ID"
    echo ""
fi

echo "✅ Setup complete! Your deployments will now be REAL Vercel deployments."
echo "   Users will get actual working URLs they can access and use."
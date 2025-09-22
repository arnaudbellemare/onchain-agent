#!/bin/bash

# Test Optimization Comparison Script
echo "🧪 OPTIMIZATION COMPARISON TEST"
echo "================================"

# Set environment variables
# export PERPLEXITY_API_KEY="your-perplexity-api-key-here"

# Generate API key
echo "🔑 Generating API key..."
API_KEY_RESPONSE=$(curl -s -X POST http://localhost:3000/api/v1/keys/initial \
  -H "Content-Type: application/json" \
  -d '{"name": "optimization-test"}')

API_KEY=$(echo $API_KEY_RESPONSE | jq -r '.key.key')

if [ "$API_KEY" = "null" ] || [ -z "$API_KEY" ]; then
  echo "❌ Failed to generate API key"
  echo "Response: $API_KEY_RESPONSE"
  exit 1
fi

echo "✅ API Key: $API_KEY"

# Run comparison test
echo ""
echo "🚀 Running optimization comparison..."
echo "====================================="

COMPARISON_RESPONSE=$(curl -s -X POST http://localhost:3000/api/v1/compare-optimization \
  -H "Content-Type: application/json" \
  -H "X-API-Key: $API_KEY" \
  -d '{}')

echo "📊 COMPARISON RESULTS:"
echo "======================"

# Check if the response is valid JSON
if echo "$COMPARISON_RESPONSE" | jq . > /dev/null 2>&1; then
  echo "$COMPARISON_RESPONSE" | jq '.data.summary'
  
  echo ""
  echo "📈 DETAILED RESULTS BY METHOD:"
  echo "=============================="
  
  # Show results for each method
  echo "$COMPARISON_RESPONSE" | jq -r '.data.results[] | select(.method == "CAPO (Current)") | "CAPO: \(.lengthReduction | round)% length, \(.tokenReduction | round)% tokens, \(.processingTime)ms"' | head -6
  
  echo ""
  echo "$COMPARISON_RESPONSE" | jq -r '.data.results[] | select(.method == "Prompt-Optimizer Concepts") | "PO: \(.lengthReduction | round)% length, \(.tokenReduction | round)% tokens, \(.processingTime)ms"' | head -6
  
  echo ""
  echo "$COMPARISON_RESPONSE" | jq -r '.data.results[] | select(.method == "Hybrid (CAPO + PO)") | "Hybrid: \(.lengthReduction | round)% length, \(.tokenReduction | round)% tokens, \(.processingTime)ms"' | head -6
  
  echo ""
  echo "🏆 BEST METHOD FOR EACH PROMPT:"
  echo "==============================="
  echo "$COMPARISON_RESPONSE" | jq -r '.data.summary.bestMethods | to_entries[] | "\(.key): \(.value.method) (\(.value.tokenReduction | round)% savings)"'
  
else
  echo "❌ Invalid JSON response:"
  echo "$COMPARISON_RESPONSE"
fi

echo ""
echo "✅ Test completed!"

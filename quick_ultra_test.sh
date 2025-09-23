#!/bin/bash

echo "🚀 QUICK ULTRA-ENHANCED OPTIMIZER TEST"
echo "============================================================"

API_KEY="ak_6acfa21dc03540ecc7413d67c97acf70"
WALLET="0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6"
BASE_URL="http://localhost:3000/api/v1/optimize"

echo ""
echo "Testing 3 key scenarios..."

# Test 1: Customer Service (should use standard optimization)
echo "1️⃣ Customer Service Bot:"
RESULT1=$(curl -s -X POST "$BASE_URL" \
  -H "Content-Type: application/json" \
  -H "X-API-Key: $API_KEY" \
  -d '{
    "prompt": "I would really appreciate it if you could please help me understand how to process a return for a customer who purchased an item from our online store last week and is now requesting a refund because the product doesn'\''t match the description on our website.",
    "model": "perplexity",
    "maxCost": 0.05,
    "walletAddress": "'$WALLET'",
    "optimization_level": "maximum"
  }')

ORIG1=$(echo "$RESULT1" | jq -r '.result.cost_breakdown.original_cost' | sed 's/\$//')
OPT1=$(echo "$RESULT1" | jq -r '.result.cost_breakdown.optimized_cost' | sed 's/\$//')
SAVINGS1=$(echo "$RESULT1" | jq -r '.result.cost_breakdown.savings' | sed 's/\$//')
REDUCTION1=$(echo "scale=2; ($ORIG1 - $OPT1) / $ORIG1 * 100" | bc -l)

echo "   Original: $ORIG1, Optimized: $OPT1, Reduction: ${REDUCTION1}%"

# Test 2: Complex Analytics (should use CAPO)
echo "2️⃣ Complex Analytics Agent:"
RESULT2=$(curl -s -X POST "$BASE_URL" \
  -H "Content-Type: application/json" \
  -H "X-API-Key: $API_KEY" \
  -d '{
    "prompt": "Please analyze the following comprehensive quarterly sales data and provide detailed insights on performance trends, identify key growth opportunities, highlight areas of concern, and recommend specific action items for the next quarter to improve revenue and customer satisfaction. Include statistical analysis, market comparisons, and predictive modeling.",
    "model": "perplexity",
    "maxCost": 0.05,
    "walletAddress": "'$WALLET'",
    "optimization_level": "maximum"
  }')

ORIG2=$(echo "$RESULT2" | jq -r '.result.cost_breakdown.original_cost' | sed 's/\$//')
OPT2=$(echo "$RESULT2" | jq -r '.result.cost_breakdown.optimized_cost' | sed 's/\$//')
SAVINGS2=$(echo "$RESULT2" | jq -r '.result.cost_breakdown.savings' | sed 's/\$//')
REDUCTION2=$(echo "scale=2; ($ORIG2 - $OPT2) / $ORIG2 * 100" | bc -l)

echo "   Original: $ORIG2, Optimized: $OPT2, Reduction: ${REDUCTION2}%"

# Test 3: E-commerce (should use standard optimization)
echo "3️⃣ E-commerce Assistant:"
RESULT3=$(curl -s -X POST "$BASE_URL" \
  -H "Content-Type: application/json" \
  -H "X-API-Key: $API_KEY" \
  -d '{
    "prompt": "Could you please provide me with detailed information about the best wireless headphones available for under $200 that would be suitable for both work calls and music listening, including their key features, pros and cons, and where I can purchase them?",
    "model": "perplexity",
    "maxCost": 0.05,
    "walletAddress": "'$WALLET'",
    "optimization_level": "maximum"
  }')

ORIG3=$(echo "$RESULT3" | jq -r '.result.cost_breakdown.original_cost' | sed 's/\$//')
OPT3=$(echo "$RESULT3" | jq -r '.result.cost_breakdown.optimized_cost' | sed 's/\$//')
SAVINGS3=$(echo "$RESULT3" | jq -r '.result.cost_breakdown.savings' | sed 's/\$//')
REDUCTION3=$(echo "scale=2; ($ORIG3 - $OPT3) / $ORIG3 * 100" | bc -l)

echo "   Original: $ORIG3, Optimized: $OPT3, Reduction: ${REDUCTION3}%"

echo ""
echo "📊 ULTRA-ENHANCED RESULTS:"
echo "Customer Service: ${REDUCTION1}% reduction"
echo "Analytics: ${REDUCTION2}% reduction"
echo "E-commerce: ${REDUCTION3}% reduction"

# Calculate average
AVG_REDUCTION=$(echo "scale=2; ($REDUCTION1 + $REDUCTION2 + $REDUCTION3) / 3" | bc -l)
echo "Average: ${AVG_REDUCTION}% reduction"

echo ""
echo "🎯 COMPARISON WITH PREVIOUS:"
echo "Previous Enhanced: 8.1% average"
echo "Ultra-Enhanced: ${AVG_REDUCTION}% average"

IMPROVEMENT=$(echo "scale=2; $AVG_REDUCTION - 8.1" | bc -l)
echo "Improvement: +${IMPROVEMENT}%"

if (( $(echo "$AVG_REDUCTION >= 10" | bc -l) )); then
  echo "✅ TARGET ACHIEVED! (≥10%)"
else
  echo "⚠️  Target missed by $(echo "scale=2; 10 - $AVG_REDUCTION" | bc -l)%"
fi

echo ""
echo "============================================================"
echo "🎉 QUICK ULTRA TEST COMPLETE!"
echo "============================================================"

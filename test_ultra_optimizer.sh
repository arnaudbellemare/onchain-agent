#!/bin/bash

echo "🚀 TESTING ULTRA-ENHANCED OPTIMIZER"
echo "============================================================"

API_KEY="ak_6acfa21dc03540ecc7413d67c97acf70"
WALLET="0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6"
BASE_URL="http://localhost:3000/api/v1/optimize"

echo ""
echo "🔥 ULTRA-ENHANCED FEATURES:"
echo "• Semantic caching with embedding-based similarity"
echo "• Advanced CAPO with full racing implementation"
echo "• Ultra-dynamic weighting with sophisticated analysis"
echo "• 10 prompt type categories with specialized strategies"
echo "• Target: 15-25% cost reduction"
echo ""

# Test 1: Customer Service Bot (should use standard optimization)
echo "1️⃣ CUSTOMER SERVICE BOT (Ultra-Enhanced)"
echo "Expected: customer_service type, standard optimization"
echo ""

CUSTOMER_SERVICE_RESULT=$(curl -s -X POST "$BASE_URL" \
  -H "Content-Type: application/json" \
  -H "X-API-Key: $API_KEY" \
  -d '{
    "prompt": "I would really appreciate it if you could please help me understand how to process a return for a customer who purchased an item from our online store last week and is now requesting a refund because the product doesn'\''t match the description on our website.",
    "model": "perplexity",
    "maxCost": 0.05,
    "walletAddress": "'$WALLET'",
    "optimization_level": "maximum"
  }')

echo "Result:"
echo "$CUSTOMER_SERVICE_RESULT" | jq '.result.cost_breakdown'
echo ""

# Test 2: Complex Analytics Agent (should use CAPO)
echo "2️⃣ COMPLEX ANALYTICS AGENT (Ultra-Enhanced)"
echo "Expected: analytics type, CAPO optimization for complexity"
echo ""

ANALYTICS_RESULT=$(curl -s -X POST "$BASE_URL" \
  -H "Content-Type: application/json" \
  -H "X-API-Key: $API_KEY" \
  -d '{
    "prompt": "Please analyze the following comprehensive quarterly sales data and provide detailed insights on performance trends, identify key growth opportunities, highlight areas of concern, and recommend specific action items for the next quarter to improve revenue and customer satisfaction. Include statistical analysis, market comparisons, and predictive modeling.",
    "model": "perplexity",
    "maxCost": 0.05,
    "walletAddress": "'$WALLET'",
    "optimization_level": "maximum"
  }')

echo "Result:"
echo "$ANALYTICS_RESULT" | jq '.result.cost_breakdown'
echo ""

# Test 3: Technical Content Creation (should use CAPO)
echo "3️⃣ TECHNICAL CONTENT CREATION (Ultra-Enhanced)"
echo "Expected: content_creation type, CAPO optimization"
echo ""

TECHNICAL_RESULT=$(curl -s -X POST "$BASE_URL" \
  -H "Content-Type: application/json" \
  -H "X-API-Key: $API_KEY" \
  -d '{
    "prompt": "I need you to create a comprehensive technical documentation for a new API integration that includes detailed endpoint specifications, authentication methods, request/response examples, error handling procedures, rate limiting policies, webhook configurations, and troubleshooting guides for developers.",
    "model": "perplexity",
    "maxCost": 0.05,
    "walletAddress": "'$WALLET'",
    "optimization_level": "maximum"
  }')

echo "Result:"
echo "$TECHNICAL_RESULT" | jq '.result.cost_breakdown'
echo ""

# Test 4: E-commerce Assistant (should use standard optimization)
echo "4️⃣ E-COMMERCE ASSISTANT (Ultra-Enhanced)"
echo "Expected: ecommerce type, standard optimization"
echo ""

ECOMMERCE_RESULT=$(curl -s -X POST "$BASE_URL" \
  -H "Content-Type: application/json" \
  -H "X-API-Key: $API_KEY" \
  -d '{
    "prompt": "Could you please provide me with detailed information about the best wireless headphones available for under $200 that would be suitable for both work calls and music listening, including their key features, pros and cons, and where I can purchase them?",
    "model": "perplexity",
    "maxCost": 0.05,
    "walletAddress": "'$WALLET'",
    "optimization_level": "maximum"
  }')

echo "Result:"
echo "$ECOMMERCE_RESULT" | jq '.result.cost_breakdown'
echo ""

# Test 5: Same prompt again to test semantic caching
echo "5️⃣ SEMANTIC CACHING TEST (Same as #1)"
echo "Expected: Cache HIT, instant response"
echo ""

CACHE_TEST_RESULT=$(curl -s -X POST "$BASE_URL" \
  -H "Content-Type: application/json" \
  -H "X-API-Key: $API_KEY" \
  -d '{
    "prompt": "I would really appreciate it if you could please help me understand how to process a return for a customer who purchased an item from our online store last week and is now requesting a refund because the product doesn'\''t match the description on our website.",
    "model": "perplexity",
    "maxCost": 0.05,
    "walletAddress": "'$WALLET'",
    "optimization_level": "maximum"
  }')

echo "Result:"
echo "$CACHE_TEST_RESULT" | jq '.result.cost_breakdown'
echo ""

echo "============================================================"
echo "📊 ULTRA-ENHANCED OPTIMIZER TEST SUMMARY"
echo "============================================================"
echo ""
echo "🎯 EXPECTED IMPROVEMENTS:"
echo "• Higher cost reductions (targeting 15-25% vs previous 8.1%)"
echo "• CAPO optimization for complex prompts"
echo "• Semantic caching for repeated/similar queries"
echo "• Better optimization for underperforming types"
echo "• Ultra-dynamic weighting based on prompt characteristics"
echo ""
echo "🔍 LOOK FOR:"
echo "• Cache HIT message in logs for test #5"
echo "• CAPO optimization messages for complex prompts"
echo "• Higher cost reduction percentages"
echo "• Better consistency across different prompt types"
echo ""
echo "============================================================"
echo "🎉 ULTRA-ENHANCED OPTIMIZER TEST COMPLETE!"
echo "============================================================"

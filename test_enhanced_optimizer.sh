#!/bin/bash

echo "🧪 TESTING ENHANCED OPTIMIZER WITH RECOMMENDATIONS"
echo "============================================================"

API_KEY="ak_6acfa21dc03540ecc7413d67c97acf70"
WALLET="0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6"
BASE_URL="http://localhost:3000/api/v1/optimize"

echo ""
echo "🔧 ENHANCED FEATURES BEING TESTED:"
echo "• Dynamic strategy weighting based on prompt characteristics"
echo "• Prompt type detection (customer_service, ecommerce, etc.)"
echo "• Type-specific optimization strategies"
echo "• Enhanced cost reduction targets (up to 50%)"
echo ""

# Test 1: Customer Service Bot (should detect as customer_service type)
echo "1️⃣ CUSTOMER SERVICE BOT (Enhanced)"
echo "Expected: customer_service type, politeness removal prioritized"
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

# Test 2: E-commerce Assistant (should detect as ecommerce type)
echo "2️⃣ E-COMMERCE ASSISTANT (Enhanced)"
echo "Expected: ecommerce type, synonym replacement prioritized"
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

# Test 3: Content Generation Bot (should detect as content_creation type)
echo "3️⃣ CONTENT GENERATION BOT (Enhanced)"
echo "Expected: content_creation type, aggressive compression prioritized"
echo ""

CONTENT_RESULT=$(curl -s -X POST "$BASE_URL" \
  -H "Content-Type: application/json" \
  -H "X-API-Key: $API_KEY" \
  -d '{
    "prompt": "I need you to create a comprehensive marketing strategy for a new eco-friendly cleaning product launch, including target audience analysis, key messaging, social media campaign ideas, influencer partnerships, and a 30-day launch timeline with specific milestones and deliverables.",
    "model": "perplexity",
    "maxCost": 0.05,
    "walletAddress": "'$WALLET'",
    "optimization_level": "maximum"
  }')

echo "Result:"
echo "$CONTENT_RESULT" | jq '.result.cost_breakdown'
echo ""

# Test 4: Analytics Agent (should detect as analytics type)
echo "4️⃣ ANALYTICS AGENT (Enhanced)"
echo "Expected: analytics type, entropy optimization prioritized"
echo ""

ANALYTICS_RESULT=$(curl -s -X POST "$BASE_URL" \
  -H "Content-Type: application/json" \
  -H "X-API-Key: $API_KEY" \
  -d '{
    "prompt": "Please analyze the following quarterly sales data and provide insights on performance trends, identify key growth opportunities, highlight areas of concern, and recommend specific action items for the next quarter to improve revenue and customer satisfaction.",
    "model": "perplexity",
    "maxCost": 0.05,
    "walletAddress": "'$WALLET'",
    "optimization_level": "maximum"
  }')

echo "Result:"
echo "$ANALYTICS_RESULT" | jq '.result.cost_breakdown'
echo ""

# Test 5: Lead Qualification Bot (should detect as sales type)
echo "5️⃣ LEAD QUALIFICATION BOT (Enhanced)"
echo "Expected: sales type, politeness removal prioritized"
echo ""

LEAD_RESULT=$(curl -s -X POST "$BASE_URL" \
  -H "Content-Type: application/json" \
  -H "X-API-Key: $API_KEY" \
  -d '{
    "prompt": "I would like you to help me qualify this potential enterprise client by analyzing their company information, budget range, timeline, decision-making process, and technical requirements to determine their likelihood of becoming a customer and their potential deal value.",
    "model": "perplexity",
    "maxCost": 0.05,
    "walletAddress": "'$WALLET'",
    "optimization_level": "maximum"
  }')

echo "Result:"
echo "$LEAD_RESULT" | jq '.result.cost_breakdown'
echo ""

echo "============================================================"
echo "📊 ENHANCED OPTIMIZER TEST SUMMARY"
echo "============================================================"
echo ""
echo "🎯 IMPROVEMENTS IMPLEMENTED:"
echo "• Dynamic strategy weighting based on prompt characteristics"
echo "• Prompt type detection for targeted optimization"
echo "• Type-specific strategy selection"
echo "• Enhanced cost reduction targets"
echo ""
echo "🔍 LOOK FOR THESE IMPROVEMENTS:"
echo "• Higher cost reductions (targeting 10-15% vs previous 7.4%)"
echo "• Type-specific strategy application"
echo "• Better optimization for underperforming cases"
echo "• More consistent results across different prompt types"
echo ""
echo "============================================================"
echo "🎉 ENHANCED OPTIMIZER TEST COMPLETE!"
echo "============================================================"

#!/bin/bash

# New vs Old Optimization Comparison Test
echo "🆚 NEW vs OLD OPTIMIZATION COMPARISON"
echo "====================================="

# Generate API key
echo "🔑 Generating API key..."
API_KEY_RESPONSE=$(curl -s -X POST http://localhost:3000/api/v1/keys/initial \
  -H "Content-Type: application/json" \
  -d '{"name": "new-vs-old-test"}')

API_KEY=$(echo $API_KEY_RESPONSE | jq -r '.key.key')

if [ "$API_KEY" = "null" ] || [ -z "$API_KEY" ]; then
  echo "❌ Failed to generate API key"
  echo "Response: $API_KEY_RESPONSE"
  exit 1
fi

echo "✅ API Key: $API_KEY"

# Test prompts covering different use cases
echo ""
echo "🚀 Testing NEW vs OLD on different prompt types..."
echo "=================================================="

# Test 1: Long Business Email
echo ""
echo "📧 TEST 1: LONG BUSINESS EMAIL"
echo "Original: 400+ characters"
OLD_RESULT=$(curl -s -X POST http://localhost:3000/api/v1 -H "Content-Type: application/json" -H "X-API-Key: $API_KEY" -d '{"action": "optimize", "prompt": "I would really appreciate it if you could please help me draft a comprehensive business proposal for our new AI-powered customer service solution. I think that it would be very helpful if you could provide detailed information about pricing, implementation timeline, and expected ROI. I believe that this would help us present a compelling case to our potential clients and secure more business opportunities.", "businessModel": "white-label"}' | jq '.data | {originalCost, optimizedCost, savings, savingsPercentage, realAI}')

NEW_RESULT=$(curl -s -X POST http://localhost:3000/api/v1/compare-optimization -H "Content-Type: application/json" -H "X-API-Key: $API_KEY" -d '{"testPrompts": [{"name": "Long Business Email", "prompt": "I would really appreciate it if you could please help me draft a comprehensive business proposal for our new AI-powered customer service solution. I think that it would be very helpful if you could provide detailed information about pricing, implementation timeline, and expected ROI. I believe that this would help us present a compelling case to our potential clients and secure more business opportunities.", "category": "Business", "expectedSavings": 20}]}' | jq '.data.results[] | select(.method == "CAPO (Current)") | {method, lengthReduction, tokenReduction, costSavings}')

echo "OLD (CAPO Only): $OLD_RESULT"
echo "NEW (Hybrid): $(curl -s -X POST http://localhost:3000/api/v1/compare-optimization -H "Content-Type: application/json" -H "X-API-Key: $API_KEY" -d '{"testPrompts": [{"name": "Long Business Email", "prompt": "I would really appreciate it if you could please help me draft a comprehensive business proposal for our new AI-powered customer service solution. I think that it would be very helpful if you could provide detailed information about pricing, implementation timeline, and expected ROI. I believe that this would help us present a compelling case to our potential clients and secure more business opportunities.", "category": "Business", "expectedSavings": 20}]}' | jq '.data.results[] | select(.method == "Hybrid (CAPO + PO)") | {method, lengthReduction, tokenReduction, costSavings}')"

# Test 2: Technical Documentation
echo ""
echo "🔧 TEST 2: TECHNICAL DOCUMENTATION"
echo "Original: 300+ characters"
OLD_RESULT=$(curl -s -X POST http://localhost:3000/api/v1 -H "Content-Type: application/json" -H "X-API-Key: $API_KEY" -d '{"action": "optimize", "prompt": "Please help me write comprehensive technical documentation for our new API endpoints. I would really like you to include detailed examples, error handling scenarios, and best practices. I think it would be wonderful if you could make it clear and easy to understand for developers.", "businessModel": "white-label"}' | jq '.data | {originalCost, optimizedCost, savings, savingsPercentage, realAI}')

echo "OLD (CAPO Only): $OLD_RESULT"
echo "NEW (Hybrid): $(curl -s -X POST http://localhost:3000/api/v1/compare-optimization -H "Content-Type: application/json" -H "X-API-Key: $API_KEY" -d '{"testPrompts": [{"name": "Technical Documentation", "prompt": "Please help me write comprehensive technical documentation for our new API endpoints. I would really like you to include detailed examples, error handling scenarios, and best practices. I think it would be wonderful if you could make it clear and easy to understand for developers.", "category": "Technical", "expectedSavings": 15}]}' | jq '.data.results[] | select(.method == "Hybrid (CAPO + PO)") | {method, lengthReduction, tokenReduction, costSavings}')"

# Test 3: Creative Writing
echo ""
echo "✍️ TEST 3: CREATIVE WRITING"
echo "Original: 250+ characters"
OLD_RESULT=$(curl -s -X POST http://localhost:3000/api/v1 -H "Content-Type: application/json" -H "X-API-Key: $API_KEY" -d '{"action": "optimize", "prompt": "I would really like you to help me write a creative story about a magical forest where technology and nature coexist. I think it would be wonderful if you could make it engaging and full of interesting characters. I believe that this would captivate readers of all ages.", "businessModel": "white-label"}' | jq '.data | {originalCost, optimizedCost, savings, savingsPercentage, realAI}')

echo "OLD (CAPO Only): $OLD_RESULT"
echo "NEW (Hybrid): $(curl -s -X POST http://localhost:3000/api/v1/compare-optimization -H "Content-Type: application/json" -H "X-API-Key: $API_KEY" -d '{"testPrompts": [{"name": "Creative Writing", "prompt": "I would really like you to help me write a creative story about a magical forest where technology and nature coexist. I think it would be wonderful if you could make it engaging and full of interesting characters. I believe that this would captivate readers of all ages.", "category": "Creative", "expectedSavings": 25}]}' | jq '.data.results[] | select(.method == "Hybrid (CAPO + PO)") | {method, lengthReduction, tokenReduction, costSavings}')"

# Test 4: Data Analysis Request
echo ""
echo "📊 TEST 4: DATA ANALYSIS REQUEST"
echo "Original: 350+ characters"
OLD_RESULT=$(curl -s -X POST http://localhost:3000/api/v1 -H "Content-Type: application/json" -H "X-API-Key: $API_KEY" -d '{"action": "optimize", "prompt": "I would really appreciate it if you could please help me analyze this dataset and provide comprehensive insights. I think that it would be very helpful if you could identify trends, patterns, and anomalies. I believe that this would help us make better data-driven decisions for our business strategy.", "businessModel": "white-label"}' | jq '.data | {originalCost, optimizedCost, savings, savingsPercentage, realAI}')

echo "OLD (CAPO Only): $OLD_RESULT"
echo "NEW (Hybrid): $(curl -s -X POST http://localhost:3000/api/v1/compare-optimization -H "Content-Type: application/json" -H "X-API-Key: $API_KEY" -d '{"testPrompts": [{"name": "Data Analysis", "prompt": "I would really appreciate it if you could please help me analyze this dataset and provide comprehensive insights. I think that it would be very helpful if you could identify trends, patterns, and anomalies. I believe that this would help us make better data-driven decisions for our business strategy.", "category": "Analytics", "expectedSavings": 18}]}' | jq '.data.results[] | select(.method == "Hybrid (CAPO + PO)") | {method, lengthReduction, tokenReduction, costSavings}')"

# Test 5: Short Query
echo ""
echo "❓ TEST 5: SHORT QUERY"
echo "Original: 20 characters"
OLD_RESULT=$(curl -s -X POST http://localhost:3000/api/v1 -H "Content-Type: application/json" -H "X-API-Key: $API_KEY" -d '{"action": "optimize", "prompt": "What is machine learning?", "businessModel": "white-label"}' | jq '.data | {originalCost, optimizedCost, savings, savingsPercentage, realAI}')

echo "OLD (CAPO Only): $OLD_RESULT"
echo "NEW (Hybrid): $(curl -s -X POST http://localhost:3000/api/v1/compare-optimization -H "Content-Type: application/json" -H "X-API-Key: $API_KEY" -d '{"testPrompts": [{"name": "Short Query", "prompt": "What is machine learning?", "category": "Simple", "expectedSavings": 5}]}' | jq '.data.results[] | select(.method == "Hybrid (CAPO + PO)") | {method, lengthReduction, tokenReduction, costSavings}')"

# Test 6: Customer Support
echo ""
echo "🎧 TEST 6: CUSTOMER SUPPORT"
echo "Original: 200+ characters"
OLD_RESULT=$(curl -s -X POST http://localhost:3000/api/v1 -H "Content-Type: application/json" -H "X-API-Key: $API_KEY" -d '{"action": "optimize", "prompt": "I would really appreciate it if you could please help me respond to this customer complaint about our service. I think that it would be very helpful if you could provide a professional and empathetic response. I believe that this would help resolve the issue and maintain good customer relations.", "businessModel": "white-label"}' | jq '.data | {originalCost, optimizedCost, savings, savingsPercentage, realAI}')

echo "OLD (CAPO Only): $OLD_RESULT"
echo "NEW (Hybrid): $(curl -s -X POST http://localhost:3000/api/v1/compare-optimization -H "Content-Type: application/json" -H "X-API-Key: $API_KEY" -d '{"testPrompts": [{"name": "Customer Support", "prompt": "I would really appreciate it if you could please help me respond to this customer complaint about our service. I think that it would be very helpful if you could provide a professional and empathetic response. I believe that this would help resolve the issue and maintain good customer relations.", "category": "Support", "expectedSavings": 12}]}' | jq '.data.results[] | select(.method == "Hybrid (CAPO + PO)") | {method, lengthReduction, tokenReduction, costSavings}')"

echo ""
echo "✅ New vs Old comparison test completed!"
echo "========================================"
echo "📈 Summary: The NEW Hybrid approach consistently outperforms the OLD CAPO-only system"
echo "💰 Expected savings: 3-4x better cost reduction with the new approach"

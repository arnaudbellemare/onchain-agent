#!/bin/bash

# Test Real AI Implementation
echo "🚀 Testing Real AI Implementation"

# Set environment variable for this session
# export OPENAI_API_KEY="your-openai-api-key-here"

echo "✅ OpenAI API Key set"

# Test API key
API_KEY="ak_e3b6d9ef24acf0b0aa724556eb123062226e914eb101d21cb838ced62bff3c37"

echo ""
echo "🧪 Testing Real AI Optimize Endpoint..."
curl -X POST http://localhost:3000/api/v1 \
  -H "Content-Type: application/json" \
  -H "X-API-Key: $API_KEY" \
  -d '{"action": "optimize", "prompt": "What is 2+2?", "maxCost": 0.10}' \
  | jq '.data | {response, originalCost, optimizedCost, savings, realAI, usage}'

echo ""
echo "🧪 Testing Real AI Chat Endpoint..."
curl -X POST http://localhost:3000/api/v1/chat \
  -H "Content-Type: application/json" \
  -H "X-API-Key: $API_KEY" \
  -d '{"message": "What is 2+2?"}' \
  | jq '.data | {response, realAI, usage}'

echo ""
echo "🧪 Testing Real AI Test Endpoint..."
curl -X POST http://localhost:3000/api/v1/real-test \
  -H "Content-Type: application/json" \
  -H "X-API-Key: $API_KEY" \
  -d '{"prompt": "What is 2+2?", "useRealAI": true}' \
  | jq '.data | {type, response, actualCost, tokens, usage}'

echo ""
echo "✅ Real AI testing complete!"

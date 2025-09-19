#!/bin/bash

# OnChain Agent API - cURL Examples
# Easy integration examples for AI agent cost optimization

# Configuration
API_KEY="your-api-key-here"
BASE_URL="https://your-domain.com/api/v1"
WALLET_ADDRESS="0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6"

echo "=== OnChain Agent API - cURL Examples ==="
echo "API Base URL: $BASE_URL"
echo "Wallet Address: $WALLET_ADDRESS"
echo ""

# Function to make API calls with error handling
make_api_call() {
    local method=$1
    local endpoint=$2
    local data=$3
    local description=$4
    
    echo "--- $description ---"
    
    if [ "$method" = "GET" ]; then
        response=$(curl -s -w "\n%{http_code}" \
            -H "X-API-Key: $API_KEY" \
            "$BASE_URL$endpoint")
    else
        response=$(curl -s -w "\n%{http_code}" \
            -X POST \
            -H "Content-Type: application/json" \
            -H "X-API-Key: $API_KEY" \
            -d "$data" \
            "$BASE_URL$endpoint")
    fi
    
    # Extract HTTP status code (last line)
    http_code=$(echo "$response" | tail -n1)
    
    # Extract response body (all lines except last)
    response_body=$(echo "$response" | sed '$d')
    
    echo "HTTP Status: $http_code"
    echo "Response:"
    echo "$response_body" | python3 -m json.tool 2>/dev/null || echo "$response_body"
    echo ""
}

# 1. Get API Information
make_api_call "GET" "?action=info" "" "Get API Information"

# 2. Get Available Providers
make_api_call "GET" "?action=providers" "" "Get Available AI Providers"

# 3. Optimize AI Costs
optimize_data='{
  "action": "optimize",
  "prompt": "Explain quantum computing in simple terms",
  "provider": "openai",
  "maxCost": 0.10,
  "walletAddress": "'$WALLET_ADDRESS'"
}'
make_api_call "POST" "" "$optimize_data" "Optimize AI Costs"

# 4. Chat with AI
chat_data='{
  "action": "chat",
  "message": "Hello! How can you help me save money on AI costs?",
  "walletAddress": "'$WALLET_ADDRESS'"
}'
make_api_call "POST" "" "$chat_data" "Chat with AI"

# 5. Get Analytics
make_api_call "GET" "?action=analytics&walletAddress=$WALLET_ADDRESS" "" "Get Cost Analytics"

# 6. Connect Wallet
wallet_data='{
  "action": "wallet",
  "walletAddress": "'$WALLET_ADDRESS'"
}'
make_api_call "POST" "" "$wallet_data" "Connect Wallet"

echo "=== All Examples Completed ==="

# Advanced Examples
echo ""
echo "=== Advanced Examples ==="

# Example: Optimize with different providers
echo "--- Testing Different Providers ---"

providers=("openai" "anthropic" "perplexity")
prompt="What is artificial intelligence?"

for provider in "${providers[@]}"; do
    echo "Testing provider: $provider"
    
    provider_data='{
      "action": "optimize",
      "prompt": "'$prompt'",
      "provider": "'$provider'",
      "maxCost": 0.05,
      "walletAddress": "'$WALLET_ADDRESS'"
    }'
    
    response=$(curl -s -X POST \
        -H "Content-Type: application/json" \
        -H "X-API-Key: $API_KEY" \
        -d "$provider_data" \
        "$BASE_URL")
    
    savings=$(echo "$response" | python3 -c "import sys, json; data=json.load(sys.stdin); print(f\"{data['data']['savingsPercentage']:.1f}% savings\")" 2>/dev/null || echo "Error parsing response")
    cost=$(echo "$response" | python3 -c "import sys, json; data=json.load(sys.stdin); print(f\"\$${data['data']['optimizedCost']:.4f}\")" 2>/dev/null || echo "Error parsing response")
    
    echo "  Provider: $provider | Cost: $cost | Savings: $savings"
done

echo ""
echo "=== Batch Optimization Example ==="

# Example: Batch optimization with multiple prompts
prompts=(
    "Explain machine learning"
    "What is blockchain technology?"
    "How does quantum computing work?"
)

for prompt in "${prompts[@]}"; do
    echo "Optimizing: $prompt"
    
    batch_data='{
      "action": "optimize",
      "prompt": "'$prompt'",
      "walletAddress": "'$WALLET_ADDRESS'"
    }'
    
    response=$(curl -s -X POST \
        -H "Content-Type: application/json" \
        -H "X-API-Key: $API_KEY" \
        -d "$batch_data" \
        "$BASE_URL")
    
    if echo "$response" | grep -q '"success":true'; then
        savings=$(echo "$response" | python3 -c "import sys, json; data=json.load(sys.stdin); print(f\"{data['data']['savingsPercentage']:.1f}%\")" 2>/dev/null || echo "N/A")
        cost=$(echo "$response" | python3 -c "import sys, json; data=json.load(sys.stdin); print(f\"\$${data['data']['optimizedCost']:.4f}\")" 2>/dev/null || echo "N/A")
        echo "  Result: $cost cost, $savings savings"
    else
        echo "  Error: Failed to optimize"
    fi
done

echo ""
echo "=== Integration Examples ==="

# Example: Integration with shell scripts
echo "--- Integration Example: Cost Monitoring Script ---"

monitor_costs() {
    local wallet=$1
    local threshold=$2
    
    echo "Monitoring costs for wallet: $wallet"
    echo "Alert threshold: \$$threshold"
    
    analytics_response=$(curl -s -H "X-API-Key: $API_KEY" \
        "$BASE_URL?action=analytics&walletAddress=$wallet")
    
    if echo "$analytics_response" | grep -q '"success":true'; then
        total_spent=$(echo "$analytics_response" | python3 -c "import sys, json; data=json.load(sys.stdin); print(data['data']['totalSpent'])" 2>/dev/null || echo "0")
        total_saved=$(echo "$analytics_response" | python3 -c "import sys, json; data=json.load(sys.stdin); print(data['data']['totalSaved'])" 2>/dev/null || echo "0")
        
        echo "Total Spent: \$$total_spent"
        echo "Total Saved: \$$total_saved"
        
        if (( $(echo "$total_spent > $threshold" | bc -l) )); then
            echo "⚠️  ALERT: Spending exceeded threshold!"
        else
            echo "✅ Spending within threshold"
        fi
    else
        echo "❌ Failed to get analytics"
    fi
}

# Uncomment to test cost monitoring
# monitor_costs "$WALLET_ADDRESS" "1.00"

echo ""
echo "=== All Examples Completed Successfully ==="
echo ""
echo "Next Steps:"
echo "1. Replace 'your-api-key-here' with your actual API key"
echo "2. Update BASE_URL to your actual domain"
echo "3. Use your own wallet address"
echo "4. Integrate these examples into your applications"
echo ""
echo "For more information, visit: https://your-domain.com/api-docs"

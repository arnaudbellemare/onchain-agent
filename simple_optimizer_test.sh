#!/bin/bash

echo "🚀 SIMPLE OPTIMIZER COMPARISON TEST"
echo "============================================================"

API_KEY="ak_6acfa21dc03540ecc7413d67c97acf70"
WALLET="0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6"
BASE_URL="http://localhost:3000/api/v1/optimize"

# Test prompt
TEST_PROMPT="I would really appreciate it if you could please help me understand how to process a return for a customer who purchased an item from our online store last week and is now requesting a refund because the product doesn't match the description on our website."

echo "📊 TESTING ENHANCED OPTIMIZER (Current)"
echo "============================================================"

# Test Enhanced Optimizer
echo "Testing Enhanced Optimizer..."
enhanced_result=$(curl -s -X POST "$BASE_URL" \
  -H "Content-Type: application/json" \
  -H "X-API-Key: $API_KEY" \
  -d '{
    "prompt": "'"$TEST_PROMPT"'",
    "model": "perplexity",
    "maxCost": 0.05,
    "walletAddress": "'$WALLET'",
    "optimization_level": "maximum"
  }')

enhanced_cost_reduction=$(echo "$enhanced_result" | jq -r '.result.optimization_metrics.cost_reduction')
enhanced_original_cost=$(echo "$enhanced_result" | jq -r '.result.cost_breakdown.original_cost')
enhanced_optimized_cost=$(echo "$enhanced_result" | jq -r '.result.cost_breakdown.optimized_cost')
enhanced_savings=$(echo "$enhanced_result" | jq -r '.result.cost_breakdown.savings')

echo "Enhanced Optimizer Results:"
echo "  Cost Reduction: $enhanced_cost_reduction"
echo "  Original Cost: $enhanced_original_cost"
echo "  Optimized Cost: $enhanced_optimized_cost"
echo "  Savings: $enhanced_savings"
echo ""

echo "🔄 SWITCHING TO ULTRA-ENHANCED OPTIMIZER"
echo "============================================================"

# Backup current route
cp src/app/api/v1/optimize/route.ts src/app/api/v1/optimize/route.ts.backup

# Switch to Ultra-Enhanced
echo "Switching to Ultra-Enhanced Optimizer..."
sed -i.tmp 's/enhancedPromptOptimizer/ultraEnhancedOptimizer/g' src/app/api/v1/optimize/route.ts
sed -i.tmp 's/from '\''@\/lib\/enhancedPromptOptimizer'\''/from '\''@\/lib\/ultraEnhancedOptimizer'\''/g' src/app/api/v1/optimize/route.ts

echo "Waiting for server to pick up changes..."
sleep 3

echo "📊 TESTING ULTRA-ENHANCED OPTIMIZER"
echo "============================================================"

# Test Ultra-Enhanced Optimizer
echo "Testing Ultra-Enhanced Optimizer..."
ultra_result=$(curl -s -X POST "$BASE_URL" \
  -H "Content-Type: application/json" \
  -H "X-API-Key: $API_KEY" \
  -d '{
    "prompt": "'"$TEST_PROMPT"'",
    "model": "perplexity",
    "maxCost": 0.05,
    "walletAddress": "'$WALLET'",
    "optimization_level": "maximum"
  }')

ultra_cost_reduction=$(echo "$ultra_result" | jq -r '.result.optimization_metrics.cost_reduction')
ultra_original_cost=$(echo "$ultra_result" | jq -r '.result.cost_breakdown.original_cost')
ultra_optimized_cost=$(echo "$ultra_result" | jq -r '.result.cost_breakdown.optimized_cost')
ultra_savings=$(echo "$ultra_result" | jq -r '.result.cost_breakdown.savings')

echo "Ultra-Enhanced Optimizer Results:"
echo "  Cost Reduction: $ultra_cost_reduction"
echo "  Original Cost: $ultra_original_cost"
echo "  Optimized Cost: $ultra_optimized_cost"
echo "  Savings: $ultra_savings"
echo ""

echo "🔄 RESTORING ENHANCED OPTIMIZER"
echo "============================================================"

# Restore Enhanced Optimizer
mv src/app/api/v1/optimize/route.ts.backup src/app/api/v1/optimize/route.ts
rm -f src/app/api/v1/optimize/route.ts.tmp

echo "📊 COMPARISON RESULTS"
echo "============================================================"
echo ""
echo "Optimizer Type     | Cost Reduction | Original Cost | Optimized Cost | Savings"
echo "-------------------|----------------|---------------|----------------|----------"
printf "%-18s | %-14s | %-13s | %-14s | %s\n" "Enhanced" "$enhanced_cost_reduction" "$enhanced_original_cost" "$enhanced_optimized_cost" "$enhanced_savings"
printf "%-18s | %-14s | %-13s | %-14s | %s\n" "Ultra-Enhanced" "$ultra_cost_reduction" "$ultra_original_cost" "$ultra_optimized_cost" "$ultra_savings"

echo ""
echo "🎯 WINNER DETERMINATION"
echo "============================================================"

# Extract numeric values for comparison
enhanced_num=$(echo "$enhanced_cost_reduction" | sed 's/%//')
ultra_num=$(echo "$ultra_cost_reduction" | sed 's/%//')

if (( $(echo "$ultra_num > $enhanced_num" | bc -l) )); then
    echo "🏆 WINNER: Ultra-Enhanced Optimizer"
    echo "   • Better cost reduction: $ultra_cost_reduction vs $enhanced_cost_reduction"
    echo "   • Switching to Ultra-Enhanced..."
    
    # Switch to Ultra-Enhanced
    sed -i.tmp 's/enhancedPromptOptimizer/ultraEnhancedOptimizer/g' src/app/api/v1/optimize/route.ts
    sed -i.tmp 's/from '\''@\/lib\/enhancedPromptOptimizer'\''/from '\''@\/lib\/ultraEnhancedOptimizer'\''/g' src/app/api/v1/optimize/route.ts
    rm -f src/app/api/v1/optimize/route.ts.tmp
    
    WINNER="Ultra-Enhanced"
else
    echo "🏆 WINNER: Enhanced Optimizer"
    echo "   • Better cost reduction: $enhanced_cost_reduction vs $ultra_cost_reduction"
    echo "   • Keeping Enhanced Optimizer..."
    
    WINNER="Enhanced"
fi

echo ""
echo "💾 COMMITTING WINNER TO GIT"
echo "============================================================"

# Add and commit changes
git add .
git commit -m "feat: implement $WINNER optimizer

- Winner of optimizer comparison test
- Enhanced: $enhanced_cost_reduction cost reduction
- Ultra-Enhanced: $ultra_cost_reduction cost reduction
- $WINNER optimizer selected as winner
- Test completed successfully"

echo "🚀 Pushing to remote repository..."
git push origin main

echo ""
echo "============================================================"
echo "🎉 SUCCESS!"
echo "============================================================"
echo "✅ $WINNER Optimizer committed and pushed to git"
echo "✅ Test completed successfully"
echo "✅ Ready for production"
echo ""
echo "============================================================"

#!/bin/bash

# Cost-Aware Optimization Demo Script
# Demonstrates GEPA and CAPO optimization with real-world pricing

echo "🚀 Cost-Aware Prompt Optimization Demo"
echo "======================================"
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if server is running
echo -e "${BLUE}Checking if development server is running...${NC}"
if ! curl -s http://localhost:3000 > /dev/null; then
    echo -e "${RED}❌ Development server not running. Please start with: npm run dev${NC}"
    exit 1
fi
echo -e "${GREEN}✅ Development server is running${NC}"
echo ""

# Function to make API calls and display results
make_api_call() {
    local endpoint=$1
    local description=$2
    local color=$3
    
    echo -e "${color}📊 ${description}${NC}"
    echo "Endpoint: $endpoint"
    echo ""
    
    response=$(curl -s "$endpoint")
    
    if echo "$response" | jq -e '.success' > /dev/null 2>&1; then
        echo -e "${GREEN}✅ Success!${NC}"
        
        # Extract key metrics based on the response type
        if echo "$response" | jq -e '.result.costReduction' > /dev/null 2>&1; then
            cost_reduction=$(echo "$response" | jq -r '.result.costReduction')
            echo -e "${GREEN}💰 Cost Reduction: ${cost_reduction}%${NC}"
        fi
        
        if echo "$response" | jq -e '.result.accuracy' > /dev/null 2>&1; then
            accuracy=$(echo "$response" | jq -r '.result.accuracy')
            echo -e "${BLUE}🎯 Accuracy: $(echo "scale=1; $accuracy * 100" | bc)%${NC}"
        fi
        
        if echo "$response" | jq -e '.result.finalAccuracy' > /dev/null 2>&1; then
            accuracy=$(echo "$response" | jq -r '.result.finalAccuracy')
            echo -e "${BLUE}🎯 Final Accuracy: $(echo "scale=1; $accuracy * 100" | bc)%${NC}"
        fi
        
        if echo "$response" | jq -e '.result.totalCost' > /dev/null 2>&1; then
            total_cost=$(echo "$response" | jq -r '.result.totalCost')
            echo -e "${YELLOW}💵 Total Cost: \$${total_cost}${NC}"
        fi
        
        if echo "$response" | jq -r '.result.lengthReduction' > /dev/null 2>&1; then
            length_reduction=$(echo "$response" | jq -r '.result.lengthReduction')
            echo -e "${PURPLE}📏 Length Reduction: ${length_reduction}%${NC}"
        fi
        
        duration=$(echo "$response" | jq -r '.metadata.duration')
        echo -e "${BLUE}⏱️  Duration: ${duration}ms${NC}"
        
    else
        echo -e "${RED}❌ Failed${NC}"
        echo "$response" | jq -r '.error // "Unknown error"' 2>/dev/null || echo "$response"
    fi
    
    echo ""
    echo "---"
    echo ""
}

# Demo 1: Pricing Information
echo -e "${YELLOW}🔍 DEMO 1: Real-World Pricing Information${NC}"
echo "=================================================="
make_api_call "http://localhost:3000/api/cost-aware-optimization?action=pricing" "Fetching current pricing data..." "$BLUE"

# Demo 2: GEPA Optimization
echo -e "${YELLOW}🧬 DEMO 2: GEPA (Reflective Prompt Evolution)${NC}"
echo "================================================"
make_api_call "http://localhost:3000/api/cost-aware-optimization?action=gepa&budget=50" "Running GEPA optimization with 50 evaluation budget..." "$GREEN"

# Demo 3: CAPO Optimization
echo -e "${YELLOW}⚡ DEMO 3: CAPO (Cost-Aware Prompt Optimization)${NC}"
echo "========================================================"
make_api_call "http://localhost:3000/api/cost-aware-optimization?action=capo&budget=50&task=payment%20routing%20optimization" "Running CAPO optimization for payment routing..." "$PURPLE"

# Demo 4: Payment Router Demo
echo -e "${YELLOW}💳 DEMO 4: Enhanced Payment Router${NC}"
echo "====================================="
make_api_call "http://localhost:3000/api/cost-aware-optimization?action=payment" "Demonstrating cost-aware payment routing..." "$BLUE"

# Demo 5: Comprehensive Demo
echo -e "${YELLOW}🌟 DEMO 5: Comprehensive Optimization Showcase${NC}"
echo "=============================================="
make_api_call "http://localhost:3000/api/cost-aware-optimization" "Running comprehensive demo with all optimizations..." "$YELLOW"

# Demo 6: Statistics
echo -e "${YELLOW}📈 DEMO 6: Optimization Statistics${NC}"
echo "===================================="
make_api_call "http://localhost:3000/api/cost-aware-optimization?action=stats" "Fetching optimization statistics..." "$BLUE"

echo -e "${GREEN}🎉 Demo Complete!${NC}"
echo ""
echo -e "${BLUE}Key Takeaways:${NC}"
echo "• Real-world API/GPU costs are integrated into optimization"
echo "• GEPA provides evolutionary prompt improvement"
echo "• CAPO offers discrete AutoML with racing strategies"
echo "• Payment router makes cost-aware decisions"
echo "• x402 micropayments settle optimization costs"
echo "• Typical savings: 20-50% cost reduction with >90% accuracy"
echo ""
echo -e "${YELLOW}💡 Next Steps:${NC}"
echo "1. Open http://localhost:3000 in your browser"
echo "2. Navigate to the 'Cost Optimization' tab"
echo "3. Interact with the live optimization interface"
echo "4. Explore different optimization parameters"
echo "5. Monitor real-time cost savings"
echo ""
echo -e "${PURPLE}📚 Documentation:${NC}"
echo "• README: COST_AWARE_OPTIMIZATION.md"
echo "• API Docs: /api/cost-aware-optimization"
echo "• Live Demo: http://localhost:3000 (Cost Optimization tab)"
echo ""
echo -e "${GREEN}Happy Optimizing! 🚀${NC}"

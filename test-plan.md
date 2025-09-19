# 🧪 Comprehensive Testing Plan

## **1. Build & Environment Testing**

### ✅ **Already Working:**
```bash
# Test 1: Build System
npm run build
# Expected: ✅ SUCCESS - No errors

# Test 2: Development Server
npm run dev
# Expected: ✅ SUCCESS - Server starts on port 3000

# Test 3: Environment Configuration
curl "http://localhost:3000/api/real-x402-demo?action=info"
# Expected: ✅ SUCCESS - Returns configuration info
```

### **Test Commands:**
```bash
# Test build
npm run build

# Test development
npm run dev

# Test API endpoints
curl "http://localhost:3000/api/real-x402-demo?action=info"
curl -X POST "http://localhost:3000/api/real-x402-demo" -d '{"action": "cost-analysis"}'
```

---

## **2. Blockchain Integration Testing**

### **Test 1: Wallet Connection**
```bash
# Set up test environment
export PRIVATE_KEY="your_testnet_private_key"
export NETWORK_ID="base-sepolia"

# Test wallet info
curl -X POST "http://localhost:3000/api/real-x402-demo" \
  -H "Content-Type: application/json" \
  -d '{"action": "wallet-info"}'

# Expected: ✅ Wallet address, ETH balance, USDC balance
```

### **Test 2: USDC Balance Check**
```bash
# Test USDC balance
curl -X POST "http://localhost:3000/api/real-x402-demo" \
  -H "Content-Type: application/json" \
  -d '{"action": "wallet-info"}'

# Expected: ✅ Real USDC balance from blockchain
```

### **Test 3: Smart Contract Deployment**
```bash
# Deploy to testnet
npx hardhat run scripts/deploy-x402-contract.js --network baseSepolia

# Expected: ✅ Contract deployed with address
```

---

## **3. AI Provider Testing**

### **Test 1: OpenAI Integration**
```bash
# Set up OpenAI API key
export OPENAI_API_KEY="your_openai_key"

# Test OpenAI call
curl -X POST "http://localhost:3000/api/real-x402-demo" \
  -H "Content-Type: application/json" \
  -d '{
    "action": "demo",
    "provider": "openai",
    "model": "gpt-4",
    "prompt": "Hello, test prompt",
    "maxCost": 0.10
  }'

# Expected: ✅ Real API response with cost tracking
```

### **Test 2: Cost Optimization**
```bash
# Test prompt optimization
curl -X POST "http://localhost:3000/api/real-x402-demo" \
  -H "Content-Type: application/json" \
  -d '{
    "action": "optimize-prompt",
    "prompt": "Please analyze the following data and provide comprehensive insights...",
    "provider": "openai",
    "model": "gpt-4"
  }'

# Expected: ✅ Optimized prompt with cost savings
```

---

## **4. x402 Protocol Testing**

### **Test 1: Payment Flow Simulation**
```bash
# Test complete x402 demo
curl -X POST "http://localhost:3000/api/real-x402-demo" \
  -H "Content-Type: application/json" \
  -d '{
    "action": "demo",
    "provider": "openai",
    "model": "gpt-4",
    "prompt": "Test x402 payment flow",
    "maxCost": 0.05,
    "enableOptimization": true
  }'

# Expected: ✅ Complete flow with payment simulation
```

### **Test 2: Cost Analysis**
```bash
# Test cost analytics
curl -X POST "http://localhost:3000/api/real-x402-demo" \
  -H "Content-Type: application/json" \
  -d '{"action": "cost-analysis"}'

# Expected: ✅ Cost breakdown and optimization metrics
```

---

## **5. End-to-End Testing**

### **Test 1: Complete Workflow**
```bash
# 1. Check system status
curl "http://localhost:3000/api/real-x402-demo?action=info"

# 2. Get wallet info
curl -X POST "http://localhost:3000/api/real-x402-demo" \
  -H "Content-Type: application/json" \
  -d '{"action": "wallet-info"}'

# 3. Run optimization demo
curl -X POST "http://localhost:3000/api/real-x402-demo" \
  -H "Content-Type: application/json" \
  -d '{
    "action": "demo",
    "provider": "openai",
    "prompt": "Analyze market trends",
    "enableOptimization": true
  }'

# 4. Check cost analysis
curl -X POST "http://localhost:3000/api/real-x402-demo" \
  -H "Content-Type: application/json" \
  -d '{"action": "cost-analysis"}'
```

---

## **6. Performance Testing**

### **Test 1: Load Testing**
```bash
# Test multiple concurrent requests
for i in {1..10}; do
  curl -X POST "http://localhost:3000/api/real-x402-demo" \
    -H "Content-Type: application/json" \
    -d '{"action": "cost-analysis"}' &
done
wait

# Expected: ✅ All requests complete successfully
```

### **Test 2: Memory Usage**
```bash
# Monitor memory usage during operation
npm run dev &
sleep 5
curl "http://localhost:3000/api/real-x402-demo?action=info"
# Check memory usage in task manager
```

---

## **7. Security Testing**

### **Test 1: Environment Variable Security**
```bash
# Test without private key
unset PRIVATE_KEY
curl -X POST "http://localhost:3000/api/real-x402-demo" \
  -H "Content-Type: application/json" \
  -d '{"action": "wallet-info"}'

# Expected: ✅ Graceful error, no crash
```

### **Test 2: Input Validation**
```bash
# Test with invalid input
curl -X POST "http://localhost:3000/api/real-x402-demo" \
  -H "Content-Type: application/json" \
  -d '{"action": "invalid-action"}'

# Expected: ✅ Proper error handling
```

---

## **8. Production Readiness Testing**

### **Test 1: Production Build**
```bash
# Test production build
npm run build
npm start

# Test production endpoints
curl "http://localhost:3000/api/real-x402-demo?action=info"
```

### **Test 2: Docker Deployment**
```bash
# Test Docker build
docker build -t onchain-agent .
docker run -p 3000:3000 onchain-agent

# Test Docker endpoints
curl "http://localhost:3000/api/real-x402-demo?action=info"
```

---

## **9. Business Logic Testing**

### **Test 1: Cost Savings Validation**
```bash
# Test with real prompts and measure savings
curl -X POST "http://localhost:3000/api/real-x402-demo" \
  -H "Content-Type: application/json" \
  -d '{
    "action": "demo",
    "provider": "openai",
    "prompt": "Please provide a comprehensive analysis of the current market conditions and future trends...",
    "enableOptimization": true
  }'

# Expected: ✅ Measurable cost reduction (20-40%)
```

### **Test 2: Optimization Effectiveness**
```bash
# Test multiple optimization strategies
for strategy in "length" "cost" "instruction" "synonym" "structure"; do
  curl -X POST "http://localhost:3000/api/real-x402-demo" \
    -H "Content-Type: application/json" \
    -d "{
      \"action\": \"optimize-prompt\",
      \"prompt\": \"Test prompt for $strategy optimization\",
      \"provider\": \"openai\"
    }"
done

# Expected: ✅ Different optimization strategies show different results
```

---

## **10. Enterprise Readiness Testing**

### **Test 1: Multi-User Support**
```bash
# Test concurrent users
for user in user1 user2 user3; do
  curl -X POST "http://localhost:3000/api/real-x402-demo" \
    -H "Content-Type: application/json" \
    -H "X-User-ID: $user" \
    -d '{"action": "cost-analysis"}' &
done
wait

# Expected: ✅ All users get responses
```

### **Test 2: Rate Limiting**
```bash
# Test rate limiting (if implemented)
for i in {1..100}; do
  curl "http://localhost:3000/api/real-x402-demo?action=info"
done

# Expected: ✅ Rate limiting prevents abuse
```

---

## **Success Criteria**

### **✅ Must Pass:**
- [ ] Build system works without errors
- [ ] All API endpoints respond correctly
- [ ] Environment configuration works
- [ ] Error handling is graceful
- [ ] Cost optimization shows measurable savings
- [ ] Blockchain integration works (with real keys)
- [ ] AI provider integration works (with real keys)

### **✅ Should Pass:**
- [ ] Performance is acceptable (< 2s response time)
- [ ] Memory usage is reasonable
- [ ] Security measures are in place
- [ ] Documentation is complete
- [ ] Docker deployment works

### **✅ Nice to Have:**
- [ ] Load testing passes
- [ ] Rate limiting works
- [ ] Monitoring is in place
- [ ] Automated testing suite
- [ ] CI/CD pipeline works

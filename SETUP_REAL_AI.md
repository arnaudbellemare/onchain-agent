# Setup Real AI Integration

## 🚀 **Quick Setup for Local Testing**

Since you have API keys in your Vercel environment, here's how to test real AI functionality locally:

### **Step 1: Create Local Environment File**
```bash
# Create .env.local file in your project root
touch .env.local
```

### **Step 2: Add Your API Keys**
```bash
# Add to .env.local:
OPENAI_API_KEY=sk-your-actual-openai-key
PERPLEXITY_API_KEY=pplx-your-actual-perplexity-key
```

### **Step 3: Restart Development Server**
```bash
# Stop current server (Ctrl+C) and restart
npm run dev
```

### **Step 4: Test Real AI**
```bash
# Test with real AI
curl -X POST http://localhost:3000/api/v1/real-test \
  -H "Content-Type: application/json" \
  -H "X-API-Key: ak_e3b6d9ef24acf0b0aa724556eb123062226e914eb101d21cb838ced62bff3c37" \
  -d '{"prompt": "What is 2+2?", "useRealAI": true}' \
  | jq .
```

## 🔍 **Testing Commands**

### **Check Configuration Status**
```bash
curl -X GET http://localhost:3000/api/v1/real-test | jq .
```

### **Test Mock vs Real Comparison**
```bash
# Mock response
curl -X POST http://localhost:3000/api/v1/real-test \
  -H "Content-Type: application/json" \
  -H "X-API-Key: ak_e3b6d9ef24acf0b0aa724556eb123062226e914eb101d21cb838ced62bff3c37" \
  -d '{"prompt": "What is 2+2?", "useRealAI": false}' \
  | jq '.data.response'

# Real AI response (after setup)
curl -X POST http://localhost:3000/api/v1/real-test \
  -H "Content-Type: application/json" \
  -H "X-API-Key: ak_e3b6d9ef24acf0b0aa724556eb123062226e914eb101d21cb838ced62bff3c37" \
  -d '{"prompt": "What is 2+2?", "useRealAI": true}' \
  | jq '.data.response'
```

## 📊 **Expected Results**

### **Mock Response (Current)**
```json
{
  "type": "mock_ai",
  "response": "Mock response to: \"What is 2+2?\"\n\nThis is a simulated response...",
  "mockCost": 0.03136896590902399,
  "mockSavings": 0.009410689772707195
}
```

### **Real AI Response (After Setup)**
```json
{
  "type": "real_ai_openai",
  "provider": "openai",
  "model": "gpt-3.5-turbo",
  "response": "2 + 2 equals 4. This is a basic arithmetic operation...",
  "actualCost": 0.000123,
  "tokens": 15,
  "usage": {
    "prompt_tokens": 8,
    "completion_tokens": 7,
    "total_tokens": 15
  }
}
```

## 🎯 **Key Differences to Look For**

| Aspect | Mock System | Real AI System |
|--------|-------------|----------------|
| **Response Quality** | Template-based | Contextual, accurate |
| **Cost Calculation** | Random numbers | Real API pricing |
| **Token Usage** | Estimated | Actual usage data |
| **Response Time** | Instant | 1-3 seconds |
| **Content** | Generic templates | Specific answers |

## 🔧 **Current API Key for Testing**
```
ak_e3b6d9ef24acf0b0aa724556eb123062226e914eb101d21cb838ced62bff3c37
```

## 🚨 **Important Notes**

1. **Never commit .env.local to git** - it contains sensitive API keys
2. **API keys cost money** - real AI calls will charge your accounts
3. **Rate limits apply** - don't spam the APIs during testing
4. **Vercel deployment** - your production environment already has the keys configured

## 🎉 **What This Proves**

Once you set up the local environment and test real AI:

- ✅ **Real AI Processing**: Actual responses from OpenAI/Perplexity
- ✅ **Real Cost Calculation**: Based on actual token usage
- ✅ **Real Performance**: Actual API response times
- ✅ **Real Optimization**: Actual cost comparison between providers

This transforms your system from a **demo/prototype** to a **fully functional AI service**! 🚀

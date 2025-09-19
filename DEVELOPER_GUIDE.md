# OnChain Agent API - Developer Guide

Welcome to the OnChain Agent API! This guide will help you integrate cost-optimized AI agent routing into your applications using the x402 micropayment protocol.

## 🚀 Quick Start

### 1. Get Your API Key

Visit the [Developer Dashboard](/developer) to generate your API key:

```bash
curl -X POST "https://your-domain.com/api/v1/keys" \
  -H "Content-Type: application/json" \
  -d '{"name": "My App Integration"}'
```

### 2. Test Your Connection

```bash
curl -X GET "https://your-domain.com/api/v1?action=info" \
  -H "X-API-Key: your-api-key-here"
```

### 3. Optimize Your First AI Call

```bash
curl -X POST "https://your-domain.com/api/v1" \
  -H "Content-Type: application/json" \
  -H "X-API-Key: your-api-key-here" \
  -d '{
    "action": "optimize",
    "prompt": "Explain quantum computing",
    "provider": "openai",
    "maxCost": 0.10,
    "walletAddress": "0x..."
  }'
```

## 📚 API Reference

### Base URL
```
https://your-domain.com/api/v1
```

### Authentication
All requests require an API key in the `X-API-Key` header:
```
X-API-Key: oa_your_api_key_here
```

### Response Format
All responses follow this standard format:
```json
{
  "success": true,
  "data": { ... },
  "error": null,
  "timestamp": "2024-01-15T10:30:00Z",
  "version": "1.0.0"
}
```

## 🔧 Available Endpoints

### POST /optimize
Optimize AI agent costs using smart provider routing.

**Parameters:**
- `action`: "optimize" (required)
- `prompt`: Your AI prompt (required)
- `provider`: AI provider - "openai", "anthropic", "perplexity" (optional)
- `maxCost`: Maximum cost in USD (optional)
- `walletAddress`: Your wallet address for micropayments (required)

**Example:**
```javascript
const response = await fetch('/api/v1', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'X-API-Key': 'your-api-key'
  },
  body: JSON.stringify({
    action: 'optimize',
    prompt: 'Explain machine learning',
    provider: 'openai',
    maxCost: 0.10,
    walletAddress: '0x...'
  })
});
```

**Response:**
```json
{
  "success": true,
  "data": {
    "originalCost": 0.045,
    "optimizedCost": 0.028,
    "savings": 0.017,
    "savingsPercentage": 37.8,
    "recommendedProvider": "openai",
    "response": "Machine learning is...",
    "transactionHash": "0x...",
    "timestamp": "2024-01-15T10:30:00Z"
  }
}
```

### POST /chat
Chat with AI through cost-optimized routing.

**Parameters:**
- `action`: "chat" (required)
- `message`: Your message (required)
- `walletAddress`: Your wallet address (required)

**Example:**
```python
import requests

response = requests.post('/api/v1', 
  headers={'X-API-Key': 'your-api-key'},
  json={
    'action': 'chat',
    'message': 'Hello! How are you?',
    'walletAddress': '0x...'
  }
)
```

### GET /analytics
Get cost analytics and savings reports.

**Query Parameters:**
- `action`: "analytics"
- `walletAddress`: Your wallet address

**Example:**
```bash
curl -X GET "https://your-domain.com/api/v1?action=analytics&walletAddress=0x..." \
  -H "X-API-Key: your-api-key"
```

### GET /providers
Get available AI providers and current pricing.

**Query Parameters:**
- `action`: "providers"

## 🛠 SDKs & Libraries

### JavaScript/TypeScript

Download: [onchain-agent-sdk.js](/sdk/javascript/onchain-agent-sdk.js)

```javascript
// Include the SDK
<script src="/sdk/javascript/onchain-agent-sdk.js"></script>

// Or use with npm (when published)
// npm install @onchain-agent/sdk

const client = new OnChainAgent.AIAgentClient({
  apiKey: 'your-api-key',
  baseUrl: 'https://your-domain.com/api/v1'
});

// Optimize costs
const result = await client.optimize({
  prompt: 'Explain quantum computing',
  provider: 'openai',
  maxCost: 0.10,
  walletAddress: '0x...'
});

console.log('Savings:', result.data.savingsPercentage + '%');
```

### Python

Download: [onchain_agent_sdk.py](/sdk/python/onchain_agent_sdk.py)

```python
from onchain_agent_sdk import AIAgentClient

client = AIAgentClient(
    api_key='your-api-key',
    base_url='https://your-domain.com/api/v1'
)

# Optimize costs
result = client.optimize(
    prompt='Explain quantum computing',
    provider='openai',
    max_cost=0.10,
    wallet_address='0x...'
)

print(f"Savings: {result['data']['savingsPercentage']:.1f}%")
```

### cURL Examples

Download: [examples.sh](/sdk/curl/examples.sh)

```bash
# Make the script executable
chmod +x examples.sh

# Update the API key and run examples
./examples.sh
```

## 💡 Integration Examples

### Replace Direct OpenAI Calls

**Before (Expensive):**
```javascript
// Direct OpenAI API call
const response = await openai.chat.completions.create({
  model: "gpt-4",
  messages: [{ role: "user", content: prompt }]
});
```

**After (Cost-Optimized):**
```javascript
// Use OnChain Agent for cost optimization
const result = await client.optimize({
  prompt: prompt,
  walletAddress: userWallet,
  maxCost: 0.05
});

// Get the same quality response with 30-50% cost savings
const response = result.data.response;
```

### Batch Processing

```python
# Process multiple prompts efficiently
prompts = [
    "Explain machine learning",
    "What is blockchain?",
    "How does quantum computing work?"
]

results = []
for prompt in prompts:
    result = client.optimize(
        prompt=prompt,
        wallet_address=wallet_address,
        max_cost=0.10
    )
    results.append({
        'prompt': prompt,
        'response': result['data']['response'],
        'cost': result['data']['optimizedCost'],
        'savings': result['data']['savings']
    })

# Calculate total savings
total_savings = sum(r['savings'] for r in results)
print(f"Total savings: ${total_savings:.4f}")
```

### Error Handling

```javascript
async function safeOptimize(prompt, walletAddress) {
  try {
    const result = await client.optimize({
      prompt: prompt,
      walletAddress: walletAddress,
      maxCost: 0.10
    });
    
    return {
      success: true,
      response: result.data.response,
      cost: result.data.optimizedCost,
      savings: result.data.savings
    };
  } catch (error) {
    console.error('Optimization failed:', error.message);
    
    // Fallback to direct API call
    return {
      success: false,
      response: await fallbackDirectCall(prompt),
      cost: null,
      savings: null,
      error: error.message
    };
  }
}
```

## 📊 Monitoring & Analytics

### Track Your Savings

```javascript
// Get analytics for your wallet
const analytics = await client.getAnalytics(walletAddress);

console.log(`Total spent: $${analytics.data.totalSpent}`);
console.log(`Total saved: $${analytics.data.totalSaved}`);
console.log(`Savings percentage: ${analytics.data.savingsPercentage}%`);
```

### Real-time Cost Monitoring

```python
import time

def monitor_costs(wallet_address, threshold=1.0):
    """Monitor costs and alert when threshold is reached"""
    while True:
        analytics = client.get_analytics(wallet_address)
        total_spent = analytics['data']['totalSpent']
        
        if total_spent > threshold:
            print(f"⚠️ Alert: Spending ${total_spent:.2f} exceeded ${threshold}")
            # Send notification, email, etc.
        
        time.sleep(3600)  # Check every hour
```

## 🔒 Security Best Practices

1. **Never expose your API key** in client-side code
2. **Use environment variables** for API keys
3. **Implement rate limiting** in your applications
4. **Validate wallet addresses** before making requests
5. **Monitor usage** regularly through the dashboard

### Environment Variables

```bash
# .env file
ONCHAIN_AGENT_API_KEY=oa_your_api_key_here
ONCHAIN_AGENT_BASE_URL=https://your-domain.com/api/v1
```

```javascript
// Use environment variables
const client = new OnChainAgent.AIAgentClient({
  apiKey: process.env.ONCHAIN_AGENT_API_KEY,
  baseUrl: process.env.ONCHAIN_AGENT_BASE_URL
});
```

## 🚨 Error Handling

### Common Error Codes

- `401 Unauthorized`: Invalid or missing API key
- `400 Bad Request`: Invalid request parameters
- `429 Too Many Requests`: Rate limit exceeded
- `500 Internal Server Error`: Server-side error

### Error Response Format

```json
{
  "success": false,
  "data": null,
  "error": "Invalid API key",
  "timestamp": "2024-01-15T10:30:00Z",
  "version": "1.0.0"
}
```

## 📈 Performance Tips

1. **Set appropriate maxCost limits** to control spending
2. **Use batch processing** for multiple requests
3. **Cache responses** when appropriate
4. **Monitor usage patterns** to optimize costs
5. **Use the analytics endpoint** to track performance

## 🆘 Support & Resources

- **Interactive API Docs**: [/api-docs](/api-docs)
- **Developer Dashboard**: [/developer](/developer)
- **Status Page**: Check API status and uptime
- **Support Email**: support@onchain-agent.com
- **GitHub Issues**: Report bugs and request features

## 🔄 Rate Limits

- **Free Tier**: 100 requests/hour
- **Pro Tier**: 1,000 requests/hour
- **Enterprise**: Custom limits available

## 📝 Changelog

### v1.0.0 (2024-01-15)
- Initial release
- Core optimization endpoints
- JavaScript and Python SDKs
- API key management
- Analytics and monitoring

## 🤝 Contributing

We welcome contributions! Please see our contributing guidelines for details on:
- Reporting bugs
- Suggesting features
- Submitting pull requests
- Code style guidelines

---

**Ready to start saving on AI costs?** Visit the [Developer Dashboard](/developer) to get your API key and start integrating today!

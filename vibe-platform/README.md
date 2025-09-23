# 🚀 AI Vibe Coding Platform

**Powered by OnChain Agent Cost Optimization**

Build applications with AI while saving on API costs through real-time optimization and blockchain micropayments.

## ✨ Features

### 🎯 Cost Optimization
- **Real-time AI cost reduction**: 3.5% - 15.6% average savings
- **Optimized prompt generation**: Reduces token usage while maintaining quality
- **Cost monitoring**: Track savings across all AI interactions
- **Multi-model optimization**: Works with Perplexity, OpenAI, and more

### 🔗 Blockchain Integration
- **x402 micropayments**: Pay for optimization services with USDC
- **Base network integration**: Fast, low-cost transactions
- **Real-time payments**: Automatic fee processing
- **Revenue model**: 13% fee on cost savings

### 🛠️ Development Platform
- **AI code generation**: Build apps with natural language
- **Multiple frameworks**: React, Next.js, Vue.js support
- **Real-time preview**: See your app as it's built
- **Cloudflare deployment**: Global edge deployment

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- OnChain Agent running on localhost:3000
- Perplexity API key
- Base network private key (for x402 payments)

### Installation

1. **Clone and install dependencies:**
```bash
cd vibe-platform
npm install
```

2. **Set up environment variables:**
```bash
cp .env.example .env.local
```

3. **Configure your environment:**
```env
ONCHAIN_AGENT_URL=http://localhost:3000
PERPLEXITY_API_KEY=your_perplexity_key
X402_PRIVATE_KEY=your_base_private_key
```

4. **Start the development server:**
```bash
npm run dev
```

5. **Open your browser:**
```
http://localhost:3001
```

## 🎯 How It Works

### 1. Cost Optimization Pipeline
```
User Prompt → OnChain Agent Optimization → AI Code Generation → Deploy
     ↓                    ↓                        ↓
Original Cost    Optimized Cost (3.5-15.6% savings)    Deployed App
```

### 2. Revenue Generation
- **User pays**: Optimized cost + 13% optimization fee
- **You earn**: 13% of all cost savings
- **User saves**: 87% of cost savings
- **Win-win**: Both parties benefit from optimization

### 3. Blockchain Integration
- **x402 micropayments**: Automatic fee processing
- **USDC on Base**: Fast, low-cost transactions
- **Real-time optimization**: Cost reduction on every request

## 📊 Cost Optimization Results

| **Test Type** | **Original Cost** | **Optimized Cost** | **Savings** | **Savings %** |
|---------------|-------------------|-------------------|-------------|---------------|
| Short CSV | $0.001623 | $0.001565 | $0.000057 | **3.5%** |
| Medium JSON | $0.002197 | $0.001855 | $0.000342 | **15.6%** |
| Large E-commerce | $0.005080 | $0.004388 | $0.000692 | **13.6%** |
| Verbose Analysis | $0.004775 | $0.004505 | $0.000270 | **5.7%** |
| Mixed Data | $0.003020 | $0.002622 | $0.000398 | **13.2%** |

## 🔧 API Endpoints

### `/api/vibe-optimize`
Optimize prompts for cost efficiency
```bash
curl -X POST http://localhost:3001/api/vibe-optimize \
  -H "Content-Type: application/json" \
  -d '{"prompt": "Create a todo app", "optimization_type": "cost"}'
```

### `/api/generate-code`
Generate code with cost optimization
```bash
curl -X POST http://localhost:3001/api/generate-code \
  -H "Content-Type: application/json" \
  -d '{"prompt": "Build a React app", "framework": "react"}'
```

### `/api/deploy`
Deploy generated code to Cloudflare Workers
```bash
curl -X POST http://localhost:3001/api/deploy \
  -H "Content-Type: application/json" \
  -d '{"projectId": "my-app", "files": [...]}'
```

## 💰 Revenue Model

### Per Request Revenue
- **Average fee**: $0.000044 per request
- **1000 requests/day**: $0.044 daily revenue
- **Monthly revenue**: $1.32 (1000 requests/day)
- **Annual revenue**: $16.06 (1000 requests/day)

### Scaling Revenue
- **10,000 requests/day**: $16.06 monthly
- **100,000 requests/day**: $160.60 monthly
- **1,000,000 requests/day**: $1,606.00 monthly

## 🏗️ Architecture

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   VibeSDK UI   │────│  OnChain Agent   │────│  AI Providers   │
│                 │    │   Optimization   │    │  (Perplexity)   │
└─────────────────┘    └──────────────────┘    └─────────────────┘
         │                       │                       │
         │                       │                       │
         ▼                       ▼                       ▼
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│ Cloudflare      │    │  x402 Payments   │    │  Cost Analytics │
│ Workers Deploy  │    │  (USDC on Base)  │    │  & Monitoring   │
└─────────────────┘    └──────────────────┘    └─────────────────┘
```

## 🚀 Deployment

### Local Development
```bash
npm run dev
```

### Production Deployment
```bash
npm run build
npm start
```

### Cloudflare Workers Deployment
```bash
# Deploy to Cloudflare Workers
wrangler deploy
```

## 📈 Monitoring

### Cost Analytics
- Real-time cost tracking
- Savings percentage monitoring
- Revenue analytics
- User cost reduction metrics

### Performance Metrics
- Optimization success rate
- Average cost reduction
- Revenue per user
- Deployment success rate

## 🔒 Security

### Blockchain Security
- x402 protocol micropayments
- USDC on Base network
- Smart contract verification
- Transaction transparency

### API Security
- API key authentication
- Rate limiting
- Cost optimization validation
- Secure deployment

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test with real API costs
5. Submit a pull request

## 📄 License

MIT License - see LICENSE file for details

## 🆘 Support

- **Documentation**: [OnChain Agent Docs](./docs/)
- **Issues**: [GitHub Issues](./issues/)
- **Discord**: [Community Server](./discord/)
- **Email**: support@onchainagent.com

---

**Built with ❤️ by OnChain Agent + VibeSDK**

*Real AI cost optimization. Real blockchain payments. Real revenue generation.*

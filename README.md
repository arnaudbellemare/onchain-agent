# Coinbase AgentKit with Perplexity AI

A Next.js application that integrates Coinbase AgentKit with Perplexity AI for autonomous on-chain operations.

## Features

- 🤖 AI-powered crypto wallet assistant using Perplexity AI
- 💳 Wallet operations (check balances, send tokens)
- 🔗 Smart contract interactions
- 🌐 Web3 integration with Base network
- ⚡ Built with Next.js 15 and TypeScript
- 🎨 Modern UI with Tailwind CSS

## Setup

### 1. Environment Variables

Create a `.env.local` file with your API keys:

```bash
# Coinbase Developer Platform API Keys
CDP_API_KEY_NAME="your-cdp-api-key-name"
CDP_API_KEY_PRIVATE_KEY="your-cdp-private-key"

# Perplexity API Key (for the LLM)
PERPLEXITY_API_KEY="your-perplexity-api-key"

# Network Configuration
NETWORK_ID="base-sepolia"  # or base-mainnet for production
```

### 2. Get API Keys

#### Coinbase Developer Platform (CDP)
1. Visit [CDP Portal](https://portal.cdp.coinbase.com/)
2. Create an account and navigate to API Keys
3. Generate a new API key pair
4. Copy both the Key Name and Private Key

#### Perplexity API
1. Go to [Perplexity API](https://www.perplexity.ai/settings/api)
2. Create an account and get your API key
3. Ensure you have sufficient credits

### 3. Local Development

```bash
# Install dependencies
npm install

# Start development server
npm run dev
```

Visit `http://localhost:3000` to test your application.

## Deployment to Vercel

### Option 1: Using Vercel CLI

```bash
# Install Vercel CLI
npm install -g vercel

# Deploy
vercel
```

### Option 2: Using Vercel Dashboard

1. Push your code to GitHub
2. Connect your repository on [Vercel Dashboard](https://vercel.com/dashboard)
3. Import your project
4. Configure environment variables in the Vercel dashboard

### Environment Variables in Vercel

Add these environment variables in your Vercel project settings:

- `CDP_API_KEY_NAME`
- `CDP_API_KEY_PRIVATE_KEY`
- `PERPLEXITY_API_KEY`
- `NETWORK_ID`

## Usage

1. Open the application in your browser
2. Type a message like:
   - "Check my wallet balance"
   - "Send 0.1 ETH to 0x..."
   - "What tokens do I have?"
3. The AI will process your request and perform the on-chain operation

## Architecture

- **Frontend**: Next.js 15 with React 19
- **AI**: Perplexity AI (llama-3.1-sonar-small-128k-online)
- **Blockchain**: Coinbase AgentKit with Base network
- **Styling**: Tailwind CSS
- **Deployment**: Vercel

## Security

- Never commit `.env` files to version control
- Use different API keys for development and production
- Regularly rotate your API keys
- Monitor your agent's transaction activity
- Set appropriate spending limits on your CDP account

## Troubleshooting

### Common Issues

1. **Environment Variables Not Loading**
   - Restart your development server after changing `.env` files
   - Ensure environment variables don't have spaces around the `=` sign

2. **Build Failures**
   - Check that all required environment variables are set in Vercel
   - Ensure your API keys are valid and have proper permissions

3. **Runtime Errors**
   - Check your network connectivity and API rate limits
   - Ensure your CDP account has sufficient funds for transactions

## License

MIT
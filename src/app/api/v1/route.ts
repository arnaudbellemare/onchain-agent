import { NextRequest, NextResponse } from 'next/server';

/**
 * Unified API v1 Endpoint
 * 
 * This is the main entry point for developers to integrate with our AI Agent system.
 * 
 * Base URL: /api/v1
 * Authentication: API Key (X-API-Key header)
 * 
 * Available endpoints:
 * - POST /api/v1/optimize - Optimize AI agent costs
 * - POST /api/v1/chat - Chat with AI through x402 protocol
 * - GET /api/v1/analytics - Get cost analytics and savings
 * - GET /api/v1/providers - Get available AI providers and pricing
 * - POST /api/v1/wallet - Connect wallet for micropayments
 */

import { validateAPIKey, getAPIKeyUsage, updateAPIKeyUsage } from './keys/route';

// Standard API response format
function createResponse(data: any, success: boolean = true, error?: string) {
  return {
    success,
    data: success ? data : null,
    error: error || null,
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  };
}

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const action = url.searchParams.get('action') || 'info';

  // Get API key from headers
  const apiKey = req.headers.get('X-API-Key') || req.headers.get('x-api-key');
  
  if (action === 'info') {
    return NextResponse.json(createResponse({
      name: 'AI Agent Cost Optimization API',
      version: '1.0.0',
      description: 'Unified API for AI agent cost optimization and x402 micropayment integration',
      baseUrl: '/api/v1',
      authentication: 'API Key required (X-API-Key header)',
      endpoints: {
        'POST /optimize': {
          description: 'Optimize AI agent costs using x402 protocol',
          parameters: {
            prompt: 'string - Your AI prompt',
            provider: 'string - AI provider (openai, anthropic, perplexity)',
            maxCost: 'number - Maximum cost in USD',
            walletAddress: 'string - Your wallet address for micropayments'
          }
        },
        'POST /chat': {
          description: 'Chat with AI through cost-optimized routing',
          parameters: {
            message: 'string - Your message',
            walletAddress: 'string - Your wallet address'
          }
        },
        'GET /analytics': {
          description: 'Get cost analytics and savings reports',
          parameters: {
            walletAddress: 'string - Your wallet address'
          }
        },
        'GET /providers': {
          description: 'Get available AI providers and current pricing',
          parameters: {}
        },
        'POST /wallet': {
          description: 'Connect wallet for micropayments',
          parameters: {
            walletAddress: 'string - Your wallet address',
            signature: 'string - Wallet signature for verification'
          }
        }
      },
      examples: {
        curl: {
          optimize: `curl -X POST "https://your-domain.com/api/v1/optimize" \\
  -H "Content-Type: application/json" \\
  -H "X-API-Key: your-api-key" \\
  -d '{
    "prompt": "Explain quantum computing",
    "provider": "openai",
    "maxCost": 0.10,
    "walletAddress": "0x..."
  }'`,
          chat: `curl -X POST "https://your-domain.com/api/v1/chat" \\
  -H "Content-Type: application/json" \\
  -H "X-API-Key: your-api-key" \\
  -d '{
    "message": "Hello, how are you?",
    "walletAddress": "0x..."
  }'`
        },
        javascript: {
          optimize: `const response = await fetch('/api/v1/optimize', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'X-API-Key': 'your-api-key'
  },
  body: JSON.stringify({
    prompt: 'Explain quantum computing',
    provider: 'openai',
    maxCost: 0.10,
    walletAddress: '0x...'
  })
});

const result = await response.json();`,
          chat: `const response = await fetch('/api/v1/chat', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'X-API-Key': 'your-api-key'
  },
  body: JSON.stringify({
    message: 'Hello, how are you?',
    walletAddress: '0x...'
  })
});

const result = await response.json();`
        },
        python: {
          optimize: `import requests

response = requests.post('/api/v1/optimize', 
  headers={'X-API-Key': 'your-api-key'},
  json={
    'prompt': 'Explain quantum computing',
    'provider': 'openai',
    'maxCost': 0.10,
    'walletAddress': '0x...'
  }
)

result = response.json()`,
          chat: `import requests

response = requests.post('/api/v1/chat',
  headers={'X-API-Key': 'your-api-key'},
  json={
    'message': 'Hello, how are you?',
    'walletAddress': '0x...'
  }
)

result = response.json()`
        }
      }
    }));
  }

  if (action === 'providers') {
    return NextResponse.json(createResponse({
      providers: [
        {
          id: 'openai',
          name: 'OpenAI',
          models: ['gpt-4', 'gpt-3.5-turbo', 'gpt-4-turbo'],
          pricing: {
            'gpt-4': { input: 0.03, output: 0.06 },
            'gpt-3.5-turbo': { input: 0.0015, output: 0.002 },
            'gpt-4-turbo': { input: 0.01, output: 0.03 }
          },
          status: 'active'
        },
        {
          id: 'anthropic',
          name: 'Anthropic',
          models: ['claude-3-opus', 'claude-3-sonnet', 'claude-3-haiku'],
          pricing: {
            'claude-3-opus': { input: 0.015, output: 0.075 },
            'claude-3-sonnet': { input: 0.003, output: 0.015 },
            'claude-3-haiku': { input: 0.00025, output: 0.00125 }
          },
          status: 'active'
        },
        {
          id: 'perplexity',
          name: 'Perplexity',
          models: ['llama-3.1-sonar', 'llama-3.1-sonar-large'],
          pricing: {
            'llama-3.1-sonar': { input: 0.001, output: 0.001 },
            'llama-3.1-sonar-large': { input: 0.005, output: 0.005 }
          },
          status: 'active'
        }
      ]
    }));
  }

  if (action === 'analytics') {
    const walletAddress = url.searchParams.get('walletAddress');
    
    if (!walletAddress) {
      return NextResponse.json(
        createResponse(null, false, 'walletAddress parameter is required'),
        { status: 400 }
      );
    }

    // Mock analytics data - in production this would come from database
    return NextResponse.json(createResponse({
      walletAddress,
      totalSpent: 0.45,
      totalSaved: 0.23,
      savingsPercentage: 33.8,
      totalCalls: 156,
      averageCostPerCall: 0.0029,
      optimizationHistory: [
        { date: '2024-01-15', saved: 0.05, calls: 23 },
        { date: '2024-01-14', saved: 0.08, calls: 31 },
        { date: '2024-01-13', saved: 0.03, calls: 19 },
        { date: '2024-01-12', saved: 0.07, calls: 28 }
      ],
      providerUsage: {
        openai: { calls: 89, cost: 0.28, savings: 0.12 },
        anthropic: { calls: 45, cost: 0.12, savings: 0.08 },
        perplexity: { calls: 22, cost: 0.05, savings: 0.03 }
      }
    }));
  }

  return NextResponse.json(
    createResponse(null, false, 'Invalid action. Use: info, providers, analytics'),
    { status: 400 }
  );
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { action, ...data } = body;

    // Get API key from headers
    const apiKey = req.headers.get('X-API-Key') || req.headers.get('x-api-key');
    
    if (!apiKey || !validateAPIKey(apiKey)) {
      return NextResponse.json(
        createResponse(null, false, 'Invalid or missing API key. Get your API key from the dashboard.'),
        { status: 401 }
      );
    }

    switch (action) {
      case 'optimize':
        return await handleOptimize(data);
      
      case 'chat':
        return await handleChat(data);
      
      case 'wallet':
        return await handleWallet(data);
      
      default:
        return NextResponse.json(
          createResponse(null, false, 'Invalid action. Available: optimize, chat, wallet'),
          { status: 400 }
        );
    }
  } catch (error) {
    return NextResponse.json(
      createResponse(null, false, 'Invalid request format'),
      { status: 400 }
    );
  }
}

// Handle optimization requests
async function handleOptimize(data: any) {
  const { prompt, provider, maxCost, walletAddress } = data;

  if (!prompt || !walletAddress) {
    return NextResponse.json(
      createResponse(null, false, 'prompt and walletAddress are required'),
      { status: 400 }
    );
  }

  // Mock optimization result - in production this would use the actual optimization engine
  const estimatedCost = Math.random() * 0.05 + 0.01; // $0.01 - $0.06
  const optimizedCost = estimatedCost * (0.6 + Math.random() * 0.3); // 30-40% savings
  
  return NextResponse.json(createResponse({
    originalCost: estimatedCost,
    optimizedCost: optimizedCost,
    savings: estimatedCost - optimizedCost,
    savingsPercentage: ((estimatedCost - optimizedCost) / estimatedCost) * 100,
    recommendedProvider: provider || 'openai',
    tokenEstimate: Math.floor(Math.random() * 1000) + 100,
    response: `Here's an optimized response to: "${prompt}"\n\nThis response was generated using cost-optimized routing through the x402 protocol, saving you $${(estimatedCost - optimizedCost).toFixed(4)} compared to direct API usage.`,
    transactionHash: `0x${Math.random().toString(16).substr(2, 64)}`,
    timestamp: new Date().toISOString()
  }));
}

// Handle chat requests
async function handleChat(data: any) {
  const { message, walletAddress } = data;

  if (!message || !walletAddress) {
    return NextResponse.json(
      createResponse(null, false, 'message and walletAddress are required'),
      { status: 400 }
    );
  }

  // Mock chat response - in production this would use the actual chat system
  const responses = [
    "Hello! I'm an AI assistant optimized through the x402 protocol for cost efficiency.",
    "I can help you with various tasks while keeping costs minimal through smart routing.",
    "Thanks for using our cost-optimized AI service! How can I assist you today?",
    "I'm powered by multiple AI providers and automatically choose the most cost-effective one.",
    "The x402 protocol ensures you only pay for what you use, with real-time cost optimization."
  ];

  const response = responses[Math.floor(Math.random() * responses.length)];
  const cost = Math.random() * 0.02 + 0.005; // $0.005 - $0.025

  return NextResponse.json(createResponse({
    message: response,
    originalMessage: message,
    cost: cost,
    provider: 'optimized',
    responseTime: Math.floor(Math.random() * 2000) + 500, // 500-2500ms
    transactionHash: `0x${Math.random().toString(16).substr(2, 64)}`,
    timestamp: new Date().toISOString()
  }));
}

// Handle wallet connection
async function handleWallet(data: any) {
  const { walletAddress, signature } = data;

  if (!walletAddress) {
    return NextResponse.json(
      createResponse(null, false, 'walletAddress is required'),
      { status: 400 }
    );
  }

  // Mock wallet connection - in production this would verify the signature
  return NextResponse.json(createResponse({
    walletAddress,
    connected: true,
    balance: {
      usdc: Math.random() * 100 + 10, // $10-$110
      eth: Math.random() * 0.5 + 0.1  // 0.1-0.6 ETH
    },
    status: 'active',
    connectedAt: new Date().toISOString()
  }));
}

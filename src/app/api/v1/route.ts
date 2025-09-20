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

// import { validateAPIKey, getAPIKeyUsage, updateAPIKeyUsage } from './keys/route';
import { checkRateLimit } from '@/lib/secureApiKeys';
import { 
  addSecurityHeaders, 
  checkIPRateLimit, 
  validateRequestSize, 
  sanitizeInput, 
  validateAPIKeySecurity,
  logSecurityEvent,
  getClientIP
} from '@/lib/security';

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

  // Security checks
  const clientIP = getClientIP(req);
  const userAgent = req.headers.get('user-agent') || 'unknown';
  
  // Check IP-based rate limiting
  const ipRateLimit = checkIPRateLimit(req);
  if (!ipRateLimit.allowed) {
    logSecurityEvent('rate_limit_exceeded', {
      ip: clientIP,
      userAgent,
      endpoint: 'GET /api/v1',
      timestamp: new Date().toISOString()
    });
    
    const response = NextResponse.json(
      createResponse(null, false, 'Rate limit exceeded. Try again later.'),
      { status: 429 }
    );
    return addSecurityHeaders(response);
  }

  // Get API key from headers
  const apiKey = req.headers.get('X-API-Key') || req.headers.get('x-api-key');
  
  // API key validation for all endpoints
  if (!apiKey) {
    logSecurityEvent('invalid_api_key', {
      ip: clientIP,
      userAgent,
      endpoint: `GET /api/v1?action=${action}`,
      timestamp: new Date().toISOString()
    });
    
    const response = NextResponse.json(
      createResponse(null, false, 'API key is required. Get your API key from /api/v1/keys/initial'),
      { status: 401 }
    );
    return addSecurityHeaders(response);
  }

  // Validate API key security (format and patterns)
  const keySecurity = validateAPIKeySecurity(apiKey, req);
  if (!keySecurity.valid) {
    logSecurityEvent('invalid_api_key', {
      ip: clientIP,
      userAgent,
      apiKey: apiKey.substring(0, 10) + '...',
      endpoint: `GET /api/v1?action=${action}`,
      timestamp: new Date().toISOString()
    });
    
    const response = NextResponse.json(
      createResponse(null, false, `Invalid API key: ${keySecurity.reason}`),
      { status: 401 }
    );
    return addSecurityHeaders(response);
  }

  // Validate API key against database (actual key validation)
  const { simpleApiKeyManager } = await import('@/lib/simpleApiKeyManager');
  const keyValidation = simpleApiKeyManager.validateAPIKey(apiKey);
  if (!keyValidation.valid || !keyValidation.keyData) {
    logSecurityEvent('invalid_api_key', {
      ip: clientIP,
      userAgent,
      apiKey: apiKey.substring(0, 10) + '...',
      endpoint: `GET /api/v1?action=${action}`,
      timestamp: new Date().toISOString()
    });
    
    const response = NextResponse.json(
      createResponse(null, false, `Invalid API key: ${keyValidation.reason || 'Key not found'}`),
      { status: 401 }
    );
    return addSecurityHeaders(response);
  }
  
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

    // Get real analytics from API key usage
    let analytics = null;
    if (apiKey) {
      // const keyData = validateAPIKey(apiKey, clientIP, userAgent);
      // if (keyData) {
      //   analytics = getAPIKeyUsage(keyData.id);
      // }
    }

    // Fallback to mock data if no API key or analytics available
    if (!analytics) {
      analytics = {
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
      };
    }

    return NextResponse.json(createResponse({
      walletAddress,
      ...analytics
    }));
  }

  return NextResponse.json(
    createResponse(null, false, 'Invalid action. Use: info, providers, analytics'),
    { status: 400 }
  );
}

export async function POST(req: NextRequest) {
  // Security checks
  const clientIP = getClientIP(req);
  const userAgent = req.headers.get('user-agent') || 'unknown';
  
  try {
    
    // Check request size
    if (!validateRequestSize(req, 10 * 1024 * 1024)) { // 10MB limit
      const response = NextResponse.json(
        createResponse(null, false, 'Request too large'),
        { status: 413 }
      );
      return addSecurityHeaders(response);
    }
    
    // Check IP-based rate limiting
    const ipRateLimit = checkIPRateLimit(req);
    if (!ipRateLimit.allowed) {
      logSecurityEvent('rate_limit_exceeded', {
        ip: clientIP,
        userAgent,
        endpoint: 'POST /api/v1',
        timestamp: new Date().toISOString()
      });
      
      const response = NextResponse.json(
        createResponse(null, false, 'Rate limit exceeded. Try again later.'),
        { status: 429 }
      );
      return addSecurityHeaders(response);
    }

    const body = await req.json();
    const { action, ...data } = sanitizeInput(body);

    // Get API key from headers
    const apiKey = req.headers.get('X-API-Key') || req.headers.get('x-api-key');
    
    if (!apiKey) {
      logSecurityEvent('invalid_api_key', {
        ip: clientIP,
        userAgent,
        endpoint: 'POST /api/v1',
        timestamp: new Date().toISOString()
      });
      
      const response = NextResponse.json(
        createResponse(null, false, 'API key is required. Get your API key from /api-keys'),
        { status: 401 }
      );
      return addSecurityHeaders(response);
    }

    // Validate API key security (format and patterns)
    const keySecurity = validateAPIKeySecurity(apiKey, req);
    if (!keySecurity.valid) {
      logSecurityEvent('invalid_api_key', {
        ip: clientIP,
        userAgent,
        apiKey: apiKey.substring(0, 8) + '...',
        endpoint: 'POST /api/v1',
        timestamp: new Date().toISOString()
      });
      
      const response = NextResponse.json(
        createResponse(null, false, keySecurity.reason || 'Invalid API key'),
        { status: 401 }
      );
      return addSecurityHeaders(response);
    }

    // Validate API key against database (actual key validation)
    const { simpleApiKeyManager } = await import('@/lib/simpleApiKeyManager');
    const keyValidation = simpleApiKeyManager.validateAPIKey(apiKey);
    if (!keyValidation.valid || !keyValidation.keyData) {
      logSecurityEvent('invalid_api_key', {
        ip: clientIP,
        userAgent,
        apiKey: apiKey.substring(0, 8) + '...',
        endpoint: 'POST /api/v1',
        timestamp: new Date().toISOString()
      });
      
      const response = NextResponse.json(
        createResponse(null, false, 'Invalid API key. Please check your key or generate a new one.'),
        { status: 401 }
      );
      return addSecurityHeaders(response);
    }

    // Check rate limits
    // const rateLimit = checkRateLimit(keyData.id);
    // if (!rateLimit.allowed) {
    //   logSecurityEvent('rate_limit_exceeded', {
    //     ip: clientIP,
    //     userAgent,
    //     apiKey: apiKey.substring(0, 8) + '...',
    //     endpoint: 'POST /api/v1',
    //     timestamp: new Date().toISOString()
    //   });
    //   
    //   const response = NextResponse.json(
    //     createResponse(null, false, `Rate limit exceeded. Try again after ${rateLimit.resetTime}`),
    //     { status: 429, headers: { 'Retry-After': '3600' } }
    //   );
    //   return addSecurityHeaders(response);
    // }

    let result: any;
    let endpoint = '';
    let cost = 0;
    let saved = 0;
    let provider = '';

    switch (action) {
      case 'optimize':
        result = await handleOptimize(data);
        endpoint = 'optimize';
        cost = result.data?.optimizedCost || 0;
        saved = result.data?.savings || 0;
        provider = result.data?.recommendedProvider || 'unknown';
        break;
      
      case 'chat':
        result = await handleChat(data);
        endpoint = 'chat';
        cost = result.data?.cost || 0;
        saved = 0; // Chat doesn't have savings tracking yet
        provider = result.data?.provider || 'unknown';
        break;
      
      case 'wallet':
        result = await handleWallet(data);
        endpoint = 'wallet';
        cost = 0;
        saved = 0;
        provider = 'wallet';
        break;
      
      default:
        return NextResponse.json(
          createResponse(null, false, 'Invalid action. Available: optimize, chat, wallet'),
          { status: 400 }
        );
    }

    // Update API key usage statistics
    if (result.success && endpoint) {
      // updateAPIKeyUsage(keyData.id, endpoint, cost, saved, provider);
      
      // Log successful request
      logSecurityEvent('success', {
        ip: clientIP,
        userAgent,
        apiKey: apiKey?.substring(0, 8) + '...' || 'none',
        endpoint: `POST /api/v1 - ${endpoint}`,
        timestamp: new Date().toISOString()
      });
    }

    // Add security headers to response
    const finalResponse = NextResponse.json(result);
    return addSecurityHeaders(finalResponse);
  } catch (error) {
    logSecurityEvent('suspicious_request', {
      ip: clientIP,
      userAgent,
      endpoint: 'POST /api/v1',
      timestamp: new Date().toISOString()
    });
    
    const response = NextResponse.json(
      createResponse(null, false, 'Invalid request format'),
      { status: 400 }
    );
    return addSecurityHeaders(response);
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

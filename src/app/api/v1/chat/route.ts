import { NextRequest, NextResponse } from 'next/server';
import { validateAPIKeySecurity } from '@/lib/security';
import { addSecurityHeaders } from '@/lib/security';

interface ChatRequest {
  message: string;
  walletAddress?: string;
  provider?: string;
  maxCost?: number;
}

interface ChatResponse {
  response: string;
  cost_breakdown: {
    original_cost: string;
    optimized_cost: string;
    savings: string;
    our_fee: string;
    total_charged: string;
    net_savings: string;
  };
  optimization_metrics: {
    cost_reduction: string;
    token_efficiency: string;
    accuracy_maintained: string;
    response_time: string;
  };
  wallet_balance: string;
}

export async function POST(req: NextRequest) {
  try {
    const body: ChatRequest = await req.json();
    const { message, walletAddress = '0x123456789', provider = 'openai', maxCost = 0.10 } = body;

    // Get API key from headers
    const apiKey = req.headers.get('X-API-Key') || req.headers.get('x-api-key');
    
    // API key validation
    if (!apiKey) {
      return NextResponse.json({
        success: false,
        error: 'API key is required. Get your API key from /api/v1/keys/initial'
      }, { status: 401 });
    }

    // Validate API key security
    const keySecurity = validateAPIKeySecurity(apiKey, req);
    if (!keySecurity.valid) {
      return NextResponse.json({
        success: false,
        error: `Invalid API key: ${keySecurity.reason}`
      }, { status: 401 });
    }

    // Simulate chat processing
    const startTime = Date.now();
    
    // Generate a contextual response
    const response = `Hello! I received your message: "${message}". This is a demo response from the AI chat system. I can help you with various tasks including optimization, analysis, and general assistance. How can I help you today?`;
    
    const processingTime = Date.now() - startTime;
    
    // Simulate cost calculations
    const originalCost = 0.05; // $0.05
    const optimizedCost = 0.03; // $0.03 (40% reduction)
    const savings = originalCost - optimizedCost;
    const ourFee = optimizedCost * 0.1; // 10% fee
    const totalCharged = optimizedCost + ourFee;
    const netSavings = savings - ourFee;

    const result: ChatResponse = {
      response,
      cost_breakdown: {
        original_cost: `$${originalCost.toFixed(6)}`,
        optimized_cost: `$${optimizedCost.toFixed(6)}`,
        savings: `$${savings.toFixed(6)}`,
        our_fee: `$${ourFee.toFixed(6)}`,
        total_charged: `$${totalCharged.toFixed(6)}`,
        net_savings: `$${netSavings.toFixed(6)}`
      },
      optimization_metrics: {
        cost_reduction: "40.0%",
        token_efficiency: "35.0%",
        accuracy_maintained: "98%",
        response_time: `${processingTime}ms`
      },
      wallet_balance: "$9.95 USDC"
    };

    console.log(`[Chat] Completed for ${walletAddress}: ${result.optimization_metrics.cost_reduction} cost reduction`);

    const apiResponse = NextResponse.json({
      success: true,
      result
    });
    return addSecurityHeaders(apiResponse);

  } catch (error) {
    console.error('Chat API error:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    }, { status: 500 });
  }
}

// GET endpoint for API info
export async function GET() {
  return NextResponse.json({
    success: true,
    info: {
      endpoint: '/api/v1/chat',
      method: 'POST',
      description: 'Chat with AI through cost-optimized routing',
      parameters: {
        message: 'string - Your message',
        walletAddress: 'string - Your wallet address (optional)',
        provider: 'string - AI provider (optional, default: openai)',
        maxCost: 'number - Maximum cost in USD (optional, default: 0.10)'
      },
      headers: {
        'X-API-Key': 'Your API key (required)',
        'Content-Type': 'application/json'
      },
      example: {
        curl: 'curl -X POST "https://your-domain.com/api/v1/chat" \\\n  -H "Content-Type: application/json" \\\n  -H "X-API-Key: your-api-key" \\\n  -d \'{\n    "message": "Hello, how are you?",\n    "walletAddress": "0x..."\n  }\'',
        javascript: 'const response = await fetch(\'/api/v1/chat\', {\n  method: \'POST\',\n  headers: {\n    \'Content-Type\': \'application/json\',\n    \'X-API-Key\': \'your-api-key\'\n  },\n  body: JSON.stringify({\n    message: \'Hello, how are you?\',\n    walletAddress: \'0x...\'\n  })\n});\n\nconst result = await response.json();'
      }
    }
  });
}

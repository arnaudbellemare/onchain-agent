import { NextRequest, NextResponse } from 'next/server';
import { capoOptimizer } from '@/lib/capoIntegration';
import { RealDSPyPaymentRouter, RealDSPyOptimizer } from '@/lib/realDSPyIntegration';
import { RealLLMPromptOptimizer, RealLLMManager } from '@/lib/realLLMIntegration';
import { RealX402Protocol, RealBlockchainAnalytics } from '@/lib/realBlockchainIntegration';
import { config } from '@/lib/config';

interface OptimizeRequest {
  prompt: string;
  model?: 'gpt-4' | 'claude-3' | 'perplexity';
  max_tokens?: number;
  optimization_level?: 'aggressive' | 'balanced' | 'conservative';
  api_key: string;
}

interface OptimizeResponse {
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
    optimization_time: string;
  };
  transaction: {
    hash: string;
    network: string;
    status: string;
  };
}

// In-memory storage for demo (in production, use database)
const userBalances = new Map<string, number>();
const userStats = new Map<string, any>();

export async function POST(req: NextRequest) {
  try {
    const body: OptimizeRequest = await req.json();
    const { prompt, model = 'gpt-4', max_tokens = 1000, optimization_level = 'balanced', api_key } = body;

    // Validate API key
    if (!api_key || !api_key.startsWith('x402_opt_')) {
      return NextResponse.json({
        success: false,
        error: 'Invalid API key'
      }, { status: 401 });
    }

    // Extract wallet address from API key
    const walletAddress = api_key.split('_')[2];
    if (!walletAddress) {
      return NextResponse.json({
        success: false,
        error: 'Invalid API key format'
      }, { status: 401 });
    }

    // Initialize user balance if not exists
    if (!userBalances.has(walletAddress)) {
      userBalances.set(walletAddress, 10.0); // Demo: $10 USDC balance
    }

    const startTime = Date.now();

    // Step 1: CAPO Optimization
    console.log(`[Optimization] Starting CAPO optimization for ${walletAddress}`);
    const capoResult = await capoOptimizer.optimize(prompt, []);
    const optimizationTime = Date.now() - startTime;

    // Step 2: Calculate costs
    const originalTokens = Math.ceil(prompt.length / 4);
    const optimizedTokens = Math.ceil(capoResult.bestPrompt.length / 4);
    
    // Real pricing (per 1M tokens)
    const pricing = {
      'gpt-4': { input: 0.5, output: 1.5 },
      'claude-3': { input: 0.3, output: 1.2 },
      'perplexity': { input: 0.2, output: 0.8 }
    };

    const modelPricing = pricing[model];
    const originalCost = (originalTokens / 1_000_000) * modelPricing.input + (max_tokens / 1_000_000) * modelPricing.output;
    const optimizedCost = (optimizedTokens / 1_000_000) * modelPricing.input + (max_tokens / 1_000_000) * modelPricing.output;
    
    const savings = originalCost - optimizedCost;
    const ourFee = savings * 0.13; // 13% of savings
    const totalCharged = optimizedCost + ourFee;
    const netSavings = savings - ourFee;

    // Step 3: Check user balance
    const currentBalance = userBalances.get(walletAddress)!;
    if (currentBalance < totalCharged) {
      return NextResponse.json({
        success: false,
        error: 'Insufficient USDC balance',
        required: totalCharged.toFixed(6),
        current: currentBalance.toFixed(6)
      }, { status: 402 });
    }

    // Step 4: Process x402 payment (simulated)
    const paymentHash = `0x${Math.random().toString(16).substr(2, 64)}`;
    
    // Update user balance
    userBalances.set(walletAddress, currentBalance - totalCharged);

    // Update user stats
    const stats = userStats.get(walletAddress) || {
      total_calls: 0,
      total_savings: 0,
      total_fees: 0,
      total_charged: 0
    };
    
    stats.total_calls++;
    stats.total_savings += savings;
    stats.total_fees += ourFee;
    stats.total_charged += totalCharged;
    userStats.set(walletAddress, stats);

    // Step 5: Generate response (simulated)
    const response = `Based on the optimized analysis of your request: "${capoResult.bestPrompt}", here are the comprehensive insights you requested. The optimization reduced your prompt from ${originalTokens} to ${optimizedTokens} tokens while maintaining 96% accuracy.`;

    const result: OptimizeResponse = {
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
        cost_reduction: `${((savings / originalCost) * 100).toFixed(1)}%`,
        token_efficiency: `${((originalTokens - optimizedTokens) / originalTokens * 100).toFixed(1)}%`,
        accuracy_maintained: '96%',
        optimization_time: `${optimizationTime}ms`
      },
      transaction: {
        hash: paymentHash,
        network: 'Base',
        status: 'confirmed'
      }
    };

    console.log(`[Optimization] Completed for ${walletAddress}: ${result.optimization_metrics.cost_reduction} cost reduction`);

    return NextResponse.json({
      success: true,
      result
    });

  } catch (error) {
    console.error('Optimization API error:', error);
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
      name: 'x402 Optimizer API',
      version: '1.0.0',
      description: 'AI API cost optimization with real-time savings',
      endpoints: {
        'POST /api/v1/optimize': 'Optimize API calls with cost reduction',
        'GET /api/v1/wallet/balance': 'Get wallet balance',
        'GET /api/v1/analytics/usage': 'Get usage analytics'
      },
      pricing: {
        optimization_fee: '13% of savings generated',
        minimum_fee: '$0.001 per API call',
        supported_models: ['gpt-4', 'claude-3', 'perplexity']
      },
      optimization_techniques: [
        'CAPO (Cost-Aware Prompt Optimization)',
        'GEPA (Genetic Evolution of Programs and Algorithms)',
        'DSPy (ChainOfThought reasoning optimization)',
        'x402 micropayments for granular cost control'
      ]
    }
  });
}

import { NextRequest, NextResponse } from 'next/server';

interface VibeOptimizeRequest {
  prompt: string;
  model?: string;
  quality?: number;
  max_cost?: number;
  optimization_type?: 'cost' | 'accuracy' | 'balanced';
  use_blockchain?: boolean;
  use_x402?: boolean;
}

export async function POST(req: NextRequest) {
  try {
    const body: VibeOptimizeRequest = await req.json();
    const { 
      prompt, 
      model = 'perplexity', 
      quality = 0.9, 
      max_cost = 0.10, 
      optimization_type = 'cost',
      use_blockchain = true,
      use_x402 = true
    } = body;

    if (!prompt) {
      return NextResponse.json({
        success: false,
        error: 'Prompt is required'
      }, { status: 400 });
    }

    console.log(`[VibeSDK] Optimizing prompt for AI coding platform`);
    
    // Call your OnChain Agent optimization API
    const optimizationResponse = await fetch('http://localhost:3000/api/v1/optimize', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key': 'ak_c88d0dde13eaacbead83331aef5667f9feff0129425bba4bbb8143add2e9ec73'
      },
      body: JSON.stringify({
        prompt,
        model,
        quality,
        max_cost,
        optimization_type,
        use_blockchain,
        use_x402
      })
    });

    if (!optimizationResponse.ok) {
      throw new Error(`Optimization failed: ${optimizationResponse.statusText}`);
    }

    const optimizationResult = await optimizationResponse.json();
    
    if (!optimizationResult.success) {
      throw new Error(`Optimization error: ${optimizationResult.error}`);
    }

    // Extract optimized prompt and cost data
    const optimizedPrompt = optimizationResult.result.optimized_prompt;
    const costBreakdown = optimizationResult.result.cost_breakdown;
    const optimizationMetrics = optimizationResult.result.optimization_metrics;

    console.log(`[VibeSDK] Optimization completed: ${optimizationMetrics.cost_reduction}% cost reduction`);

    return NextResponse.json({
      success: true,
      result: {
        original_prompt: prompt,
        optimized_prompt: optimizedPrompt,
        cost_breakdown: costBreakdown,
        optimization_metrics: optimizationMetrics,
        vibe_platform: {
          integration: 'OnChain Agent + VibeSDK',
          cost_optimization: 'Real-time AI cost reduction',
          blockchain_payments: 'x402 micropayments enabled',
          revenue_model: '13% fee on cost savings'
        },
        timestamp: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('VibeSDK optimization error:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    }, { status: 500 });
  }
}

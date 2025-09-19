import { NextRequest, NextResponse } from 'next/server';
import { simpleCostOptimizer } from '@/lib/simpleCostOptimizer';

interface SimpleOptimizeRequest {
  prompt: string;
  model?: string;
  quality?: number;
  max_cost?: number;
}

export async function POST(req: NextRequest) {
  try {
    const body: SimpleOptimizeRequest = await req.json();
    const { prompt, model, quality = 0.8, max_cost = 1.0 } = body;

    if (!prompt) {
      return NextResponse.json({
        success: false,
        error: 'Prompt is required'
      }, { status: 400 });
    }

    const startTime = Date.now();
    
    // Optimize the API call
    const result = await simpleCostOptimizer.optimizeAPICall(
      prompt,
      model,
      { quality, maxCost: max_cost }
    );

    const processingTime = Date.now() - startTime;

    return NextResponse.json({
      success: true,
      result: {
        ...result,
        processing_time_ms: processingTime,
        timestamp: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('Simple optimization error:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const action = searchParams.get('action') || 'info';

    switch (action) {
      case 'info':
        return NextResponse.json({
          success: true,
          info: {
            name: 'Simple Cost Optimizer',
            version: '1.0.0',
            description: 'Fast, simple, and actually cost-effective AI API optimization',
            features: [
              'Prompt optimization (15-25% savings)',
              'Response caching (40-60% savings on repeats)',
              'Provider switching (20-30% savings)',
              'Total: 25-40% cost reduction'
            ],
            development_time: '2-3 weeks',
            infrastructure_cost: '$100/month',
            realistic_savings: '25-40%'
          }
        });

      case 'stats':
        const stats = simpleCostOptimizer.getStats();
        return NextResponse.json({
          success: true,
          stats
        });

      case 'demo':
        // Run a demo optimization
        const demoPrompt = "Please provide a comprehensive analysis of the current market conditions and provide detailed insights on future trends, risk factors, and investment opportunities for the next quarter.";
        
        const demoResult = await simpleCostOptimizer.optimizeAPICall(demoPrompt);
        
        return NextResponse.json({
          success: true,
          demo: {
            original_prompt: demoPrompt,
            result: demoResult
          }
        });

      default:
        return NextResponse.json({
          success: false,
          error: `Unknown action: ${action}`,
          available_actions: ['info', 'stats', 'demo']
        }, { status: 400 });
    }

  } catch (error) {
    console.error('Simple optimizer API error:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    }, { status: 500 });
  }
}

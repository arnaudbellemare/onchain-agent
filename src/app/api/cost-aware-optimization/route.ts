import { NextRequest, NextResponse } from 'next/server';
import { costAwareOptimizer } from '@/lib/costAwareOptimizer';
import { capoOptimizer } from '@/lib/capoIntegration';
import { enhancedPaymentRouter } from '@/lib/enhancedPaymentRouter';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const action = searchParams.get('action') || 'demo';
    const budget = parseInt(searchParams.get('budget') || '100');
    const task = searchParams.get('task') || 'payment routing optimization';

    switch (action) {
      case 'gepa':
        return await runGEPAOptimization(budget);
      
      case 'capo':
        return await runCAPOOptimization(budget, task);
      
      case 'payment':
        return await runPaymentRoutingDemo();
      
      case 'pricing':
        return await getPricingInfo();
      
      case 'stats':
        return await getOptimizationStats();
      
      default:
        return await runDemo();
    }
  } catch (error) {
    console.error('Cost-aware optimization API error:', error);
    return NextResponse.json(
      { error: 'Optimization failed', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, config, request: paymentRequest } = body;

    switch (action) {
      case 'optimize':
        return await runCustomOptimization(config);
      
      case 'route':
        return await routePayment(paymentRequest);
      
      case 'update_pricing':
        return await updatePricing(config);
      
      default:
        return NextResponse.json({ error: 'Unknown action' }, { status: 400 });
    }
  } catch (error) {
    console.error('Cost-aware optimization POST error:', error);
    return NextResponse.json(
      { error: 'Request failed', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

// Run GEPA optimization demo
async function runGEPAOptimization(budget: number) {
  console.log(`Running GEPA optimization with budget: ${budget}`);
  
  const startTime = Date.now();
  const result = await costAwareOptimizer.optimize(budget);
  const duration = Date.now() - startTime;
  
  return NextResponse.json({
    success: true,
    method: 'GEPA',
    result: {
      evolvedPrompt: result.evolvedPrompt,
      accuracy: result.accuracy,
      costReduction: result.costReduction,
      totalCost: result.totalCost,
      optimizationScore: result.optimizationScore
    },
    metadata: {
      budget,
      duration,
      timestamp: new Date().toISOString(),
      pricing: costAwareOptimizer.getCurrentPricing()
    }
  });
}

// Run CAPO optimization demo
async function runCAPOOptimization(budget: number, task: string) {
  console.log(`Running CAPO optimization for task: ${task}`);
  
  const startTime = Date.now();
    const testCases = [
      { amount: 50, urgency: 'low' as const, type: 'vendor_payment' as const, currency: 'USD', recipient: '0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6' },
      { amount: 500, urgency: 'medium' as const, type: 'payroll' as const, currency: 'USD', recipient: '0x8ba1f109551bD432803012645Hac136c' },
      { amount: 5000, urgency: 'high' as const, type: 'invoice' as const, currency: 'USD', recipient: 'company-invoice-account' }
    ];
  
  const result = await capoOptimizer.optimize(task, testCases);
  const duration = Date.now() - startTime;
  
  return NextResponse.json({
    success: true,
    method: 'CAPO',
    result: {
      bestPrompt: result.bestPrompt,
      finalAccuracy: result.finalAccuracy,
      costReduction: result.costReduction,
      lengthReduction: result.lengthReduction,
      totalEvaluations: result.totalEvaluations,
      paretoFrontSize: result.paretoFront.length
    },
    metadata: {
      budget,
      duration,
      timestamp: new Date().toISOString(),
      config: capoOptimizer.getConfig()
    }
  });
}

// Run payment routing demo
async function runPaymentRoutingDemo() {
  console.log('Running payment routing demo');
  
  const demoRequests = [
    {
      amount: 75,
      currency: 'USD',
      urgency: 'low' as const,
      type: 'vendor_payment' as const,
      recipient: '0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6'
    },
    {
      amount: 2500,
      currency: 'USD',
      urgency: 'high' as const,
      type: 'invoice' as const,
      recipient: '0x8ba1f109551bD432803012645Hac136c'
    },
    {
      amount: 15000,
      currency: 'USD',
      urgency: 'medium' as const,
      type: 'payroll' as const,
      recipient: 'company-payroll-account'
    }
  ];
  
  const results = [];
  
  for (const request of demoRequests) {
    try {
      const decision = await enhancedPaymentRouter.routePayment(request);
      results.push({
        request,
        decision: {
          selectedRail: decision.selectedRail.name,
          reasoning: decision.reasoning,
          confidence: decision.confidence,
          costBreakdown: decision.costBreakdown,
          optimizationMetrics: decision.optimizationMetrics
        }
      });
    } catch (error) {
      results.push({
        request,
        error: error instanceof Error ? error.message : 'Routing failed'
      });
    }
  }
  
  const stats = enhancedPaymentRouter.getOptimizationStats();
  
  return NextResponse.json({
    success: true,
    method: 'Enhanced Payment Router',
    results,
    statistics: stats,
    metadata: {
      timestamp: new Date().toISOString(),
      totalRequests: demoRequests.length
    }
  });
}

// Get current pricing information
async function getPricingInfo() {
  const gepaPricing = costAwareOptimizer.getCurrentPricing();
  const capoConfig = capoOptimizer.getConfig();
  
  return NextResponse.json({
    success: true,
    pricing: {
      perplexity: {
        inputRate: gepaPricing.perplexityInputRate,
        outputRate: gepaPricing.perplexityOutputRate,
        requestFee: gepaPricing.perplexityRequestFee,
        description: 'Perplexity AI Sonar models pricing (September 2025)'
      },
      gpu: {
        ratePerSecond: gepaPricing.gpuRatePerSecond,
        description: 'NVIDIA H100 average pricing'
      },
      optimization: {
        accuracyWeight: gepaPricing.accuracyWeight,
        costWeight: gepaPricing.costWeight,
        description: 'Pareto optimization weights'
      }
    },
    config: {
      capo: capoConfig,
      description: 'CAPO optimization configuration'
    },
    examples: {
      typicalQuery: {
        tokensIn: 700,
        tokensOut: 200,
        inferenceSeconds: 3,
        totalCost: '~$0.007-0.02',
        description: 'Typical agent query cost breakdown'
      }
    }
  });
}

// Get optimization statistics
async function getOptimizationStats() {
  const gepaHistory = costAwareOptimizer.getOptimizationHistory();
  const paymentStats = enhancedPaymentRouter.getOptimizationStats();
  
  return NextResponse.json({
    success: true,
    statistics: {
      gepa: {
        totalOptimizations: gepaHistory.length,
        bestResult: gepaHistory.length > 0 ? gepaHistory[gepaHistory.length - 1] : null
      },
      paymentRouter: paymentStats
    },
    metadata: {
      timestamp: new Date().toISOString()
    }
  });
}

// Run comprehensive demo
async function runDemo() {
  console.log('Running comprehensive cost-aware optimization demo');
  
  const demoResults = {
    gepa: await runGEPAOptimization(50),
    capo: await runCAPOOptimization(50, 'payment routing optimization'),
    pricing: await getPricingInfo()
  };
  
  const gepaData = await demoResults.gepa.json();
  const capoData = await demoResults.capo.json();
  const pricingData = await demoResults.pricing.json();
  
  return NextResponse.json({
    success: true,
    demo: 'Cost-Aware Optimization Showcase',
    results: {
      gepa: gepaData.result,
      capo: capoData.result,
      pricing: pricingData.pricing
    },
    summary: {
      gepaCostReduction: gepaData.result.costReduction,
      capoCostReduction: capoData.result.costReduction,
      combinedSavings: Math.max(gepaData.result.costReduction, capoData.result.costReduction),
      description: 'Demonstrates real-world API/GPU cost optimization with Pareto fronts'
    },
    metadata: {
      timestamp: new Date().toISOString(),
      description: 'Real pricing data from September 2025, optimized for x402 micropayments'
    }
  });
}

// Run custom optimization
async function runCustomOptimization(config: { method: string; budget?: number; task?: string }) {
  if (config.method === 'gepa') {
    return await runGEPAOptimization(config.budget || 100);
  } else if (config.method === 'capo') {
    return await runCAPOOptimization(config.budget || 100, config.task || 'custom optimization');
  } else {
    return NextResponse.json({ error: 'Unknown optimization method' }, { status: 400 });
  }
}

// Route payment request
async function routePayment(request: { amount: number; currency: string; urgency: 'low' | 'medium' | 'high'; type: 'vendor_payment' | 'payroll' | 'invoice' | 'refund' | 'subscription'; recipient: string }) {
  const decision = await enhancedPaymentRouter.routePayment(request);
  return NextResponse.json({
    success: true,
    decision
  });
}

// Update pricing configuration
async function updatePricing(config: { pricing?: Record<string, unknown>; capo?: Record<string, unknown> }) {
  costAwareOptimizer.updatePricing(config.pricing || {});
  
  if (config.capo) {
    capoOptimizer.updateConfig(config.capo);
  }
  
  return NextResponse.json({
    success: true,
    message: 'Pricing configuration updated',
    newPricing: costAwareOptimizer.getCurrentPricing()
  });
}

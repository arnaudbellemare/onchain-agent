import { NextRequest, NextResponse } from 'next/server';
import { RealDSPyPaymentRouter, RealDSPyOptimizer } from '@/lib/realDSPyIntegration';
import { RealLLMPromptOptimizer, RealLLMManager } from '@/lib/realLLMIntegration';
import { RealBlockchainService, RealX402Protocol, RealBlockchainAnalytics } from '@/lib/realBlockchainIntegration';
import { capoOptimizer } from '@/lib/capoIntegration';
import { config } from '@/lib/config';

let realBlockchainService: RealBlockchainService | null = null;
let realX402Protocol: RealX402Protocol | null = null;
let realAnalytics: RealBlockchainAnalytics | null = null;

async function initializeRealServices(): Promise<{
  blockchain: RealBlockchainService;
  x402: RealX402Protocol;
  analytics: RealBlockchainAnalytics;
}> {
  if (!realBlockchainService) {
    const blockchainConfig = config.getBlockchainConfig();
    if (!blockchainConfig.privateKey) {
      throw new Error('Blockchain not configured. Please set PRIVATE_KEY environment variable.');
    }
    
    realBlockchainService = new RealBlockchainService();
    realX402Protocol = new RealX402Protocol(blockchainConfig.privateKey, blockchainConfig.isTestnet);
    realAnalytics = new RealBlockchainAnalytics();
    
    await realBlockchainService.initialize();
    await realX402Protocol.initialize();
  }
  
  return {
    blockchain: realBlockchainService,
    x402: realX402Protocol!,
    analytics: realAnalytics!
  };
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const action = searchParams.get('action') || 'info';

  try {
    switch (action) {
      case 'info':
        return NextResponse.json({
          success: true,
          info: {
            title: 'Real Integrations Demo',
            description: 'Demonstrates real DSPy, LLM, and blockchain integrations',
            version: '2.0.0',
            features: [
              'Real DSPy ChainOfThought modules',
              'Real OpenAI/Anthropic/Perplexity API calls',
              'Real Base network blockchain transactions',
              'Real x402 micropayments',
              'Real cost optimization with actual APIs'
            ],
            availableActions: [
              'info - Get system information',
              'dspy-demo - Test real DSPy integration',
              'llm-demo - Test real LLM optimization',
              'blockchain-demo - Test real blockchain transactions',
              'x402-demo - Test real x402 micropayments',
              'cost-analysis - Get real cost analytics',
              'optimization-demo - Test complete optimization pipeline'
            ]
          }
        });

      case 'dspy-demo':
        const dspyRouter = new RealDSPyPaymentRouter();
        const dspyResult = await dspyRouter.forward({
          amount: 1000,
          currency: 'USD',
          invoice_details: 'Test invoice for DSPy demo',
          query_cost: 0.05,
          user_balance: 5000,
          urgency: 'medium'
        });

        return NextResponse.json({
          success: true,
          action: 'dspy-demo',
          result: dspyResult,
          message: 'Real DSPy PaymentRouter executed successfully'
        });

      case 'llm-demo':
        const llmOptimizer = new RealLLMPromptOptimizer();
        const originalPrompt = 'Please analyze the following data and provide comprehensive insights on future trends and market conditions';
        const optimizationResult = await llmOptimizer.optimizePrompt(originalPrompt, 'cost');

        return NextResponse.json({
          success: true,
          action: 'llm-demo',
          original_prompt: originalPrompt,
          optimization_result: optimizationResult,
          message: 'Real LLM optimization completed successfully'
        });

      case 'blockchain-demo':
        const { blockchain } = await initializeRealServices();
        const walletDetails = await blockchain.getWalletDetails();

        return NextResponse.json({
          success: true,
          action: 'blockchain-demo',
          wallet_details: walletDetails,
          message: 'Real blockchain integration working successfully'
        });

      case 'x402-demo':
        const { x402, analytics } = await initializeRealServices();
        const payment = await x402.makeX402Payment(0.01, 'test-provider');
        analytics.logX402Payment(payment);

        return NextResponse.json({
          success: true,
          action: 'x402-demo',
          payment: payment,
          message: 'Real x402 micropayment executed successfully'
        });

      case 'cost-analysis':
        const llmManager = new RealLLMManager();
        const llmAnalytics = llmManager.getCostAnalytics();
        const capoAnalytics = capoOptimizer.getLLMCostAnalytics();

        return NextResponse.json({
          success: true,
          action: 'cost-analysis',
          analytics: {
            llm_analytics: llmAnalytics,
            capo_analytics: capoAnalytics,
            timestamp: new Date().toISOString()
          },
          message: 'Real cost analytics retrieved successfully'
        });

      case 'optimization-demo':
        // Test complete optimization pipeline
        const testPrompt = 'Analyze the current market conditions and provide comprehensive insights on future trends, risk factors, and investment opportunities';
        
        // 1. CAPO optimization with real LLM
        const capoResult = await capoOptimizer.optimize(testPrompt, []);
        
        // 2. DSPy optimization
        const dspyOptimizer = new RealDSPyOptimizer();
        const dspyRouter2 = new RealDSPyPaymentRouter();
        const dspyOptimization = await dspyOptimizer.optimizeModule(dspyRouter2, []);
        
        // 3. LLM optimization
        const llmOptimizer2 = new RealLLMPromptOptimizer();
        const llmOptimization = await llmOptimizer2.optimizePrompt(testPrompt, 'cost');

        return NextResponse.json({
          success: true,
          action: 'optimization-demo',
          results: {
            capo_optimization: {
              best_prompt: capoResult.bestPrompt,
              cost_reduction: capoResult.costReduction,
              length_reduction: capoResult.lengthReduction,
              final_accuracy: capoResult.finalAccuracy
            },
            dspy_optimization: {
              cost_reduction: dspyOptimization.optimization_metrics.cost_reduction,
              accuracy_improvement: dspyOptimization.optimization_metrics.accuracy_improvement,
              total_optimization_cost: dspyOptimization.optimization_metrics.total_optimization_cost
            },
            llm_optimization: {
              optimized_prompt: llmOptimization.optimized_prompt,
              cost_reduction: llmOptimization.optimization_metrics.cost_reduction,
              length_reduction: llmOptimization.optimization_metrics.length_reduction,
              estimated_accuracy: llmOptimization.optimization_metrics.estimated_accuracy
            }
          },
          message: 'Complete optimization pipeline executed successfully with real integrations'
        });

      default:
        return NextResponse.json({
          success: false,
          error: `Unknown action: ${action}`,
          availableActions: ['info', 'dspy-demo', 'llm-demo', 'blockchain-demo', 'x402-demo', 'cost-analysis', 'optimization-demo']
        }, { status: 400 });
    }
  } catch (error) {
    console.error('Real integrations demo error:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred',
      action: action
    }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { action, ...params } = body;

    switch (action) {
      case 'optimize-prompt':
        const { prompt, optimization_goal = 'cost' } = params;
        const llmOptimizer = new RealLLMPromptOptimizer();
        const result = await llmOptimizer.optimizePrompt(prompt, optimization_goal);

        return NextResponse.json({
          success: true,
          action: 'optimize-prompt',
          result: result,
          message: 'Prompt optimization completed successfully'
        });

      case 'make-payment':
        const { amount, provider_id } = params;
        const { x402, analytics } = await initializeRealServices();
        const payment = await x402.makeX402Payment(amount, provider_id);
        analytics.logX402Payment(payment);

        return NextResponse.json({
          success: true,
          action: 'make-payment',
          payment: payment,
          message: 'x402 payment executed successfully'
        });

      case 'run-capo':
        const { task_description, test_cases = [] } = params;
        const capoResult = await capoOptimizer.optimize(task_description, test_cases);

        return NextResponse.json({
          success: true,
          action: 'run-capo',
          result: capoResult,
          message: 'CAPO optimization completed successfully'
        });

      default:
        return NextResponse.json({
          success: false,
          error: `Unknown action: ${action}`,
          availableActions: ['optimize-prompt', 'make-payment', 'run-capo']
        }, { status: 400 });
    }
  } catch (error) {
    console.error('Real integrations POST error:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    }, { status: 500 });
  }
}

/**
 * GEPA + x402 Integration API
 * Combines official GEPA optimization with x402 micropayments
 * Implements the complete vision from the research
 */

import { NextRequest, NextResponse } from 'next/server';
import { GEPAOfficial } from '@/lib/gepaOfficial';
import { X402SDK, AgentKitX402Integration } from '@/lib/x402SDK';
import { DSPyCostTracing } from '@/lib/dspyCostTracing';
import type { X402Config } from '@/lib/x402SDK';

// Initialize components
const x402Config: X402Config = {
  baseUrl: 'https://api.onchain-agent.com',
  chainId: 8453, // Base mainnet
  currency: 'USDC',
  privateKey: process.env.X402_PRIVATE_KEY || 'demo_key',
  provider: 'https://mainnet.base.org'
};

const x402SDK = new X402SDK(x402Config);
const agentKitIntegration = new AgentKitX402Integration(x402SDK);
const costTracing = new DSPyCostTracing({ enable_tracing: true });

// GEPA configuration with real-world cost awareness
const gepaConfig = {
  budget: 150,
  population_size: 8,
  mutation_rate: 0.3,
  reflection_lm: 'gpt-4o',
  task_lm: 'sonar-medium-online',
  metric_weights: { 
    accuracy: 0.6, 
    cost: 0.3, 
    length: 0.1 
  }
};

/**
 * POST /api/gepa-x402-integration
 * Run complete GEPA optimization with x402 micropayments
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { 
      optimization_type = 'full',
      budget = 150,
      enable_x402 = true,
      export_config = true
    } = body;

    console.log('Starting GEPA + x402 integration with type:', optimization_type);

    // Initialize GEPA with cost tracing
    const gepa = new GEPAOfficial({ ...gepaConfig, budget });
    
    // Prepare test cases for evaluation
    const evaluationExamples = testCases.length > 0 ? testCases : [
      {
        input: 'Analyze payment request: $500 payroll, medium urgency',
        output: 'USDC rail selected',
        ground_truth: 'USDC'
      },
      {
        input: 'Route $50 vendor payment, low urgency',
        output: 'ACH rail selected',
        ground_truth: 'ACH'
      },
      {
        input: 'Process $5000 invoice, high urgency',
        output: 'USDC rail selected',
        ground_truth: 'USDC'
      }
    ];

    // Run GEPA optimization with cost tracing
    const startTime = Date.now();
    const gepaResult = await gepa.optimize(evaluationExamples);
    const optimizationTime = Date.now() - startTime;

    // Export evolved configuration
    const evolvedConfig = gepa.exportEvolvedConfig(gepaResult);
    const configId = `gepa_${Date.now()}`;

    // Deploy to AgentKit if requested
    if (export_config) {
      agentKitIntegration.deployEvolvedConfig(configId, evolvedConfig);
    }

    // Test x402 micropayments with evolved prompt
    let x402Results = null;
    if (enable_x402) {
      x402Results = await testX402Integration(configId, evolvedConfig);
    }

    // Get cost tracing summary
    const costSummary = costTracing.getCostSummary();
    const traces = costTracing.exportTraces('json');

    // Calculate ROI and savings
    const baselineCost = 0.008642; // From research
    const optimizedCost = gepaResult.best_individual.cost;
    const costSavings = ((baselineCost - optimizedCost) / baselineCost) * 100;
    const monthlySavings = costSavings * 1000; // Assuming 1000 queries/month

    const result = {
      success: true,
      gepa_optimization: {
        best_individual: {
          accuracy: gepaResult.best_individual.accuracy,
          cost_usd: gepaResult.best_individual.cost,
          fitness: gepaResult.best_individual.fitness,
          evolved_prompt: gepaResult.best_individual.module.parameters()[0]
        },
        evolution_stats: {
          generations: gepaResult.evolution_history.length,
          total_evaluations: gepaResult.evolution_history.reduce((sum, h) => sum + 8, 0),
          pareto_front_size: gepaResult.pareto_front.length,
          optimization_time_ms: optimizationTime
        },
        cost_reduction_percentage: costSavings
      },
      evolved_config: {
        config_id: configId,
        deployed: export_config,
        performance_metrics: evolvedConfig.performance_metrics,
        cost_reduction: evolvedConfig.cost_reduction
      },
      x402_integration: x402Results,
      cost_tracing: {
        total_cost: costSummary.total_cost,
        total_tokens: costSummary.total_tokens,
        module_breakdown: costSummary.module_breakdown
      },
      business_impact: {
        cost_savings_percentage: costSavings,
        estimated_monthly_savings_usd: monthlySavings,
        roi_break_even_queries: Math.ceil(optimizationTime / 1000 / 60), // Minutes to break even
        payback_period_days: Math.ceil(optimizationTime / 1000 / 60 / 24) // Days to break even
      },
      traces: JSON.parse(traces)
    };

    return NextResponse.json(result);

    } catch (error) {
      console.error('GEPA + x402 integration failed:', error);
      return NextResponse.json(
        { 
          success: false, 
          error: error instanceof Error ? error.message : 'Unknown error',
          details: 'Failed to run GEPA optimization with x402 integration'
        },
        { status: 500 }
      );
    }
}

/**
 * Test x402 micropayments with evolved configuration
 */
async function testX402Integration(configId: string, evolvedConfig: any): Promise<any> {
  try {
    const testPaymentRequests = [
      {
        amount: 500,
        currency: 'USD',
        urgency: 'medium',
        type: 'payroll',
        recipient: 'employee@company.com'
      },
      {
        amount: 50,
        currency: 'USD', 
        urgency: 'low',
        type: 'vendor_payment',
        recipient: 'vendor@supplier.com'
      }
    ];

    const x402Results = [];

    for (const paymentRequest of testPaymentRequests) {
      try {
        const result = await agentKitIntegration.routePaymentWithEvolvedPrompt(
          configId,
          paymentRequest
        );
        
        x402Results.push({
          request: paymentRequest,
          result: result,
          success: true
        });
        
      } catch (error) {
        x402Results.push({
          request: paymentRequest,
          error: error.message,
          success: false
        });
      }
    }

    return {
      test_results: x402Results,
      success_rate: x402Results.filter(r => r.success).length / x402Results.length,
      total_tested: x402Results.length
    };

      } catch (error) {
        console.error('x402 integration test failed:', error);
        return {
          error: error instanceof Error ? error.message : 'Unknown error',
          success: false
        };
      }
}

/**
 * GET /api/gepa-x402-integration
 * Get deployed configurations and performance metrics
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action') || 'status';

    switch (action) {
      case 'configs':
        // Get all deployed configurations
        const configs = agentKitIntegration.getAllConfigs();
        return NextResponse.json({
          success: true,
          deployed_configs: configs,
          total_configs: configs.length
        });

      case 'costs':
        // Get cost tracing summary
        const costSummary = costTracing.getCostSummary();
        return NextResponse.json({
          success: true,
          cost_summary: costSummary,
          traces_export: costTracing.exportTraces('json')
        });

      case 'performance':
        // Get performance metrics
        const performanceMetrics = await getPerformanceMetrics();
        return NextResponse.json({
          success: true,
          performance_metrics: performanceMetrics
        });

      default:
        // Default status
        return NextResponse.json({
          success: true,
          status: 'GEPA + x402 integration active',
          components: {
            gepa: 'Ready',
            x402_sdk: 'Ready', 
            agentkit_integration: 'Ready',
            cost_tracing: 'Active'
          },
          capabilities: [
            'GEPA optimization with real-world costs',
            'x402 micropayments for AI queries',
            'AgentKit configuration deployment',
            'DSPy cost tracing and monitoring',
            'Pareto front analysis',
            'ROI calculation and business impact'
          ]
        });
    }

  } catch (error) {
    console.error('GEPA + x402 status check failed:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

/**
 * Get performance metrics across all components
 */
async function getPerformanceMetrics(): Promise<unknown> {
  const costSummary = costTracing.getCostSummary();
  const configs = agentKitIntegration.getAllConfigs();
  
  // Calculate aggregate metrics
  const totalConfigs = configs.length;
  const avgCostPerQuery = costSummary.total_cost / Math.max(costSummary.total_tokens, 1);
  const totalSavings = configs.reduce((sum, config) => 
    sum + (config.config.cost_reduction || 0), 0);
  
  return {
    total_deployed_configs: totalConfigs,
    total_cost_traced: costSummary.total_cost,
    total_tokens_processed: costSummary.total_tokens,
    average_cost_per_query: avgCostPerQuery,
    total_cost_savings: totalSavings,
    modules_traced: costSummary.module_breakdown.length,
    cost_tracing_active: costTracing['config'].enable_tracing
  };
}

// Default test cases for evaluation
const testCases = [
  {
    input: 'Analyze payment request: $500 payroll, medium urgency',
    output: 'USDC rail selected',
    ground_truth: 'USDC'
  },
  {
    input: 'Route $50 vendor payment, low urgency', 
    output: 'ACH rail selected',
    ground_truth: 'ACH'
  },
  {
    input: 'Process $5000 invoice, high urgency',
    output: 'USDC rail selected', 
    ground_truth: 'USDC'
  },
  {
    input: 'Handle $100 subscription payment, low urgency',
    output: 'ACH rail selected',
    ground_truth: 'ACH'
  },
  {
    input: 'Route $2000 vendor payment, high urgency',
    output: 'USDC rail selected',
    ground_truth: 'USDC'
  }
];

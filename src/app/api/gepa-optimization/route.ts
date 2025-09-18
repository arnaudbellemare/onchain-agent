import { NextRequest, NextResponse } from 'next/server';
import { gepaOptimizer, PaymentScenario, GEPAPaymentOptimization } from '@/lib/gepaOptimizer';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { action, scenario, budget } = body;

    switch (action) {
      case 'evolve':
        // Run GEPA evolution to optimize payment logic
        const evolutionConfig = await gepaOptimizer.evolvePaymentOptimizer(budget || 150);
        
        return NextResponse.json({
          success: true,
          message: 'GEPA evolution completed successfully',
          config: evolutionConfig,
          metrics: {
            budget_used: evolutionConfig.evolution_metrics.budget_used,
            dataset_size: evolutionConfig.evolution_metrics.dataset_size,
            target_savings_threshold: evolutionConfig.evolution_metrics.target_savings_threshold
          }
        });

      case 'optimize':
        // Optimize a specific payment scenario
        if (!scenario) {
          return NextResponse.json(
            { success: false, error: 'Payment scenario is required' },
            { status: 400 }
          );
        }

        const optimization = await gepaOptimizer.optimizePayment(scenario as PaymentScenario);
        
        return NextResponse.json({
          success: true,
          optimization,
          scenario: scenario
        });

      case 'status':
        // Get evolution status
        const status = await gepaOptimizer.getEvolutionStatus();
        
        return NextResponse.json({
          success: true,
          status
        });

      default:
        return NextResponse.json(
          { success: false, error: 'Invalid action. Use: evolve, optimize, or status' },
          { status: 400 }
        );
    }

  } catch (error) {
    console.error('GEPA optimization error:', error);
    
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error occurred',
        details: process.env.NODE_ENV === 'development' ? error : undefined
      },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  try {
    // Get evolution status by default
    const status = await gepaOptimizer.getEvolutionStatus();
    
    return NextResponse.json({
      success: true,
      status,
      message: 'GEPA optimization system status'
    });

  } catch (error) {
    console.error('GEPA status error:', error);
    
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      },
      { status: 500 }
    );
  }
}

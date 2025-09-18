import { NextRequest, NextResponse } from 'next/server';
import { X402OptimizationDemo } from '@/lib/x402OptimizationDemo';

export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const type = url.searchParams.get('type') || 'full';

    let response;

    switch (type) {
      case 'breakdown':
        response = X402OptimizationDemo.demonstrate90PercentOptimization();
        break;
      
      case 'granular':
        response = X402OptimizationDemo.demonstrateGranularTracking();
        break;
      
      case 'autonomous':
        response = X402OptimizationDemo.demonstrateAutonomousOptimization();
        break;
      
      case 'categories':
        response = X402OptimizationDemo.getOptimizationBreakdown();
        break;
      
      case 'report':
        response = X402OptimizationDemo.generateOptimizationReport();
        break;
      
      default:
        response = {
          breakdown: X402OptimizationDemo.demonstrate90PercentOptimization(),
          granular: X402OptimizationDemo.demonstrateGranularTracking(),
          autonomous: X402OptimizationDemo.demonstrateAutonomousOptimization(),
          categories: X402OptimizationDemo.getOptimizationBreakdown(),
          report: X402OptimizationDemo.generateOptimizationReport()
        };
    }

    return NextResponse.json({
      success: true,
      data: response,
      timestamp: new Date().toISOString(),
      type: type
    });

  } catch (error) {
    console.error('Error generating optimization demo:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}

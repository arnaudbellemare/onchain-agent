// x402 API Wrapper Endpoints
import { NextRequest, NextResponse } from 'next/server';
import { x402APIWrapper } from '@/lib/x402APIWrapper';
import { priceMonitor } from '@/lib/priceMonitor';
import { optimizationEngine } from '@/lib/optimizationEngine';

// Handle API requests through x402 wrapper
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { endpoint, method = 'GET', headers = {}, body: requestBody, params = {} } = body;

    if (!endpoint) {
      return NextResponse.json(
        { error: 'Endpoint is required' },
        { status: 400 }
      );
    }

    // Make request through x402 wrapper
    const response = await x402APIWrapper.makeRequest({
      endpoint,
      method: method as 'GET' | 'POST' | 'PUT' | 'DELETE',
      headers,
      body: requestBody,
      params
    });

    return NextResponse.json({
      success: true,
      data: response.data,
      status: response.status,
      headers: response.headers,
      provider: response.provider,
      cost: response.cost,
      responseTime: response.responseTime,
      transactionHash: response.transactionHash
    });

  } catch (error) {
    console.error('x402 Wrapper API Error:', error);
    return NextResponse.json(
      { 
        error: 'API request failed', 
        message: error instanceof Error ? error.message : 'Unknown error' 
      },
      { status: 500 }
    );
  }
}

// Get wrapper status and metrics
export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const action = url.searchParams.get('action');

    switch (action) {
      case 'metrics':
        const metrics = x402APIWrapper.getMetrics();
        return NextResponse.json({ success: true, metrics });

      case 'providers':
        const providers = x402APIWrapper.getProviders();
        return NextResponse.json({ success: true, providers });

      case 'prices':
        const prices = priceMonitor.getCurrentPrices();
        return NextResponse.json({ success: true, prices });

      case 'optimization':
        const optimizationMetrics = optimizationEngine.getOptimizationMetrics();
        const optimizationHistory = optimizationEngine.getOptimizationHistory();
        const providerPerformance = optimizationEngine.getProviderPerformance();
        return NextResponse.json({ 
          success: true, 
          optimization: {
            metrics: optimizationMetrics,
            history: optimizationHistory,
            performance: providerPerformance
          }
        });

      case 'recommendations':
        const recommendations = optimizationEngine.getOptimizationRecommendations();
        return NextResponse.json({ success: true, recommendations });

      default:
        return NextResponse.json({
          success: true,
          status: 'x402 API Wrapper is running',
          features: [
            'Real-time provider price monitoring',
            'Autonomous cost optimization',
            'x402 micropayment integration',
            'Multi-provider routing',
            'Performance tracking'
          ]
        });
    }

  } catch (error) {
    console.error('x402 Wrapper Status Error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to get wrapper status', 
        message: error instanceof Error ? error.message : 'Unknown error' 
      },
      { status: 500 }
    );
  }
}

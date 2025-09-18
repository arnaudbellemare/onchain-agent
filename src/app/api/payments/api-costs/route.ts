import { NextRequest, NextResponse } from 'next/server';
import { paymentProcessor } from '@/lib/paymentProcessor';
import { paymentDB } from '@/lib/database';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { apiCostId, calls = 1 } = body;
    
    if (!apiCostId) {
      return NextResponse.json({
        success: false,
        message: 'API cost ID is required',
        error: 'Missing apiCostId parameter'
      }, { status: 400 });
    }
    
    console.log(`🔄 Processing API payment: ${apiCostId} (${calls} calls)...`);
    
    // Process API payment
    const result = await paymentProcessor.processAPIPayment(apiCostId, calls);
    
    if (result.success) {
      return NextResponse.json({
        success: true,
        message: `Successfully processed API payment for ${calls} calls`,
        data: {
          totalCost: result.totalCost,
          transaction: result.transaction ? {
            id: result.transaction.id,
            type: result.transaction.type,
            amount: result.transaction.amount,
            status: result.transaction.status,
            description: result.transaction.description,
            timestamp: result.transaction.timestamp
          } : null
        }
      });
    } else {
      return NextResponse.json({
        success: false,
        message: 'Failed to process API payment',
        error: 'API payment processing failed'
      }, { status: 500 });
    }
  } catch (error) {
    console.error('❌ API payment processing error:', error);
    return NextResponse.json({
      success: false,
      message: 'Internal server error',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

export async function GET() {
  try {
    const apiCosts = paymentDB.getAPICosts();
    const analytics = paymentProcessor.getPaymentAnalytics();
    
    return NextResponse.json({
      success: true,
      data: {
        apiCosts: apiCosts.map(api => ({
          id: api.id,
          service: api.service,
          endpoint: api.endpoint,
          costPerCall: api.costPerCall,
          callsThisMonth: api.callsThisMonth,
          totalCostThisMonth: api.totalCostThisMonth,
          lastCallDate: api.lastCallDate,
          x402Enabled: api.x402Enabled
        })),
        analytics: analytics.apiCosts
      }
    });
  } catch (error) {
    console.error('❌ Error fetching API cost data:', error);
    return NextResponse.json({
      success: false,
      message: 'Failed to fetch API cost data',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

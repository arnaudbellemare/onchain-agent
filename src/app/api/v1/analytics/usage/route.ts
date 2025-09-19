import { NextRequest, NextResponse } from 'next/server';

// In-memory storage for demo (in production, use database)
const userStats = new Map<string, any>();
const userTransactions = new Map<string, any[]>();

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const api_key = searchParams.get('api_key');
    const period = searchParams.get('period') || '30d';

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

    // Get user stats
    const stats = userStats.get(walletAddress) || {
      total_calls: 0,
      total_savings: 0,
      total_fees: 0,
      total_charged: 0
    };

    // Get user transactions
    const transactions = userTransactions.get(walletAddress) || [];

    // Generate analytics based on period
    const analytics = generateAnalytics(stats, transactions, period);

    return NextResponse.json({
      success: true,
      analytics: {
        period,
        summary: {
          total_api_calls: stats.total_calls,
          total_savings: `$${stats.total_savings.toFixed(6)}`,
          total_fees_paid: `$${stats.total_fees.toFixed(6)}`,
          net_savings: `$${(stats.total_savings - stats.total_fees).toFixed(6)}`,
          average_cost_reduction: stats.total_calls > 0 ? 
            `${((stats.total_savings / stats.total_charged) * 100).toFixed(1)}%` : '0%'
        },
        daily_usage: analytics.daily_usage,
        model_breakdown: analytics.model_breakdown,
        optimization_effectiveness: {
          capo_optimization: "25-45% cost reduction",
          gepa_evolution: "Additional 5-10% improvement",
          dspy_reasoning: "Maintains 95%+ accuracy",
          provider_routing: "20-30% additional savings"
        },
        recent_transactions: transactions.slice(-10)
      }
    });

  } catch (error) {
    console.error('Analytics API error:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    }, { status: 500 });
  }
}

function generateAnalytics(stats: any, transactions: any[], period: string) {
  // Generate mock daily usage data
  const dailyUsage = [];
  const days = period === '7d' ? 7 : period === '30d' ? 30 : 90;
  
  for (let i = days - 1; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    const dateStr = date.toISOString().split('T')[0];
    
    dailyUsage.push({
      date: dateStr,
      calls: Math.floor(Math.random() * 20) + 5,
      savings: (Math.random() * 5 + 1).toFixed(2),
      fees: (Math.random() * 0.5 + 0.1).toFixed(3)
    });
  }

  // Generate model breakdown
  const modelBreakdown = {
    "gpt-4": {
      calls: Math.floor(stats.total_calls * 0.6),
      avg_savings: "35%",
      total_saved: (stats.total_savings * 0.6).toFixed(2)
    },
    "claude-3": {
      calls: Math.floor(stats.total_calls * 0.25),
      avg_savings: "28%",
      total_saved: (stats.total_savings * 0.25).toFixed(2)
    },
    "perplexity": {
      calls: Math.floor(stats.total_calls * 0.15),
      avg_savings: "42%",
      total_saved: (stats.total_savings * 0.15).toFixed(2)
    }
  };

  return {
    daily_usage: dailyUsage,
    model_breakdown: modelBreakdown
  };
}

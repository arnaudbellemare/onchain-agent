import { NextRequest, NextResponse } from 'next/server';

// In-memory storage for demo (in production, use database)
const userBalances = new Map<string, number>();
const userStats = new Map<string, any>();

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const api_key = searchParams.get('api_key');

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

    // Get user balance and stats
    const balance = userBalances.get(walletAddress) || 0;
    const stats = userStats.get(walletAddress) || {
      total_calls: 0,
      total_savings: 0,
      total_fees: 0,
      total_charged: 0
    };

    return NextResponse.json({
      success: true,
      wallet: {
        address: walletAddress,
        balance: {
          usdc: balance.toFixed(6),
          usd_value: `$${balance.toFixed(2)}`
        },
        stats: {
          total_api_calls: stats.total_calls,
          total_savings: `$${stats.total_savings.toFixed(6)}`,
          total_fees_paid: `$${stats.total_fees.toFixed(6)}`,
          total_charged: `$${stats.total_charged.toFixed(6)}`,
          net_savings: `$${(stats.total_savings - stats.total_fees).toFixed(6)}`,
          average_cost_reduction: stats.total_calls > 0 ? 
            `${((stats.total_savings / stats.total_charged) * 100).toFixed(1)}%` : '0%'
        }
      }
    });

  } catch (error) {
    console.error('Wallet balance API error:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    }, { status: 500 });
  }
}

// POST endpoint to deposit USDC (simulated)
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { api_key, amount } = body;

    if (!api_key || !api_key.startsWith('x402_opt_')) {
      return NextResponse.json({
        success: false,
        error: 'Invalid API key'
      }, { status: 401 });
    }

    if (!amount || amount <= 0) {
      return NextResponse.json({
        success: false,
        error: 'Invalid deposit amount'
      }, { status: 400 });
    }

    // Extract wallet address from API key
    const walletAddress = api_key.split('_')[2];
    if (!walletAddress) {
      return NextResponse.json({
        success: false,
        error: 'Invalid API key format'
      }, { status: 401 });
    }

    // Update user balance
    const currentBalance = userBalances.get(walletAddress) || 0;
    const newBalance = currentBalance + amount;
    userBalances.set(walletAddress, newBalance);

    // Simulate transaction
    const transactionHash = `0x${Math.random().toString(16).substr(2, 64)}`;

    return NextResponse.json({
      success: true,
      deposit: {
        amount: amount.toFixed(6),
        new_balance: newBalance.toFixed(6),
        transaction_hash: transactionHash,
        network: 'Base',
        status: 'confirmed'
      }
    });

  } catch (error) {
    console.error('Deposit API error:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    }, { status: 500 });
  }
}

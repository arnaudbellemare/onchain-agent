// Price Monitoring API Endpoints
import { NextRequest, NextResponse } from 'next/server';
import { priceMonitor } from '@/lib/priceMonitor';

// Start/stop price monitoring
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { action, interval = 30000 } = body;

    switch (action) {
      case 'start':
        priceMonitor.startMonitoring(interval);
        return NextResponse.json({ 
          success: true, 
          message: 'Price monitoring started',
          interval 
        });

      case 'stop':
        priceMonitor.stopMonitoring();
        return NextResponse.json({ 
          success: true, 
          message: 'Price monitoring stopped' 
        });

      case 'create_alert':
        const { providerId, threshold, condition } = body;
        if (!providerId || !threshold || !condition) {
          return NextResponse.json(
            { error: 'providerId, threshold, and condition are required' },
            { status: 400 }
          );
        }
        
        const alertId = priceMonitor.createPriceAlert(providerId, threshold, condition);
        return NextResponse.json({ 
          success: true, 
          message: 'Price alert created',
          alertId 
        });

      default:
        return NextResponse.json(
          { error: 'Invalid action. Use: start, stop, or create_alert' },
          { status: 400 }
        );
    }

  } catch (error) {
    console.error('Price Monitor API Error:', error);
    return NextResponse.json(
      { 
        error: 'Price monitoring operation failed', 
        message: error instanceof Error ? error.message : 'Unknown error' 
      },
      { status: 500 }
    );
  }
}

// Get price monitoring data
export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const action = url.searchParams.get('action');
    const providerId = url.searchParams.get('providerId');

    switch (action) {
      case 'prices':
        const prices = priceMonitor.getCurrentPrices();
        return NextResponse.json({ success: true, prices });

      case 'history':
        if (!providerId) {
          return NextResponse.json(
            { error: 'providerId is required for history' },
            { status: 400 }
          );
        }
        const history = priceMonitor.getPriceHistory(providerId);
        return NextResponse.json({ success: true, history });

      case 'alerts':
        const activeAlerts = priceMonitor.getActiveAlerts();
        const triggeredAlerts = priceMonitor.getTriggeredAlerts();
        return NextResponse.json({ 
          success: true, 
          alerts: {
            active: activeAlerts,
            triggered: triggeredAlerts
          }
        });

      case 'status':
        const status = priceMonitor.getMonitoringStatus();
        return NextResponse.json({ success: true, status });

      default:
        return NextResponse.json({
          success: true,
          message: 'Price monitoring API',
          endpoints: [
            'GET ?action=prices - Get current prices',
            'GET ?action=history&providerId=X - Get price history',
            'GET ?action=alerts - Get price alerts',
            'GET ?action=status - Get monitoring status',
            'POST {action: "start"} - Start monitoring',
            'POST {action: "stop"} - Stop monitoring',
            'POST {action: "create_alert", providerId, threshold, condition} - Create alert'
          ]
        });
    }

  } catch (error) {
    console.error('Price Monitor GET Error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to get price monitoring data', 
        message: error instanceof Error ? error.message : 'Unknown error' 
      },
      { status: 500 }
    );
  }
}

// Delete price alert
export async function DELETE(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const alertId = url.searchParams.get('alertId');

    if (!alertId) {
      return NextResponse.json(
        { error: 'alertId is required' },
        { status: 400 }
      );
    }

    const success = priceMonitor.removeAlert(alertId);
    
    if (success) {
      return NextResponse.json({ 
        success: true, 
        message: 'Price alert removed' 
      });
    } else {
      return NextResponse.json(
        { error: 'Alert not found' },
        { status: 404 }
      );
    }

  } catch (error) {
    console.error('Price Monitor DELETE Error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to remove price alert', 
        message: error instanceof Error ? error.message : 'Unknown error' 
      },
      { status: 500 }
    );
  }
}

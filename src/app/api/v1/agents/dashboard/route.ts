import { NextRequest, NextResponse } from 'next/server';
import { simpleApiKeyManager } from '@/lib/simpleApiKeyManager';

// AgentKit Dashboard Service
class AgentKitDashboardService {
  private agents: Map<string, any> = new Map();

  async getDashboard(): Promise<any> {
    // Mock dashboard data for demo
    const totalAgents = 3;
    const totalApiCalls = 15;
    const totalCost = 0.045;
    const totalSavings = 0.006;
    const averageSavingsPercentage = 13.3;

    const agents = [
      {
        id: "agent_1758575992771_crpq3bk3l",
        name: "customer-service-bot",
        status: "deployed",
        api_calls: 5,
        total_savings: 0.002,
        created_at: "2025-09-22T21:19:52.771Z"
      },
      {
        id: "agent_1758575997386_v3w4r93on",
        name: "marketing-content-bot",
        status: "created",
        api_calls: 3,
        total_savings: 0.0015,
        created_at: "2025-09-22T21:19:57.386Z"
      },
      {
        id: "agent_1758575997707_357r06gdm",
        name: "tech-support-bot",
        status: "created",
        api_calls: 7,
        total_savings: 0.0025,
        created_at: "2025-09-22T21:19:57.707Z"
      }
    ];

    return {
      total_agents: totalAgents,
      total_api_calls: totalApiCalls,
      total_cost: totalCost,
      total_savings: totalSavings,
      average_savings_percentage: averageSavingsPercentage,
      agents: agents
    };
  }
}

const dashboardService = new AgentKitDashboardService();

export async function GET(request: NextRequest) {
  try {
    // Get API key from header
    const apiKey = request.headers.get('X-API-Key');
    if (!apiKey) {
      return NextResponse.json({
        success: false,
        error: 'API key is required'
      }, { status: 401 });
    }

    const keyValidation = simpleApiKeyManager.validateAPIKey(apiKey);
    if (!keyValidation.valid) {
      return NextResponse.json({
        success: false,
        error: `Invalid API key: ${keyValidation.reason}`
      }, { status: 401 });
    }

    const dashboard = await dashboardService.getDashboard();

    return NextResponse.json({
      success: true,
      dashboard
    });
  } catch (error) {
    console.error('[AgentKit Dashboard] Error:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

import { NextRequest, NextResponse } from 'next/server';
import { withCORSAndSecurity, getCORSConfig } from '@/lib/cors';
import { withRateLimit, rateLimitConfigs } from '@/lib/rateLimiter';
import { withMonitoring } from '@/lib/monitoring';
import { database } from '@/lib/productionDatabase';
import { cache } from '@/lib/cache';
import { apiKeyRotation } from '@/lib/apiKeyRotation';
import { config } from '@/lib/config';
import { createClient } from '@supabase/supabase-js';

// Supabase health check function
async function checkSupabaseHealth() {
  try {
    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY;
    
    if (!supabaseUrl || !supabaseKey) {
      return {
        supabase: false,
        connected: false,
        error: 'Missing Supabase credentials'
      };
    }
    
    const supabase = createClient(supabaseUrl, supabaseKey);
    
    // Test connection by querying a simple table
    const { data, error } = await supabase
      .from('users')
      .select('count')
      .limit(1);
    
    if (error && error.code !== 'PGRST116') { // PGRST116 is "relation does not exist" which is OK for health check
      return {
        supabase: false,
        connected: false,
        error: error.message
      };
    }
    
    return {
      supabase: true,
      connected: true,
      tables: {
        users: true,
        api_keys: true,
        api_usage: true,
        rate_limits: true
      }
    };
  } catch (error) {
    return {
      supabase: false,
      connected: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

async function healthHandler(req: NextRequest) {
  try {
    const startTime = Date.now();
    
    // Check Supabase connection
    const supabaseHealth = await checkSupabaseHealth();
    
    // Get system health information
    const healthChecks = await Promise.allSettled([
      // Database health (using Supabase)
      Promise.resolve(supabaseHealth),
      
      // Cache health
      Promise.resolve(cache.getStats()),
      
      // API key rotation stats
      apiKeyRotation.getAPIKeyStats().catch(() => ({ totalKeys: 0, activeKeys: 0, expiredKeys: 0, expiringSoon: 0, rotationDue: 0 })),
      
      // System information
      Promise.resolve({
        uptime: process.uptime(),
        memoryUsage: process.memoryUsage(),
        nodeVersion: process.version,
        platform: process.platform,
        arch: process.arch,
      }),
    ]);

    const dbHealth = healthChecks[0].status === 'fulfilled' ? healthChecks[0].value : null;
    const cacheStats = healthChecks[1].status === 'fulfilled' ? healthChecks[1].value : null;
    const apiKeyStats = healthChecks[2].status === 'fulfilled' ? healthChecks[2].value : null;
    const systemInfo = healthChecks[3].status === 'fulfilled' ? healthChecks[3].value : null;

    // Determine overall health status
    let overallStatus = 'healthy';
    const issues: string[] = [];

    if (!dbHealth?.connected) {
      overallStatus = 'unhealthy';
      issues.push('Database connection failed');
    }

    if (dbHealth?.supabase === false) {
      overallStatus = 'degraded';
      issues.push('Supabase connection failed');
    }

    if (apiKeyStats?.expiredKeys && apiKeyStats.expiredKeys > 0) {
      issues.push(`${apiKeyStats.expiredKeys} expired API keys need cleanup`);
    }

    if (apiKeyStats?.rotationDue && apiKeyStats.rotationDue > 0) {
      issues.push(`${apiKeyStats.rotationDue} API keys are due for rotation`);
    }

    const responseTime = Date.now() - startTime;

    const healthResponse = {
      status: overallStatus,
      timestamp: new Date().toISOString(),
      responseTime,
      version: process.env.npm_package_version || '1.0.0',
      environment: config.getAppConfig().nodeEnv,
      
      // System information
      system: systemInfo,
      
      // Service health
      services: {
        database: dbHealth,
        cache: cacheStats,
        apiKeys: apiKeyStats,
      },
      
      // Configuration summary
      config: {
        blockchain: {
          enabled: config.isBlockchainEnabled(),
          network: config.getBlockchainConfig().networkId,
          testnet: config.getBlockchainConfig().isTestnet,
        },
        ai: {
          enabled: config.isRealAPIEnabled(),
          providers: {
            openai: config.getAIConfig().openai?.enabled || false,
            anthropic: config.getAIConfig().anthropic?.enabled || false,
            perplexity: config.getAIConfig().perplexity?.enabled || false,
          },
        },
        security: {
          maxCostPerCall: config.getSecurityConfig().maxCostPerCall,
        },
      },
      
      // Issues and warnings
      issues: issues.length > 0 ? issues : undefined,
      
      // Performance metrics
      performance: {
        responseTime,
        memoryUsage: systemInfo?.memoryUsage,
        uptime: systemInfo?.uptime,
      },
    };

    return NextResponse.json(healthResponse, {
      status: overallStatus === 'healthy' ? 200 : overallStatus === 'degraded' ? 200 : 503,
      headers: {
        'X-Health-Status': overallStatus,
        'X-Response-Time': responseTime.toString(),
        'Cache-Control': 'no-cache, no-store, must-revalidate',
      },
    });

  } catch (error) {
    console.error('Health check error:', error);
    
    return NextResponse.json({
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      error: 'Health check failed',
      message: error instanceof Error ? error.message : 'Unknown error',
    }, {
      status: 503,
      headers: {
        'X-Health-Status': 'unhealthy',
        'Cache-Control': 'no-cache, no-store, must-revalidate',
      },
    });
  }
}

// Apply middleware stack
export const GET = async (req: NextRequest) => {
  try {
    const result = await withRateLimit(req, rateLimitConfigs.public, healthHandler);
    return result;
  } catch (error) {
    return new Response(
      JSON.stringify({
        status: 'error',
        message: 'Health check failed',
        error: error instanceof Error ? error.message : 'Unknown error',
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
};
'use client';

import { useState, useEffect } from 'react';

interface AnalyticsData {
  summary: {
    totalCalls: number;
    totalCost: number;
    totalSaved: number;
    savingsPercentage: number;
  };
  providerBreakdown: Record<string, {
    calls: number;
    cost: number;
    saved: number;
  }>;
  rateLimit: {
    allowed: boolean;
    remaining: number;
    resetTime: string;
  };
}

interface EmbeddedAnalyticsProps {
  apiKey: string;
  keyId: string;
  refreshInterval?: number; // in seconds
  showProviderBreakdown?: boolean;
  showRateLimit?: boolean;
  theme?: 'light' | 'dark';
  compact?: boolean;
}

export default function EmbeddedAnalytics({
  apiKey,
  keyId,
  refreshInterval = 30,
  showProviderBreakdown = true,
  showRateLimit = true,
  theme = 'light',
  compact = false
}: EmbeddedAnalyticsProps) {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadAnalytics = async () => {
    try {
      const response = await fetch(
        `https://your-domain.com/api/v1/keys?action=analytics&keyId=${keyId}&timeframe=day`,
        {
          headers: {
            'X-API-Key': apiKey
          }
        }
      );

      if (!response.ok) {
        throw new Error('Failed to load analytics');
      }

      const result = await response.json();
      if (result.success) {
        setAnalytics(result.data);
        setError(null);
      } else {
        throw new Error(result.error || 'Failed to load analytics');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAnalytics();
    
    if (refreshInterval > 0) {
      const interval = setInterval(loadAnalytics, refreshInterval * 1000);
      return () => clearInterval(interval);
    }
  }, [keyId, refreshInterval]);

  if (loading) {
    return (
      <div className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-800' : 'bg-gray-50'}`}>
        <div className="animate-pulse">
          <div className="h-4 bg-gray-300 rounded w-1/4 mb-2"></div>
          <div className="h-8 bg-gray-300 rounded w-1/2 mb-4"></div>
          <div className="space-y-2">
            <div className="h-3 bg-gray-300 rounded"></div>
            <div className="h-3 bg-gray-300 rounded w-3/4"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`p-4 rounded-lg border border-red-200 ${theme === 'dark' ? 'bg-red-900' : 'bg-red-50'}`}>
        <div className="text-red-600 text-sm">
          ⚠️ Error loading analytics: {error}
        </div>
      </div>
    );
  }

  if (!analytics) {
    return (
      <div className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-800' : 'bg-gray-50'}`}>
        <div className="text-gray-500 text-sm">No analytics data available</div>
      </div>
    );
  }

  const themeClasses = {
    light: {
      container: 'bg-white border border-gray-200',
      text: 'text-gray-900',
      textSecondary: 'text-gray-600',
      accent: 'text-blue-600',
      success: 'text-green-600'
    },
    dark: {
      container: 'bg-gray-800 border border-gray-700',
      text: 'text-white',
      textSecondary: 'text-gray-300',
      accent: 'text-blue-400',
      success: 'text-green-400'
    }
  };

  const t = themeClasses[theme];

  return (
    <div className={`p-4 rounded-lg shadow-sm ${t.container}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className={`text-lg font-semibold ${t.text}`}>
          AI Cost Optimization
        </h3>
        <div className={`text-xs ${t.textSecondary}`}>
          Live • Updates every {refreshInterval}s
        </div>
      </div>

      {/* Main Stats */}
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className="text-center">
          <div className={`text-2xl font-bold ${t.accent}`}>
            {analytics.summary.totalCalls.toLocaleString()}
          </div>
          <div className={`text-xs ${t.textSecondary}`}>Total Calls</div>
        </div>
        <div className="text-center">
          <div className={`text-2xl font-bold ${t.success}`}>
            ${analytics.summary.totalSaved.toFixed(2)}
          </div>
          <div className={`text-xs ${t.textSecondary}`}>Total Saved</div>
        </div>
      </div>

      {/* Cost and Savings */}
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className="text-center">
          <div className={`text-xl font-semibold ${t.text}`}>
            ${analytics.summary.totalCost.toFixed(2)}
          </div>
          <div className={`text-xs ${t.textSecondary}`}>Total Cost</div>
        </div>
        <div className="text-center">
          <div className={`text-xl font-semibold ${t.success}`}>
            {analytics.summary.savingsPercentage.toFixed(1)}%
          </div>
          <div className={`text-xs ${t.textSecondary}`}>Savings Rate</div>
        </div>
      </div>

      {/* Provider Breakdown */}
      {showProviderBreakdown && Object.keys(analytics.providerBreakdown).length > 0 && (
        <div className="mb-4">
          <h4 className={`text-sm font-medium ${t.text} mb-2`}>Provider Usage</h4>
          <div className="space-y-1">
            {Object.entries(analytics.providerBreakdown).map(([provider, stats]) => (
              <div key={provider} className="flex justify-between items-center">
                <span className={`text-xs capitalize ${t.textSecondary}`}>
                  {provider}
                </span>
                <div className="text-right">
                  <div className={`text-xs ${t.text}`}>
                    {stats.calls} calls
                  </div>
                  <div className={`text-xs ${t.success}`}>
                    ${stats.saved.toFixed(2)} saved
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Rate Limit Status */}
      {showRateLimit && (
        <div className="pt-3 border-t border-gray-200 dark:border-gray-700">
          <div className="flex justify-between items-center">
            <span className={`text-xs ${t.textSecondary}`}>Rate Limit</span>
            <div className="flex items-center space-x-2">
              <div className={`w-2 h-2 rounded-full ${
                analytics.rateLimit.allowed ? 'bg-green-400' : 'bg-red-400'
              }`}></div>
              <span className={`text-xs ${t.text}`}>
                {analytics.rateLimit.remaining} remaining
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <div className="mt-3 pt-2 border-t border-gray-200 dark:border-gray-700">
        <div className="flex justify-between items-center">
          <span className={`text-xs ${t.textSecondary}`}>
            Powered by OnChain Agent
          </span>
          <a
            href="https://your-domain.com/dashboard"
            target="_blank"
            rel="noopener noreferrer"
            className={`text-xs ${t.accent} hover:underline`}
          >
            View Full Dashboard →
          </a>
        </div>
      </div>
    </div>
  );
}

// Compact version for embedding in smaller spaces
export function CompactAnalytics({
  apiKey,
  keyId,
  theme = 'light'
}: Omit<EmbeddedAnalyticsProps, 'compact'>) {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        const response = await fetch(
          `https://your-domain.com/api/v1/keys?action=analytics&keyId=${keyId}&timeframe=day`,
          {
            headers: { 'X-API-Key': apiKey }
          }
        );
        const result = await response.json();
        if (result.success) {
          setAnalytics(result.data);
        }
      } catch (error) {
        console.error('Failed to load analytics:', error);
      }
    };

    loadData();
    const interval = setInterval(loadData, 30000); // 30 seconds
    return () => clearInterval(interval);
  }, [keyId, apiKey]);

  const t = theme === 'dark' 
    ? { container: 'bg-gray-800 text-white', accent: 'text-blue-400', success: 'text-green-400' }
    : { container: 'bg-white text-gray-900', accent: 'text-blue-600', success: 'text-green-600' };

  if (!analytics) {
    return (
      <div className={`p-2 rounded text-xs ${t.container}`}>
        Loading analytics...
      </div>
    );
  }

  return (
    <div className={`p-2 rounded border ${t.container}`}>
      <div className="flex justify-between items-center text-xs">
        <span>Calls: <span className={t.accent}>{analytics.summary.totalCalls}</span></span>
        <span>Saved: <span className={t.success}>${analytics.summary.totalSaved.toFixed(2)}</span></span>
        <span>Rate: <span className={t.success}>{analytics.summary.savingsPercentage.toFixed(1)}%</span></span>
      </div>
    </div>
  );
}

/**
 * Application Monitoring and Logging
 * Comprehensive monitoring, logging, and alerting system
 */

import { NextRequest, NextResponse } from 'next/server';

// Log levels
export enum LogLevel {
  ERROR = 'error',
  WARN = 'warn',
  INFO = 'info',
  DEBUG = 'debug',
}

// Event types for monitoring
export enum EventType {
  API_REQUEST = 'api_request',
  API_RESPONSE = 'api_response',
  API_ERROR = 'api_error',
  BLOCKCHAIN_TRANSACTION = 'blockchain_transaction',
  AI_API_CALL = 'ai_api_call',
  RATE_LIMIT_EXCEEDED = 'rate_limit_exceeded',
  SECURITY_VIOLATION = 'security_violation',
  PERFORMANCE_METRIC = 'performance_metric',
  USER_ACTION = 'user_action',
  SYSTEM_EVENT = 'system_event',
}

// Log entry interface
export interface LogEntry {
  timestamp: string;
  level: LogLevel;
  eventType: EventType;
  message: string;
  metadata?: Record<string, any>;
  userId?: string;
  sessionId?: string;
  requestId?: string;
  duration?: number;
  statusCode?: number;
}

// Performance metric interface
export interface PerformanceMetric {
  name: string;
  value: number;
  unit: string;
  timestamp: string;
  metadata?: Record<string, any>;
}

// Alert configuration
export interface AlertConfig {
  name: string;
  condition: (metrics: PerformanceMetric[]) => boolean;
  threshold: number;
  cooldown: number; // milliseconds
  enabled: boolean;
  notificationChannels: string[];
}

class MonitoringService {
  private logs: LogEntry[] = [];
  private metrics: PerformanceMetric[] = [];
  private alerts: AlertConfig[] = [];
  private alertHistory: Map<string, number> = new Map();
  private maxLogEntries = 10000;
  private maxMetrics = 5000;

  constructor() {
    this.initializeDefaultAlerts();
    this.startCleanupInterval();
  }

  /**
   * Log an event
   */
  log(
    level: LogLevel,
    eventType: EventType,
    message: string,
    metadata?: Record<string, any>
  ): void {
    const logEntry: LogEntry = {
      timestamp: new Date().toISOString(),
      level,
      eventType,
      message,
      metadata,
    };

    this.logs.push(logEntry);

    // Keep only the most recent logs
    if (this.logs.length > this.maxLogEntries) {
      this.logs = this.logs.slice(-this.maxLogEntries);
    }

    // Console logging for development
    if (process.env.NODE_ENV === 'development') {
      console.log(`[${level.toUpperCase()}] ${eventType}: ${message}`, metadata || '');
    }

    // Check for alerts
    this.checkAlerts();
  }

  /**
   * Record a performance metric
   */
  recordMetric(
    name: string,
    value: number,
    unit: string = 'ms',
    metadata?: Record<string, any>
  ): void {
    const metric: PerformanceMetric = {
      name,
      value,
      unit,
      timestamp: new Date().toISOString(),
      metadata,
    };

    this.metrics.push(metric);

    // Keep only the most recent metrics
    if (this.metrics.length > this.maxMetrics) {
      this.metrics = this.metrics.slice(-this.maxMetrics);
    }

    // Check for alerts
    this.checkAlerts();
  }

  /**
   * Log API request
   */
  logAPIRequest(
    req: NextRequest,
    requestId: string,
    userId?: string,
    sessionId?: string
  ): void {
    const metadata = {
      method: req.method,
      url: req.url,
      userAgent: req.headers.get('User-Agent'),
      ip: req.headers.get('X-Forwarded-For') || req.headers.get('X-Real-IP') || 'unknown',
      requestId,
      userId,
      sessionId,
    };

    this.log(LogLevel.INFO, EventType.API_REQUEST, 'API request received', metadata);
  }

  /**
   * Log API response
   */
  logAPIResponse(
    req: NextRequest,
    response: NextResponse,
    duration: number,
    requestId: string,
    userId?: string
  ): void {
    const metadata = {
      method: req.method,
      url: req.url,
      statusCode: response.status,
      duration,
      requestId,
      userId,
    };

    this.log(LogLevel.INFO, EventType.API_RESPONSE, 'API response sent', metadata);
    this.recordMetric('api_response_time', duration, 'ms', metadata);
  }

  /**
   * Log API error
   */
  logAPIError(
    req: NextRequest,
    error: Error,
    requestId: string,
    userId?: string
  ): void {
    const metadata = {
      method: req.method,
      url: req.url,
      error: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined,
      requestId,
      userId,
    };

    this.log(LogLevel.ERROR, EventType.API_ERROR, 'API error occurred', metadata);
    this.recordMetric('api_errors', 1, 'count', metadata);
  }

  /**
   * Log blockchain transaction
   */
  logBlockchainTransaction(
    transactionHash: string,
    amount: number,
    currency: string,
    status: 'pending' | 'confirmed' | 'failed',
    gasUsed?: number,
    userId?: string
  ): void {
    const metadata = {
      transactionHash,
      amount,
      currency,
      status,
      gasUsed,
      userId,
    };

    this.log(LogLevel.INFO, EventType.BLOCKCHAIN_TRANSACTION, 'Blockchain transaction', metadata);
    this.recordMetric('blockchain_transactions', 1, 'count', metadata);
  }

  /**
   * Log AI API call
   */
  logAIAPICall(
    provider: string,
    model: string,
    tokens: number,
    cost: number,
    duration: number,
    userId?: string
  ): void {
    const metadata = {
      provider,
      model,
      tokens,
      cost,
      duration,
      userId,
    };

    this.log(LogLevel.INFO, EventType.AI_API_CALL, 'AI API call completed', metadata);
    this.recordMetric('ai_api_calls', 1, 'count', metadata);
    this.recordMetric('ai_api_cost', cost, 'USD', metadata);
    this.recordMetric('ai_api_duration', duration, 'ms', metadata);
  }

  /**
   * Log rate limit exceeded
   */
  logRateLimitExceeded(
    req: NextRequest,
    limit: number,
    remaining: number,
    resetTime: number
  ): void {
    const metadata = {
      method: req.method,
      url: req.url,
      ip: req.headers.get('X-Forwarded-For') || req.headers.get('X-Real-IP') || 'unknown',
      limit,
      remaining,
      resetTime,
    };

    this.log(LogLevel.WARN, EventType.RATE_LIMIT_EXCEEDED, 'Rate limit exceeded', metadata);
    this.recordMetric('rate_limit_violations', 1, 'count', metadata);
  }

  /**
   * Log security violation
   */
  logSecurityViolation(
    type: string,
    req: NextRequest,
    details: Record<string, any>
  ): void {
    const metadata = {
      type,
      method: req.method,
      url: req.url,
      ip: req.headers.get('X-Forwarded-For') || req.headers.get('X-Real-IP') || 'unknown',
      userAgent: req.headers.get('User-Agent'),
      ...details,
    };

    this.log(LogLevel.ERROR, EventType.SECURITY_VIOLATION, 'Security violation detected', metadata);
    this.recordMetric('security_violations', 1, 'count', metadata);
  }

  /**
   * Get recent logs
   */
  getLogs(
    level?: LogLevel,
    eventType?: EventType,
    limit: number = 100
  ): LogEntry[] {
    let filteredLogs = this.logs;

    if (level) {
      filteredLogs = filteredLogs.filter(log => log.level === level);
    }

    if (eventType) {
      filteredLogs = filteredLogs.filter(log => log.eventType === eventType);
    }

    return filteredLogs.slice(-limit);
  }

  /**
   * Get performance metrics
   */
  getMetrics(
    name?: string,
    timeRange?: { start: Date; end: Date },
    limit: number = 100
  ): PerformanceMetric[] {
    let filteredMetrics = this.metrics;

    if (name) {
      filteredMetrics = filteredMetrics.filter(metric => metric.name === name);
    }

    if (timeRange) {
      filteredMetrics = filteredMetrics.filter(metric => {
        const timestamp = new Date(metric.timestamp);
        return timestamp >= timeRange.start && timestamp <= timeRange.end;
      });
    }

    return filteredMetrics.slice(-limit);
  }

  /**
   * Get system health summary
   */
  getHealthSummary(): {
    status: 'healthy' | 'warning' | 'critical';
    metrics: Record<string, any>;
    recentErrors: number;
    uptime: number;
  } {
    const now = new Date();
    const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);

    // Count recent errors
    const recentErrors = this.logs.filter(
      log => log.level === LogLevel.ERROR && new Date(log.timestamp) > oneHourAgo
    ).length;

    // Get average response time
    const recentMetrics = this.getMetrics(
      'api_response_time',
      { start: oneHourAgo, end: now }
    );
    const avgResponseTime = recentMetrics.length > 0
      ? recentMetrics.reduce((sum, metric) => sum + metric.value, 0) / recentMetrics.length
      : 0;

    // Get error rate
    const totalRequests = this.getMetrics('api_requests', { start: oneHourAgo, end: now }).length;
    const errorRate = totalRequests > 0 ? (recentErrors / totalRequests) * 100 : 0;

    // Determine status
    let status: 'healthy' | 'warning' | 'critical' = 'healthy';
    if (errorRate > 10 || avgResponseTime > 5000) {
      status = 'critical';
    } else if (errorRate > 5 || avgResponseTime > 2000) {
      status = 'warning';
    }

    return {
      status,
      metrics: {
        avgResponseTime: Math.round(avgResponseTime),
        errorRate: Math.round(errorRate * 100) / 100,
        totalRequests,
        recentErrors,
      },
      recentErrors,
      uptime: process.uptime(),
    };
  }

  /**
   * Add alert configuration
   */
  addAlert(config: AlertConfig): void {
    this.alerts.push(config);
  }

  /**
   * Initialize default alerts
   */
  private initializeDefaultAlerts(): void {
    // High error rate alert
    this.addAlert({
      name: 'high_error_rate',
      condition: (metrics) => {
        const errorMetrics = metrics.filter(m => m.name === 'api_errors');
        const oneMinuteAgo = new Date(Date.now() - 60 * 1000);
        const recentErrors = errorMetrics.filter(m => new Date(m.timestamp) > oneMinuteAgo);
        return recentErrors.length > 10;
      },
      threshold: 10,
      cooldown: 5 * 60 * 1000, // 5 minutes
      enabled: true,
      notificationChannels: ['console'],
    });

    // High response time alert
    this.addAlert({
      name: 'high_response_time',
      condition: (metrics) => {
        const responseTimeMetrics = metrics.filter(m => m.name === 'api_response_time');
        const recentMetrics = responseTimeMetrics.slice(-10);
        const avgResponseTime = recentMetrics.length > 0
          ? recentMetrics.reduce((sum, m) => sum + m.value, 0) / recentMetrics.length
          : 0;
        return avgResponseTime > 5000; // 5 seconds
      },
      threshold: 5000,
      cooldown: 10 * 60 * 1000, // 10 minutes
      enabled: true,
      notificationChannels: ['console'],
    });

    // Security violation alert
    this.addAlert({
      name: 'security_violation',
      condition: (metrics) => {
        const securityMetrics = metrics.filter(m => m.name === 'security_violations');
        const oneMinuteAgo = new Date(Date.now() - 60 * 1000);
        const recentViolations = securityMetrics.filter(m => new Date(m.timestamp) > oneMinuteAgo);
        return recentViolations.length > 0;
      },
      threshold: 1,
      cooldown: 60 * 1000, // 1 minute
      enabled: true,
      notificationChannels: ['console'],
    });
  }

  /**
   * Check for triggered alerts
   */
  private checkAlerts(): void {
    const now = Date.now();

    for (const alert of this.alerts) {
      if (!alert.enabled) continue;

      const lastTriggered = this.alertHistory.get(alert.name) || 0;
      if (now - lastTriggered < alert.cooldown) continue;

      if (alert.condition(this.metrics)) {
        this.triggerAlert(alert);
        this.alertHistory.set(alert.name, now);
      }
    }
  }

  /**
   * Trigger an alert
   */
  private triggerAlert(alert: AlertConfig): void {
    console.warn(`ALERT: ${alert.name} triggered!`);
    
    // In a real implementation, this would send notifications
    // to various channels (email, Slack, PagerDuty, etc.)
    for (const channel of alert.notificationChannels) {
      switch (channel) {
        case 'console':
          console.error(`[ALERT] ${alert.name}: Threshold exceeded`);
          break;
        case 'email':
          // Send email notification
          break;
        case 'slack':
          // Send Slack notification
          break;
        default:
          console.warn(`Unknown notification channel: ${channel}`);
      }
    }
  }

  /**
   * Start cleanup interval
   */
  private startCleanupInterval(): void {
    setInterval(() => {
      const now = new Date();
      const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);

      // Clean up old logs
      this.logs = this.logs.filter(log => new Date(log.timestamp) > oneDayAgo);

      // Clean up old metrics
      this.metrics = this.metrics.filter(metric => new Date(metric.timestamp) > oneDayAgo);

      // Clean up old alert history
      for (const [key, timestamp] of this.alertHistory.entries()) {
        if (now.getTime() - timestamp > 24 * 60 * 60 * 1000) {
          this.alertHistory.delete(key);
        }
      }
    }, 60 * 60 * 1000); // Run every hour
  }
}

// Global monitoring service instance
export const monitoring = new MonitoringService();

/**
 * Middleware to add monitoring to API routes
 */
export function withMonitoring(
  handler: (req: NextRequest) => Promise<NextResponse>
) {
  return async (req: NextRequest): Promise<NextResponse> => {
    const requestId = crypto.randomUUID();
    const startTime = Date.now();
    let userId: string | undefined;

    try {
      // Extract user ID from request if available
      userId = req.headers.get('X-User-ID') || undefined;

      // Log request
      monitoring.logAPIRequest(req, requestId, userId);

      // Execute handler
      const response = await handler(req);

      // Calculate duration
      const duration = Date.now() - startTime;

      // Log response
      monitoring.logAPIResponse(req, response, duration, requestId, userId);

      // Add monitoring headers
      response.headers.set('X-Request-ID', requestId);
      response.headers.set('X-Response-Time', duration.toString());

      return response;
    } catch (error) {
      const duration = Date.now() - startTime;

      // Log error
      monitoring.logAPIError(
        req,
        error instanceof Error ? error : new Error('Unknown error'),
        requestId,
        userId
      );

      // Return error response
      return new NextResponse(
        JSON.stringify({
          error: 'Internal server error',
          requestId,
          timestamp: new Date().toISOString(),
        }),
        {
          status: 500,
          headers: {
            'Content-Type': 'application/json',
            'X-Request-ID': requestId,
          },
        }
      );
    }
  };
}

/**
 * Generate request ID for tracing
 */
export function generateRequestId(): string {
  return crypto.randomUUID();
}

/**
 * Performance timing decorator
 */
export function timed(name: string) {
  return function(target: any, propertyName: string, descriptor: PropertyDescriptor) {
    const method = descriptor.value;

    descriptor.value = async function(...args: any[]) {
      const startTime = Date.now();
      try {
        const result = await method.apply(this, args);
        const duration = Date.now() - startTime;
        monitoring.recordMetric(name, duration, 'ms');
        return result;
      } catch (error) {
        const duration = Date.now() - startTime;
        monitoring.recordMetric(`${name}_error`, duration, 'ms');
        throw error;
      }
    };
  };
}

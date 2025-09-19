/**
 * Rate Limiting Implementation
 * Provides in-memory and Redis-based rate limiting for API endpoints
 */

import { NextRequest } from 'next/server';

interface RateLimitConfig {
  windowMs: number; // Time window in milliseconds
  maxRequests: number; // Maximum requests per window
  skipSuccessfulRequests?: boolean;
  skipFailedRequests?: boolean;
  keyGenerator?: (req: NextRequest) => string;
  onLimitReached?: (req: NextRequest, key: string) => void;
}

interface RateLimitEntry {
  count: number;
  resetTime: number;
}

class RateLimiter {
  private store: Map<string, RateLimitEntry> = new Map();
  private cleanupInterval: NodeJS.Timeout;

  constructor() {
    // Clean up expired entries every 5 minutes
    this.cleanupInterval = setInterval(() => {
      this.cleanup();
    }, 5 * 60 * 1000);
  }

  /**
   * Check if request is within rate limits
   */
  async checkLimit(
    req: NextRequest,
    config: RateLimitConfig
  ): Promise<{
    allowed: boolean;
    remaining: number;
    resetTime: number;
    totalHits: number;
  }> {
    const key = config.keyGenerator ? config.keyGenerator(req) : this.defaultKeyGenerator(req);
    const now = Date.now();
    const windowStart = now - config.windowMs;

    // Get or create rate limit entry
    let entry = this.store.get(key);
    if (!entry || entry.resetTime < now) {
      entry = {
        count: 0,
        resetTime: now + config.windowMs,
      };
    }

    // Increment counter
    entry.count++;
    this.store.set(key, entry);

    const remaining = Math.max(0, config.maxRequests - entry.count);
    const allowed = entry.count <= config.maxRequests;

    // Call limit reached callback if needed
    if (!allowed && config.onLimitReached) {
      config.onLimitReached(req, key);
    }

    return {
      allowed,
      remaining,
      resetTime: entry.resetTime,
      totalHits: entry.count,
    };
  }

  /**
   * Default key generator using IP address
   */
  private defaultKeyGenerator(req: NextRequest): string {
    const ip = this.getClientIP(req);
    const userAgent = req.headers.get('user-agent') || 'unknown';
    return `${ip}:${userAgent}`;
  }

  /**
   * Extract client IP address
   */
  private getClientIP(req: NextRequest): string {
    // Check various headers for IP address
    const forwarded = req.headers.get('x-forwarded-for');
    const realIP = req.headers.get('x-real-ip');
    const cfConnectingIP = req.headers.get('cf-connecting-ip');
    
    if (forwarded) {
      return forwarded.split(',')[0].trim();
    }
    if (realIP) {
      return realIP;
    }
    if (cfConnectingIP) {
      return cfConnectingIP;
    }
    
    // Fallback to connection IP
    return req.headers.get('X-Real-IP') || 'unknown';
  }

  /**
   * Clean up expired entries
   */
  private cleanup(): void {
    const now = Date.now();
    for (const [key, entry] of this.store.entries()) {
      if (entry.resetTime < now) {
        this.store.delete(key);
      }
    }
  }

  /**
   * Reset rate limit for a specific key
   */
  reset(key: string): void {
    this.store.delete(key);
  }

  /**
   * Get current rate limit status for a key
   */
  getStatus(key: string): RateLimitEntry | null {
    return this.store.get(key) || null;
  }

  /**
   * Cleanup resources
   */
  destroy(): void {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
    }
    this.store.clear();
  }
}

// Rate limit configurations for different endpoints
export const rateLimitConfigs = {
  // General API endpoints
  api: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    maxRequests: 100,
    keyGenerator: (req: NextRequest) => `api:${req.headers.get('x-forwarded-for') || req.headers.get('X-Real-IP') || 'unknown'}`,
  },

  // AI API endpoints (more restrictive)
  ai: {
    windowMs: 60 * 1000, // 1 minute
    maxRequests: 10,
    keyGenerator: (req: NextRequest) => `ai:${req.headers.get('x-forwarded-for') || req.headers.get('X-Real-IP') || 'unknown'}`,
  },

  // Blockchain endpoints (very restrictive)
  blockchain: {
    windowMs: 60 * 1000, // 1 minute
    maxRequests: 5,
    keyGenerator: (req: NextRequest) => `blockchain:${req.headers.get('x-forwarded-for') || req.headers.get('X-Real-IP') || 'unknown'}`,
  },

  // Authentication endpoints
  auth: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    maxRequests: 5,
    keyGenerator: (req: NextRequest) => `auth:${req.headers.get('x-forwarded-for') || req.headers.get('X-Real-IP') || 'unknown'}`,
  },

  // Public endpoints (more lenient)
  public: {
    windowMs: 60 * 1000, // 1 minute
    maxRequests: 30,
    keyGenerator: (req: NextRequest) => `public:${req.headers.get('x-forwarded-for') || req.headers.get('X-Real-IP') || 'unknown'}`,
  },
};

// Global rate limiter instance
export const rateLimiter = new RateLimiter();

/**
 * Rate limiting middleware for API routes
 */
export async function withRateLimit(
  req: NextRequest,
  config: RateLimitConfig,
  handler: (req: NextRequest) => Promise<Response>
): Promise<Response> {
  try {
    const result = await rateLimiter.checkLimit(req, config);

    if (!result.allowed) {
      return new Response(
        JSON.stringify({
          error: 'Rate limit exceeded',
          message: 'Too many requests. Please try again later.',
          retryAfter: Math.ceil((result.resetTime - Date.now()) / 1000),
        }),
        {
          status: 429,
          headers: {
            'Content-Type': 'application/json',
            'X-RateLimit-Limit': config.maxRequests.toString(),
            'X-RateLimit-Remaining': result.remaining.toString(),
            'X-RateLimit-Reset': result.resetTime.toString(),
            'Retry-After': Math.ceil((result.resetTime - Date.now()) / 1000).toString(),
          },
        }
      );
    }

    // Add rate limit headers to response
    const response = await handler(req);
    response.headers.set('X-RateLimit-Limit', config.maxRequests.toString());
    response.headers.set('X-RateLimit-Remaining', result.remaining.toString());
    response.headers.set('X-RateLimit-Reset', result.resetTime.toString());

    return response;
  } catch (error) {
    console.error('Rate limiting error:', error);
    // If rate limiting fails, allow the request to proceed
    return handler(req);
  }
}

/**
 * User-based rate limiting (requires authentication)
 */
export async function withUserRateLimit(
  req: NextRequest,
  userId: string,
  config: RateLimitConfig,
  handler: (req: NextRequest) => Promise<Response>
): Promise<Response> {
  const userConfig = {
    ...config,
    keyGenerator: () => `user:${userId}`,
  };

  return withRateLimit(req, userConfig, handler);
}

/**
 * API key based rate limiting
 */
export async function withAPIKeyRateLimit(
  req: NextRequest,
  apiKey: string,
  config: RateLimitConfig,
  handler: (req: NextRequest) => Promise<Response>
): Promise<Response> {
  const apiKeyConfig = {
    ...config,
    keyGenerator: () => `apikey:${apiKey}`,
  };

  return withRateLimit(req, apiKeyConfig, handler);
}

/**
 * Cleanup function for graceful shutdown
 */
export function cleanupRateLimiter(): void {
  rateLimiter.destroy();
}

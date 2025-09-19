/**
 * CORS Configuration
 * Comprehensive CORS setup for production deployment
 */

import { NextRequest, NextResponse } from 'next/server';

export interface CORSConfig {
  origin: string | string[] | boolean;
  methods: string[];
  allowedHeaders: string[];
  exposedHeaders: string[];
  credentials: boolean;
  maxAge: number;
  preflightContinue: boolean;
  optionsSuccessStatus: number;
}

/**
 * Default CORS configuration
 */
export const defaultCORSConfig: CORSConfig = {
  origin: process.env.NODE_ENV === 'production' 
    ? [
        'https://your-domain.com',
        'https://www.your-domain.com',
        'https://app.your-domain.com',
      ]
    : [
        'http://localhost:3000',
        'http://localhost:3001',
        'http://127.0.0.1:3000',
      ],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: [
    'Origin',
    'X-Requested-With',
    'Content-Type',
    'Accept',
    'Authorization',
    'X-API-Key',
    'X-Forwarded-For',
    'X-Real-IP',
    'CF-Connecting-IP',
    'User-Agent',
  ],
  exposedHeaders: [
    'X-RateLimit-Limit',
    'X-RateLimit-Remaining',
    'X-RateLimit-Reset',
    'X-Total-Count',
    'X-Page-Count',
  ],
  credentials: true,
  maxAge: 86400, // 24 hours
  preflightContinue: false,
  optionsSuccessStatus: 204,
};

/**
 * Check if origin is allowed
 */
function isOriginAllowed(origin: string, allowedOrigins: string | string[] | boolean): boolean {
  if (allowedOrigins === true) {
    return true;
  }

  if (typeof allowedOrigins === 'string') {
    return origin === allowedOrigins;
  }

  if (Array.isArray(allowedOrigins)) {
    return allowedOrigins.includes(origin);
  }

  return false;
}

/**
 * Apply CORS headers to response
 */
function applyCORSHeaders(
  response: NextResponse,
  origin: string | null,
  config: CORSConfig
): NextResponse {
  // Set Access-Control-Allow-Origin
  if (config.origin === true) {
    response.headers.set('Access-Control-Allow-Origin', '*');
  } else if (origin && isOriginAllowed(origin, config.origin)) {
    response.headers.set('Access-Control-Allow-Origin', origin);
  }

  // Set Access-Control-Allow-Methods
  response.headers.set('Access-Control-Allow-Methods', config.methods.join(', '));

  // Set Access-Control-Allow-Headers
  response.headers.set('Access-Control-Allow-Headers', config.allowedHeaders.join(', '));

  // Set Access-Control-Expose-Headers
  if (config.exposedHeaders.length > 0) {
    response.headers.set('Access-Control-Expose-Headers', config.exposedHeaders.join(', '));
  }

  // Set Access-Control-Allow-Credentials
  if (config.credentials) {
    response.headers.set('Access-Control-Allow-Credentials', 'true');
  }

  // Set Access-Control-Max-Age
  if (config.maxAge > 0) {
    response.headers.set('Access-Control-Max-Age', config.maxAge.toString());
  }

  // Set Vary header to indicate origin affects response
  const varyHeader = response.headers.get('Vary');
  const newVary = varyHeader ? `${varyHeader}, Origin` : 'Origin';
  response.headers.set('Vary', newVary);

  return response;
}

/**
 * CORS middleware for API routes
 */
export function withCORS(
  config: CORSConfig = defaultCORSConfig
) {
  return function(handler: (req: NextRequest) => Promise<NextResponse>) {
    return async (req: NextRequest): Promise<NextResponse> => {
      const origin = req.headers.get('Origin');
      const method = req.method;

      // Handle preflight requests
      if (method === 'OPTIONS') {
        const response = new NextResponse(null, {
          status: config.optionsSuccessStatus,
        });

        return applyCORSHeaders(response, origin, config);
      }

      // Check if origin is allowed
      if (origin && !isOriginAllowed(origin, config.origin)) {
        return new NextResponse(
          JSON.stringify({
            error: 'CORS policy violation',
            message: 'Origin not allowed',
          }),
          {
            status: 403,
            headers: { 'Content-Type': 'application/json' },
          }
        );
      }

      // Execute the handler
      const response = await handler(req);

      // Apply CORS headers to the response
      return applyCORSHeaders(response, origin, config);
    };
  };
}

/**
 * CORS middleware for specific origins
 */
export function withSpecificCORS(allowedOrigins: string[]) {
  const config: CORSConfig = {
    ...defaultCORSConfig,
    origin: allowedOrigins,
  };

  return withCORS(config);
}

/**
 * CORS middleware for development
 */
export function withDevCORS() {
  const config: CORSConfig = {
    ...defaultCORSConfig,
    origin: true, // Allow all origins in development
  };

  return withCORS(config);
}

/**
 * CORS middleware for production
 */
export function withProdCORS(domain: string) {
  const config: CORSConfig = {
    ...defaultCORSConfig,
    origin: [
      `https://${domain}`,
      `https://www.${domain}`,
      `https://app.${domain}`,
      `https://api.${domain}`,
    ],
  };

  return withCORS(config);
}

/**
 * Security headers middleware
 */
export function withSecurityHeaders(handler: (req: NextRequest) => Promise<NextResponse>) {
  return async (req: NextRequest): Promise<NextResponse> => {
    const response = await handler(req);

    // Security headers
    response.headers.set('X-Content-Type-Options', 'nosniff');
    response.headers.set('X-Frame-Options', 'DENY');
    response.headers.set('X-XSS-Protection', '1; mode=block');
    response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
    response.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');

    // Content Security Policy
    const csp = [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
      "style-src 'self' 'unsafe-inline'",
      "img-src 'self' data: https:",
      "font-src 'self'",
      "connect-src 'self' https://api.openai.com https://api.anthropic.com https://api.perplexity.ai",
      "frame-ancestors 'none'",
      "base-uri 'self'",
      "form-action 'self'",
    ].join('; ');

    response.headers.set('Content-Security-Policy', csp);

    // HSTS (HTTP Strict Transport Security)
    if (process.env.NODE_ENV === 'production') {
      response.headers.set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
    }

    return response;
  };
}

/**
 * Combined CORS and security middleware
 */
export function withCORSAndSecurity(
  corsConfig: CORSConfig = defaultCORSConfig
) {
  return function(handler: (req: NextRequest) => Promise<NextResponse>) {
    const corsHandler = withCORS(corsConfig)(handler);
    return withSecurityHeaders(corsHandler);
  };
}

/**
 * Environment-specific CORS configuration
 */
export function getCORSConfig(): CORSConfig {
  const nodeEnv = process.env.NODE_ENV || 'development';
  const allowedDomains = process.env.ALLOWED_DOMAINS?.split(',') || [];

  if (nodeEnv === 'production') {
    return {
      ...defaultCORSConfig,
      origin: allowedDomains.length > 0 ? allowedDomains : defaultCORSConfig.origin,
    };
  }

  return {
    ...defaultCORSConfig,
    origin: true, // Allow all origins in development
  };
}

/**
 * Validate CORS configuration
 */
export function validateCORSConfig(config: CORSConfig): string[] {
  const errors: string[] = [];

  if (!config.methods || config.methods.length === 0) {
    errors.push('Methods array cannot be empty');
  }

  if (!config.allowedHeaders || config.allowedHeaders.length === 0) {
    errors.push('Allowed headers array cannot be empty');
  }

  if (config.maxAge < 0) {
    errors.push('Max age cannot be negative');
  }

  if (config.credentials && config.origin === true) {
    errors.push('Cannot set credentials to true with wildcard origin');
  }

  return errors;
}

/**
 * Log CORS violations for monitoring
 */
export function logCORSViolation(req: NextRequest, reason: string): void {
  const origin = req.headers.get('Origin');
  const userAgent = req.headers.get('User-Agent');
  const ip = req.headers.get('X-Forwarded-For') || req.headers.get('X-Real-IP') || 'unknown';

  console.warn('CORS violation:', {
    origin,
    ip,
    userAgent,
    reason,
    timestamp: new Date().toISOString(),
    path: req.nextUrl.pathname,
    method: req.method,
  });
}

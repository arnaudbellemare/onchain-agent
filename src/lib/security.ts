import { NextRequest, NextResponse } from 'next/server';

// Rate limiting store (in production, use Redis)
const rateLimitStore = new Map<string, { count: number; resetTime: number }>();

// Security headers
export function addSecurityHeaders(response: NextResponse): NextResponse {
  // Prevent clickjacking
  response.headers.set('X-Frame-Options', 'DENY');
  
  // Prevent MIME type sniffing
  response.headers.set('X-Content-Type-Options', 'nosniff');
  
  // Enable XSS protection
  response.headers.set('X-XSS-Protection', '1; mode=block');
  
  // Strict Transport Security (HTTPS only)
  response.headers.set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
  
  // Content Security Policy
  response.headers.set('Content-Security-Policy', 
    "default-src 'self'; " +
    "script-src 'self' 'unsafe-inline' 'unsafe-eval'; " +
    "style-src 'self' 'unsafe-inline'; " +
    "img-src 'self' data: https:; " +
    "font-src 'self' data:; " +
    "connect-src 'self' https://api.openai.com https://api.anthropic.com;"
  );
  
  // Referrer Policy
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  
  // Permissions Policy
  response.headers.set('Permissions-Policy', 
    'camera=(), microphone=(), geolocation=(), payment=()'
  );

  return response;
}

// Rate limiting middleware
export function checkRateLimit(
  identifier: string, 
  limit: number = 100, 
  windowMs: number = 15 * 60 * 1000 // 15 minutes
): { allowed: boolean; remaining: number; resetTime: number } {
  const now = Date.now();
  const key = `rate_limit:${identifier}`;
  
  const current = rateLimitStore.get(key);
  
  if (!current || now > current.resetTime) {
    // Reset or initialize
    rateLimitStore.set(key, {
      count: 1,
      resetTime: now + windowMs
    });
    
    return {
      allowed: true,
      remaining: limit - 1,
      resetTime: now + windowMs
    };
  }
  
  if (current.count >= limit) {
    return {
      allowed: false,
      remaining: 0,
      resetTime: current.resetTime
    };
  }
  
  // Increment counter
  current.count++;
  rateLimitStore.set(key, current);
  
  return {
    allowed: true,
    remaining: limit - current.count,
    resetTime: current.resetTime
  };
}

// IP-based rate limiting
export function checkIPRateLimit(request: NextRequest): { allowed: boolean; remaining: number; resetTime: number } {
  const ip = getClientIP(request);
  return checkRateLimit(ip, 1000, 15 * 60 * 1000); // 1000 requests per 15 minutes per IP
}

// Get client IP address
export function getClientIP(request: NextRequest): string {
  const forwarded = request.headers.get('x-forwarded-for');
  const realIP = request.headers.get('x-real-ip');
  
  if (forwarded) {
    return forwarded.split(',')[0].trim();
  }
  
  if (realIP) {
    return realIP;
  }
  
  return 'unknown';
}

// Validate request size
export function validateRequestSize(request: NextRequest, maxSize: number = 1024 * 1024): boolean {
  const contentLength = request.headers.get('content-length');
  
  if (contentLength) {
    const size = parseInt(contentLength, 10);
    return size <= maxSize;
  }
  
  return true; // Allow if no content-length header
}

// Sanitize input data
export function sanitizeInput(data: any): any {
  if (typeof data === 'string') {
    // Remove potentially dangerous characters
    return data
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
      .replace(/javascript:/gi, '')
      .replace(/on\w+\s*=/gi, '');
  }
  
  if (Array.isArray(data)) {
    return data.map(sanitizeInput);
  }
  
  if (data && typeof data === 'object') {
    const sanitized: any = {};
    for (const [key, value] of Object.entries(data)) {
      sanitized[key] = sanitizeInput(value);
    }
    return sanitized;
  }
  
  return data;
}

// API key validation with additional security checks
export function validateAPIKeySecurity(
  apiKey: string,
  request: NextRequest
): { valid: boolean; reason?: string } {
  // Check API key format
  if (!apiKey || typeof apiKey !== 'string') {
    return { valid: false, reason: 'API key is required' };
  }
  
  if (!apiKey.startsWith('oa_') || apiKey.length < 32) {
    return { valid: false, reason: 'Invalid API key format' };
  }
  
  // Check for suspicious patterns
  if (apiKey.includes(' ') || apiKey.includes('\n') || apiKey.includes('\r')) {
    return { valid: false, reason: 'API key contains invalid characters' };
  }
  
  // Check request headers for suspicious activity
  const userAgent = request.headers.get('user-agent');
  if (!userAgent || userAgent.length < 10) {
    return { valid: false, reason: 'Invalid user agent' };
  }
  
  // Check for common attack patterns in user agent
  const suspiciousPatterns = [
    'sqlmap', 'nikto', 'nmap', 'masscan', 'zap', 'burp',
    'scanner', 'exploit', 'inject', 'payload'
  ];
  
  if (suspiciousPatterns.some(pattern => 
    userAgent.toLowerCase().includes(pattern)
  )) {
    return { valid: false, reason: 'Suspicious user agent detected' };
  }
  
  return { valid: true };
}

// Request logging for security monitoring
export function logSecurityEvent(
  type: 'rate_limit_exceeded' | 'invalid_api_key' | 'suspicious_request' | 'success',
  details: {
    ip: string;
    userAgent: string;
    apiKey?: string;
    endpoint?: string;
    timestamp: string;
  }
) {
  const logEntry = {
    type,
    ...details,
    severity: type === 'success' ? 'info' : 'warning'
  };
  
  // In production, send to logging service (e.g., Winston, CloudWatch, etc.)
  console.log(`[SECURITY] ${type.toUpperCase()}:`, logEntry);
  
  // Store in rate limit store for monitoring
  const key = `security_log:${details.ip}:${Date.now()}`;
  rateLimitStore.set(key, {
    count: 1,
    resetTime: Date.now() + 24 * 60 * 60 * 1000 // 24 hours
  });
}

// Cleanup old rate limit entries
export function cleanupRateLimitStore() {
  const now = Date.now();
  const maxAge = 24 * 60 * 60 * 1000; // 24 hours
  
  for (const [key, value] of rateLimitStore.entries()) {
    if (now > value.resetTime + maxAge) {
      rateLimitStore.delete(key);
    }
  }
}

// Run cleanup every hour
setInterval(cleanupRateLimitStore, 60 * 60 * 1000);
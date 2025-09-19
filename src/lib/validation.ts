/**
 * Input Validation and Sanitization
 * Comprehensive validation and sanitization for all API inputs
 */

import { NextRequest } from 'next/server';
import DOMPurify from 'isomorphic-dompurify';

// Validation schemas
export interface ValidationSchema {
  [key: string]: {
    type: 'string' | 'number' | 'boolean' | 'array' | 'object' | 'email' | 'url' | 'address' | 'amount';
    required?: boolean;
    min?: number;
    max?: number;
    pattern?: RegExp;
    enum?: string[];
    sanitize?: boolean;
    custom?: (value: any) => boolean | string;
  };
}

/**
 * Sanitize string input
 */
export function sanitizeString(input: string): string {
  if (typeof input !== 'string') {
    return '';
  }

  // Remove HTML tags and script content
  let sanitized = DOMPurify.sanitize(input, {
    ALLOWED_TAGS: [],
    ALLOWED_ATTR: [],
  });

  // Remove control characters except newlines and tabs
  sanitized = sanitized.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '');

  // Normalize whitespace
  sanitized = sanitized.replace(/\s+/g, ' ').trim();

  return sanitized;
}

/**
 * Sanitize email address
 */
export function sanitizeEmail(email: string): string {
  if (typeof email !== 'string') {
    return '';
  }

  const sanitized = email.toLowerCase().trim();
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  
  return emailRegex.test(sanitized) ? sanitized : '';
}

/**
 * Sanitize URL
 */
export function sanitizeUrl(url: string): string {
  if (typeof url !== 'string') {
    return '';
  }

  const sanitized = url.trim();
  try {
    const urlObj = new URL(sanitized);
    // Only allow http and https protocols
    if (urlObj.protocol !== 'http:' && urlObj.protocol !== 'https:') {
      return '';
    }
    return urlObj.toString();
  } catch {
    return '';
  }
}

/**
 * Sanitize blockchain address
 */
export function sanitizeAddress(address: string): string {
  if (typeof address !== 'string') {
    return '';
  }

  const sanitized = address.trim();
  
  // Ethereum address validation (0x followed by 40 hex characters)
  if (sanitized.match(/^0x[a-fA-F0-9]{40}$/)) {
    return sanitized.toLowerCase();
  }
  
  return '';
}

/**
 * Sanitize amount (number)
 */
export function sanitizeAmount(amount: any): number {
  if (typeof amount === 'number') {
    return Math.max(0, amount);
  }
  
  if (typeof amount === 'string') {
    const parsed = parseFloat(amount);
    return isNaN(parsed) ? 0 : Math.max(0, parsed);
  }
  
  return 0;
}

/**
 * Validate and sanitize input according to schema
 */
export function validateAndSanitize(
  input: any,
  schema: ValidationSchema
): {
  isValid: boolean;
  data: any;
  errors: string[];
} {
  const errors: string[] = [];
  const sanitizedData: any = {};

  for (const [key, rules] of Object.entries(schema)) {
    const value = input[key];

    // Check if required field is missing
    if (rules.required && (value === undefined || value === null || value === '')) {
      errors.push(`${key} is required`);
      continue;
    }

    // Skip validation if value is not provided and not required
    if (value === undefined || value === null) {
      sanitizedData[key] = undefined;
      continue;
    }

    let sanitizedValue = value;

    // Type validation and sanitization
    switch (rules.type) {
      case 'string':
        if (typeof value !== 'string') {
          errors.push(`${key} must be a string`);
          continue;
        }
        sanitizedValue = rules.sanitize ? sanitizeString(value) : value;
        break;

      case 'number':
        const numValue = sanitizeAmount(value);
        if (isNaN(numValue)) {
          errors.push(`${key} must be a valid number`);
          continue;
        }
        sanitizedValue = numValue;
        break;

      case 'boolean':
        if (typeof value !== 'boolean') {
          errors.push(`${key} must be a boolean`);
          continue;
        }
        sanitizedValue = value;
        break;

      case 'email':
        sanitizedValue = sanitizeEmail(value);
        if (!sanitizedValue) {
          errors.push(`${key} must be a valid email address`);
          continue;
        }
        break;

      case 'url':
        sanitizedValue = sanitizeUrl(value);
        if (!sanitizedValue) {
          errors.push(`${key} must be a valid URL`);
          continue;
        }
        break;

      case 'address':
        sanitizedValue = sanitizeAddress(value);
        if (!sanitizedValue) {
          errors.push(`${key} must be a valid blockchain address`);
          continue;
        }
        break;

      case 'amount':
        sanitizedValue = sanitizeAmount(value);
        if (sanitizedValue <= 0) {
          errors.push(`${key} must be a positive amount`);
          continue;
        }
        break;

      case 'array':
        if (!Array.isArray(value)) {
          errors.push(`${key} must be an array`);
          continue;
        }
        sanitizedValue = value;
        break;

      case 'object':
        if (typeof value !== 'object' || Array.isArray(value)) {
          errors.push(`${key} must be an object`);
          continue;
        }
        sanitizedValue = value;
        break;
    }

    // Length validation for strings
    if (rules.type === 'string' && typeof sanitizedValue === 'string') {
      if (rules.min !== undefined && sanitizedValue.length < rules.min) {
        errors.push(`${key} must be at least ${rules.min} characters long`);
        continue;
      }
      if (rules.max !== undefined && sanitizedValue.length > rules.max) {
        errors.push(`${key} must be no more than ${rules.max} characters long`);
        continue;
      }
    }

    // Range validation for numbers
    if (rules.type === 'number' && typeof sanitizedValue === 'number') {
      if (rules.min !== undefined && sanitizedValue < rules.min) {
        errors.push(`${key} must be at least ${rules.min}`);
        continue;
      }
      if (rules.max !== undefined && sanitizedValue > rules.max) {
        errors.push(`${key} must be no more than ${rules.max}`);
        continue;
      }
    }

    // Pattern validation
    if (rules.pattern && typeof sanitizedValue === 'string') {
      if (!rules.pattern.test(sanitizedValue)) {
        errors.push(`${key} format is invalid`);
        continue;
      }
    }

    // Enum validation
    if (rules.enum && !rules.enum.includes(sanitizedValue)) {
      errors.push(`${key} must be one of: ${rules.enum.join(', ')}`);
      continue;
    }

    // Custom validation
    if (rules.custom) {
      const customResult = rules.custom(sanitizedValue);
      if (customResult !== true) {
        errors.push(typeof customResult === 'string' ? customResult : `${key} is invalid`);
        continue;
      }
    }

    sanitizedData[key] = sanitizedValue;
  }

  return {
    isValid: errors.length === 0,
    data: sanitizedData,
    errors,
  };
}

/**
 * Common validation schemas
 */
export const validationSchemas = {
  // AI API request validation
  aiRequest: {
    prompt: {
      type: 'string' as const,
      required: true,
      min: 1,
      max: 10000,
      sanitize: true,
    },
    model: {
      type: 'string' as const,
      required: false,
      enum: ['gpt-4', 'gpt-3.5-turbo', 'claude-3', 'claude-3-sonnet', 'perplexity'],
    },
    maxTokens: {
      type: 'number' as const,
      required: false,
      min: 1,
      max: 4000,
    },
    temperature: {
      type: 'number' as const,
      required: false,
      min: 0,
      max: 2,
    },
  },

  // Blockchain transaction validation
  blockchainTransaction: {
    to: {
      type: 'address' as const,
      required: true,
    },
    amount: {
      type: 'amount' as const,
      required: true,
      max: 1000000, // Max 1M units
    },
    currency: {
      type: 'string' as const,
      required: true,
      enum: ['ETH', 'USDC', 'USDT'],
    },
  },

  // Payment request validation
  paymentRequest: {
    amount: {
      type: 'amount' as const,
      required: true,
      max: 100000,
    },
    currency: {
      type: 'string' as const,
      required: true,
      enum: ['USD', 'USDC', 'ETH'],
    },
    recipient: {
      type: 'address' as const,
      required: true,
    },
    urgency: {
      type: 'string' as const,
      required: false,
      enum: ['low', 'medium', 'high'],
    },
    type: {
      type: 'string' as const,
      required: false,
      enum: ['vendor_payment', 'payroll', 'invoice', 'refund', 'subscription'],
    },
  },

  // User registration validation
  userRegistration: {
    email: {
      type: 'email' as const,
      required: true,
    },
    name: {
      type: 'string' as const,
      required: true,
      min: 2,
      max: 100,
      sanitize: true,
    },
    company: {
      type: 'string' as const,
      required: false,
      max: 200,
      sanitize: true,
    },
  },

  // API key validation
  apiKey: {
    name: {
      type: 'string' as const,
      required: true,
      min: 1,
      max: 100,
      sanitize: true,
    },
    permissions: {
      type: 'array' as const,
      required: false,
    },
  },
};

/**
 * Middleware to validate request body
 */
export function validateRequestBody(schema: ValidationSchema) {
  return async (req: NextRequest, handler: (req: NextRequest, data: any) => Promise<Response>) => {
    try {
      const body = await req.json();
      const validation = validateAndSanitize(body, schema);

      if (!validation.isValid) {
        return new Response(
          JSON.stringify({
            error: 'Validation failed',
            details: validation.errors,
          }),
          {
            status: 400,
            headers: { 'Content-Type': 'application/json' },
          }
        );
      }

      return handler(req, validation.data);
    } catch (error) {
      return new Response(
        JSON.stringify({
          error: 'Invalid JSON',
          message: 'Request body must be valid JSON',
        }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }
  };
}

/**
 * Middleware to validate query parameters
 */
export function validateQueryParams(schema: ValidationSchema) {
  return (req: NextRequest, handler: (req: NextRequest, data: any) => Promise<Response>) => {
    const url = new URL(req.url);
    const queryParams: any = {};
    
    for (const [key, value] of url.searchParams.entries()) {
      queryParams[key] = value;
    }

    const validation = validateAndSanitize(queryParams, schema);

    if (!validation.isValid) {
      return new Response(
        JSON.stringify({
          error: 'Invalid query parameters',
          details: validation.errors,
        }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    return handler(req, validation.data);
  };
}

/**
 * Sanitize error message for client consumption
 */
export function sanitizeErrorMessage(error: any): string {
  if (typeof error === 'string') {
    return sanitizeString(error);
  }

  if (error instanceof Error) {
    // In production, don't expose internal error details
    if (process.env.NODE_ENV === 'production') {
      return 'An internal error occurred. Please try again later.';
    }
    return sanitizeString(error.message);
  }

  return 'An unexpected error occurred';
}

/**
 * Create a safe error response
 */
export function createErrorResponse(
  status: number,
  message: string,
  details?: any
): Response {
  const sanitizedMessage = sanitizeErrorMessage(message);
  
  const response: any = {
    error: 'Request failed',
    message: sanitizedMessage,
    timestamp: new Date().toISOString(),
  };

  // Only include details in development
  if (process.env.NODE_ENV === 'development' && details) {
    response.details = details;
  }

  return new Response(JSON.stringify(response), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

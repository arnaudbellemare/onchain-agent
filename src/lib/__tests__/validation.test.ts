/**
 * Validation Tests
 */

import {
  validateAndSanitize,
  sanitizeString,
  sanitizeEmail,
  sanitizeUrl,
  sanitizeAddress,
  sanitizeAmount,
  validationSchemas,
  createErrorResponse,
} from '../validation';

describe('Validation and Sanitization', () => {
  describe('sanitizeString', () => {
    it('should remove HTML tags', () => {
      const input = '<script>alert("xss")</script>Hello World';
      const result = sanitizeString(input);
      expect(result).toBe('Hello World');
    });

    it('should normalize whitespace', () => {
      const input = '  Hello    World  \n\n  ';
      const result = sanitizeString(input);
      expect(result).toBe('Hello World');
    });

    it('should handle empty string', () => {
      const result = sanitizeString('');
      expect(result).toBe('');
    });

    it('should handle non-string input', () => {
      const result = sanitizeString(123 as any);
      expect(result).toBe('');
    });
  });

  describe('sanitizeEmail', () => {
    it('should validate and normalize email', () => {
      const input = '  TEST@EXAMPLE.COM  ';
      const result = sanitizeEmail(input);
      expect(result).toBe('test@example.com');
    });

    it('should reject invalid email', () => {
      const input = 'not-an-email';
      const result = sanitizeEmail(input);
      expect(result).toBe('');
    });

    it('should handle empty input', () => {
      const result = sanitizeEmail('');
      expect(result).toBe('');
    });
  });

  describe('sanitizeUrl', () => {
    it('should validate and normalize URL', () => {
      const input = 'https://example.com/path';
      const result = sanitizeUrl(input);
      expect(result).toBe('https://example.com/path');
    });

    it('should reject non-HTTP URLs', () => {
      const input = 'ftp://example.com';
      const result = sanitizeUrl(input);
      expect(result).toBe('');
    });

    it('should reject invalid URL', () => {
      const input = 'not-a-url';
      const result = sanitizeUrl(input);
      expect(result).toBe('');
    });
  });

  describe('sanitizeAddress', () => {
    it('should validate Ethereum address', () => {
      const input = '0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6';
      const result = sanitizeAddress(input);
      expect(result).toBe('0x742d35cc6634c0532925a3b8d4c9db96c4b4d8b6');
    });

    it('should reject invalid address', () => {
      const input = 'not-an-address';
      const result = sanitizeAddress(input);
      expect(result).toBe('');
    });

    it('should handle empty input', () => {
      const result = sanitizeAddress('');
      expect(result).toBe('');
    });
  });

  describe('sanitizeAmount', () => {
    it('should handle positive numbers', () => {
      expect(sanitizeAmount(100)).toBe(100);
      expect(sanitizeAmount('50.5')).toBe(50.5);
    });

    it('should handle negative numbers', () => {
      expect(sanitizeAmount(-10)).toBe(0);
      expect(sanitizeAmount('-5.5')).toBe(0);
    });

    it('should handle invalid input', () => {
      expect(sanitizeAmount('invalid')).toBe(0);
      expect(sanitizeAmount(null)).toBe(0);
      expect(sanitizeAmount(undefined)).toBe(0);
    });
  });

  describe('validateAndSanitize', () => {
    it('should validate required fields', () => {
      const schema = {
        email: { type: 'email' as const, required: true },
        name: { type: 'string' as const, required: true },
      };

      const result = validateAndSanitize({}, schema);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('email is required');
      expect(result.errors).toContain('name is required');
    });

    it('should validate field types', () => {
      const schema = {
        age: { type: 'number' as const },
        isActive: { type: 'boolean' as const },
      };

      const result = validateAndSanitize({
        age: 'not-a-number',
        isActive: 'not-a-boolean',
      }, schema);

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('age must be a valid number');
      expect(result.errors).toContain('isActive must be a boolean');
    });

    it('should validate string length', () => {
      const schema = {
        name: { type: 'string' as const, min: 3, max: 10 },
      };

      const result = validateAndSanitize({
        name: 'ab', // Too short
      }, schema);

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('name must be at least 3 characters long');

      const result2 = validateAndSanitize({
        name: 'abcdefghijk', // Too long
      }, schema);

      expect(result2.isValid).toBe(false);
      expect(result2.errors).toContain('name must be no more than 10 characters long');
    });

    it('should validate enums', () => {
      const schema = {
        status: { type: 'string' as const, enum: ['active', 'inactive'] },
      };

      const result = validateAndSanitize({
        status: 'unknown',
      }, schema);

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('status must be one of: active, inactive');
    });

    it('should sanitize strings when enabled', () => {
      const schema = {
        description: { type: 'string' as const, sanitize: true },
      };

      const result = validateAndSanitize({
        description: '<script>alert("xss")</script>Clean text',
      }, schema);

      expect(result.isValid).toBe(true);
      expect(result.data.description).toBe('Clean text');
    });
  });

  describe('validationSchemas', () => {
    it('should have valid AI request schema', () => {
      const result = validateAndSanitize({
        prompt: 'Test prompt',
        model: 'gpt-4',
        maxTokens: 100,
      }, validationSchemas.aiRequest);

      expect(result.isValid).toBe(true);
      expect(result.data.prompt).toBe('Test prompt');
      expect(result.data.model).toBe('gpt-4');
      expect(result.data.maxTokens).toBe(100);
    });

    it('should validate blockchain transaction schema', () => {
      const result = validateAndSanitize({
        to: '0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6',
        amount: 100,
        currency: 'USDC',
      }, validationSchemas.blockchainTransaction);

      expect(result.isValid).toBe(true);
      expect(result.data.to).toBe('0x742d35cc6634c0532925a3b8d4c9db96c4b4d8b6');
    });

    it('should validate payment request schema', () => {
      const result = validateAndSanitize({
        amount: 50,
        currency: 'USD',
        recipient: '0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6',
        urgency: 'medium',
      }, validationSchemas.paymentRequest);

      expect(result.isValid).toBe(true);
      expect(result.data.amount).toBe(50);
    });
  });

  describe('createErrorResponse', () => {
    it('should create error response with sanitized message', () => {
      const response = createErrorResponse(400, 'Test error message');
      const body = JSON.parse(response.body);
      
      expect(response.status).toBe(400);
      expect(body.error).toBe('Request failed');
      expect(body.message).toBe('Test error message');
      expect(body.timestamp).toBeDefined();
    });

    it('should sanitize error messages', () => {
      const response = createErrorResponse(500, '<script>alert("xss")</script>Error');
      const body = JSON.parse(response.body);
      
      expect(body.message).toBe('Error');
    });

    it('should include details in development', () => {
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = 'development';
      
      const response = createErrorResponse(500, 'Error', { debug: 'info' });
      const body = JSON.parse(response.body);
      
      expect(body.details).toEqual({ debug: 'info' });
      
      process.env.NODE_ENV = originalEnv;
    });

    it('should not include details in production', () => {
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = 'production';
      
      const response = createErrorResponse(500, 'Error', { debug: 'info' });
      const body = JSON.parse(response.body);
      
      expect(body.details).toBeUndefined();
      
      process.env.NODE_ENV = originalEnv;
    });
  });
});

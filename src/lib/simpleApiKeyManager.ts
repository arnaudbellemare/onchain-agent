/**
 * Simple API Key Manager - In-memory storage for demo/testing
 * This is a simplified version that doesn't require database connections
 */

import crypto from 'crypto';

// Global storage interface
declare global {
  var apiKeyStorage: {
    keys: Map<string, SimpleAPIKey>;
    keyToId: Map<string, string>;
  } | undefined;
}

export interface SimpleAPIKey {
  id: string;
  key: string;
  name: string;
  permissions: string[];
  createdAt: string;
  userId: string;
  isActive: boolean;
  usage: {
    calls: number;
    totalCost: number;
    totalSaved: number;
    requests: Array<{
      timestamp: string;
      endpoint: string;
      cost: number;
      saved: number;
      provider: string;
    }>;
  };
  rateLimit: {
    requestsPerHour: number;
    requestsPerDay: number;
  };
}

class SimpleAPIKeyManager {
  private keys: Map<string, SimpleAPIKey>;
  private keyToId: Map<string, string>;

  constructor() {
    // Use global storage to persist across module reloads
    if (!globalThis.apiKeyStorage) {
      globalThis.apiKeyStorage = {
        keys: new Map(),
        keyToId: new Map()
      };
    }
    this.keys = globalThis.apiKeyStorage.keys;
    this.keyToId = globalThis.apiKeyStorage.keyToId;
  }

  /**
   * Generate a new API key
   */
  generateAPIKey(userId: string, name: string, permissions: string[] = ['read', 'write']): { keyId: string; key: string } {
    const keyId = `ak_${crypto.randomBytes(16).toString('hex')}`;
    const key = `ak_${crypto.randomBytes(32).toString('hex')}`;
    
    const apiKey: SimpleAPIKey = {
      id: keyId,
      key,
      name,
      permissions,
      createdAt: new Date().toISOString(),
      userId,
      isActive: true,
      usage: {
        calls: 0,
        totalCost: 0,
        totalSaved: 0,
        requests: []
      },
      rateLimit: {
        requestsPerHour: 1000,
        requestsPerDay: 10000
      }
    };

    this.keys.set(keyId, apiKey);
    this.keyToId.set(key, keyId);

    console.log(`[API Key Manager] Generated new key: ${keyId} for user: ${userId}`);
    console.log(`[API Key Manager] Total keys now: ${this.keys.size}`);

    return { keyId, key };
  }

  /**
   * Validate an API key
   */
  validateAPIKey(key: string): { valid: boolean; keyData?: SimpleAPIKey; reason?: string } {
    console.log(`[API Key Manager] Validating key: ${key.substring(0, 20)}...`);
    console.log(`[API Key Manager] Total keys stored: ${this.keys.size}`);
    console.log(`[API Key Manager] Key mappings: ${this.keyToId.size}`);
    
    const keyId = this.keyToId.get(key);
    if (!keyId) {
      console.log(`[API Key Manager] Key not found in mappings`);
      return { valid: false, reason: 'API key not found' };
    }

    const keyData = this.keys.get(keyId);
    if (!keyData) {
      console.log(`[API Key Manager] Key data not found for ID: ${keyId}`);
      return { valid: false, reason: 'API key data not found' };
    }

    if (!keyData.isActive) {
      console.log(`[API Key Manager] Key is inactive`);
      return { valid: false, reason: 'API key is inactive' };
    }

    console.log(`[API Key Manager] Key validation successful`);
    return { valid: true, keyData };
  }

  /**
   * Get all API keys for a user
   */
  getUserAPIKeys(userId: string): SimpleAPIKey[] {
    return Array.from(this.keys.values()).filter(key => key.userId === userId);
  }

  /**
   * Get all API keys (for admin/dashboard purposes)
   */
  getAllAPIKeys(): SimpleAPIKey[] {
    return Array.from(this.keys.values());
  }

  /**
   * Get API key by ID
   */
  getAPIKeyById(keyId: string): SimpleAPIKey | null {
    return this.keys.get(keyId) || null;
  }

  /**
   * Update API key usage
   */
  updateUsage(key: string, endpoint: string, cost: number, saved: number, provider: string = 'unknown'): boolean {
    console.log(`[API Key Manager] Updating usage for key: ${key.substring(0, 20)}...`);
    const validation = this.validateAPIKey(key);
    console.log(`[API Key Manager] Validation result:`, validation);
    if (!validation.valid || !validation.keyData) {
      console.log(`[API Key Manager] Validation failed:`, validation.reason);
      return false;
    }

    const keyData = validation.keyData;
    keyData.usage.calls++;
    keyData.usage.totalCost += cost;
    keyData.usage.totalSaved += saved;
    keyData.usage.requests.push({
      timestamp: new Date().toISOString(),
      endpoint,
      cost,
      saved,
      provider
    });

    // Keep only last 100 requests
    if (keyData.usage.requests.length > 100) {
      keyData.usage.requests = keyData.usage.requests.slice(-100);
    }

    return true;
  }

  /**
   * Delete an API key
   */
  deleteAPIKey(keyId: string, userId: string): boolean {
    const keyData = this.keys.get(keyId);
    if (!keyData || keyData.userId !== userId) {
      return false;
    }

    this.keys.delete(keyId);
    this.keyToId.delete(keyData.key);
    return true;
  }

  /**
   * Get key preview (first 8 chars + ...)
   */
  getKeyPreview(key: string): string {
    return key.substring(0, 8) + '...';
  }
}

// Export singleton instance
export const simpleApiKeyManager = new SimpleAPIKeyManager();

// Debug function to check manager state
export function debugAPIKeyManager() {
  console.log(`[API Key Manager Debug] Keys stored: ${simpleApiKeyManager['keys'].size}`);
  console.log(`[API Key Manager Debug] Key mappings: ${simpleApiKeyManager['keyToId'].size}`);
  return {
    keysCount: simpleApiKeyManager['keys'].size,
    mappingsCount: simpleApiKeyManager['keyToId'].size
  };
}

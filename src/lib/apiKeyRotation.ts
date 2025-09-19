/**
 * API Key Rotation System
 * Implements secure API key rotation with zero-downtime deployment
 */

import crypto from 'crypto';
import { database } from './productionDatabase';
import { cache, cacheKeys, cacheTTL } from './cache';

export interface APIKeyConfig {
  algorithm: string;
  keyLength: number;
  expirationDays: number;
  rotationDays: number;
  maxActiveKeys: number;
}

export interface RotatedKey {
  oldKey: string;
  newKey: string;
  rotationDate: Date;
  expiresAt: Date;
}

class APIKeyRotationService {
  private config: APIKeyConfig;
  private rotationInProgress = false;

  constructor(config: APIKeyConfig = {
    algorithm: 'aes-256-gcm',
    keyLength: 32,
    expirationDays: 90,
    rotationDays: 30,
    maxActiveKeys: 3,
  }) {
    this.config = config;
    this.startRotationSchedule();
  }

  /**
   * Generate a new API key
   */
  generateAPIKey(): string {
    const keyData = {
      timestamp: Date.now(),
      random: crypto.randomBytes(16).toString('hex'),
      version: 'v1',
    };

    const keyString = JSON.stringify(keyData);
    const keyHash = crypto.createHash('sha256').update(keyString).digest('hex');
    
    return `ak_${keyHash.substring(0, 32)}`;
  }

  /**
   * Hash an API key for storage
   */
  hashAPIKey(apiKey: string): string {
    return crypto.createHash('sha256').update(apiKey).digest('hex');
  }

  /**
   * Verify an API key
   */
  async verifyAPIKey(apiKey: string): Promise<{
    valid: boolean;
    userId?: string;
    permissions?: string[];
    expiresAt?: Date;
  }> {
    try {
      const keyHash = this.hashAPIKey(apiKey);
      const cacheKey = cacheKeys.apiKey(keyHash);

      // Check cache first
      let keyData = await cache.get(cacheKey);
      if (!keyData) {
        // Check database
        const query = `
          SELECT ak.*, u.email, u.name, u.is_active as user_active
          FROM api_keys ak
          JOIN users u ON ak.user_id = u.id
          WHERE ak.key_hash = $1 AND ak.is_active = true
        `;

        const result = await database.query(query, [keyHash]);
        keyData = result.rows[0];

        if (keyData) {
          // Cache for 24 hours
          await cache.set(cacheKey, keyData, cacheTTL.apiKey);
        }
      }

      if (!keyData) {
        return { valid: false };
      }

      // Check if user is active
      if (!keyData.user_active) {
        return { valid: false };
      }

      // Check expiration
      if (keyData.expires_at && new Date(keyData.expires_at) < new Date()) {
        return { valid: false };
      }

      // Update last used timestamp
      await this.updateLastUsed(keyData.id);

      return {
        valid: true,
        userId: keyData.user_id,
        permissions: keyData.permissions || [],
        expiresAt: keyData.expires_at ? new Date(keyData.expires_at) : undefined,
      };
    } catch (error) {
      console.error('API key verification error:', error);
      return { valid: false };
    }
  }

  /**
   * Create a new API key for a user
   */
  async createAPIKey(
    userId: string,
    name: string,
    permissions: string[] = [],
    expiresInDays?: number
  ): Promise<{ key: string; keyId: string }> {
    const apiKey = this.generateAPIKey();
    const keyHash = this.hashAPIKey(apiKey);
    const expiresAt = expiresInDays 
      ? new Date(Date.now() + expiresInDays * 24 * 60 * 60 * 1000)
      : new Date(Date.now() + this.config.expirationDays * 24 * 60 * 60 * 1000);

    const query = `
      INSERT INTO api_keys (user_id, name, key_hash, permissions, expires_at)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING id
    `;

    const result = await database.query(query, [
      userId,
      name,
      keyHash,
      JSON.stringify(permissions),
      expiresAt,
    ]);

    const keyId = result.rows[0].id;

    // Invalidate cache
    await cache.delete(cacheKeys.apiKey(keyHash));

    return { key: apiKey, keyId };
  }

  /**
   * Rotate API keys for a user
   */
  async rotateUserAPIKeys(userId: string): Promise<RotatedKey[]> {
    if (this.rotationInProgress) {
      throw new Error('Key rotation already in progress');
    }

    this.rotationInProgress = true;

    try {
      // Get user's active API keys
      const query = `
        SELECT * FROM api_keys 
        WHERE user_id = $1 AND is_active = true
        ORDER BY created_at ASC
      `;

      const result = await database.query(query, [userId]);
      const activeKeys = result.rows;

      const rotatedKeys: RotatedKey[] = [];

      // Rotate each key
      for (const oldKeyData of activeKeys) {
        const newKey = this.generateAPIKey();
        const newKeyHash = this.hashAPIKey(newKey);
        const expiresAt = new Date(Date.now() + this.config.expirationDays * 24 * 60 * 60 * 1000);

        // Create new key
        const insertQuery = `
          INSERT INTO api_keys (user_id, name, key_hash, permissions, expires_at)
          VALUES ($1, $2, $3, $4, $5)
          RETURNING id
        `;

        await database.query(insertQuery, [
          userId,
          `${oldKeyData.name} (rotated)`,
          newKeyHash,
          oldKeyData.permissions,
          expiresAt,
        ]);

        // Deactivate old key
        const updateQuery = `
          UPDATE api_keys 
          SET is_active = false, updated_at = CURRENT_TIMESTAMP
          WHERE id = $1
        `;

        await database.query(updateQuery, [oldKeyData.id]);

        // Invalidate old key cache
        await cache.delete(cacheKeys.apiKey(oldKeyData.key_hash));

        rotatedKeys.push({
          oldKey: oldKeyData.key_hash, // We don't store the actual key
          newKey,
          rotationDate: new Date(),
          expiresAt,
        });
      }

      return rotatedKeys;
    } finally {
      this.rotationInProgress = false;
    }
  }

  /**
   * Bulk rotate API keys for all users
   */
  async bulkRotateAPIKeys(): Promise<{
    totalUsers: number;
    totalKeysRotated: number;
    errors: string[];
  }> {
    const result = {
      totalUsers: 0,
      totalKeysRotated: 0,
      errors: [] as string[],
    };

    try {
      // Get all users with active API keys
      const query = `
        SELECT DISTINCT u.id, u.email
        FROM users u
        JOIN api_keys ak ON u.id = ak.user_id
        WHERE ak.is_active = true AND u.is_active = true
      `;

      const usersResult = await database.query(query);
      const users = usersResult.rows;

      result.totalUsers = users.length;

      // Rotate keys for each user
      for (const user of users) {
        try {
          const rotatedKeys = await this.rotateUserAPIKeys(user.id);
          result.totalKeysRotated += rotatedKeys.length;

          console.log(`Rotated ${rotatedKeys.length} keys for user ${user.email}`);
        } catch (error) {
          const errorMsg = `Failed to rotate keys for user ${user.email}: ${error}`;
          result.errors.push(errorMsg);
          console.error(errorMsg);
        }
      }

      return result;
    } catch (error) {
      console.error('Bulk rotation error:', error);
      throw error;
    }
  }

  /**
   * Clean up expired API keys
   */
  async cleanupExpiredKeys(): Promise<number> {
    try {
      const query = `
        UPDATE api_keys 
        SET is_active = false, updated_at = CURRENT_TIMESTAMP
        WHERE expires_at < NOW() AND is_active = true
        RETURNING id, key_hash
      `;

      const result = await database.query(query);
      const expiredKeys = result.rows;

      // Invalidate cache for expired keys
      for (const key of expiredKeys) {
        await cache.delete(cacheKeys.apiKey(key.key_hash));
      }

      console.log(`Cleaned up ${expiredKeys.length} expired API keys`);
      return expiredKeys.length;
    } catch (error) {
      console.error('Cleanup expired keys error:', error);
      return 0;
    }
  }

  /**
   * Get API key statistics
   */
  async getAPIKeyStats(): Promise<{
    totalKeys: number;
    activeKeys: number;
    expiredKeys: number;
    expiringSoon: number;
    rotationDue: number;
  }> {
    try {
      const queries = {
        totalKeys: 'SELECT COUNT(*) FROM api_keys',
        activeKeys: 'SELECT COUNT(*) FROM api_keys WHERE is_active = true',
        expiredKeys: 'SELECT COUNT(*) FROM api_keys WHERE expires_at < NOW() AND is_active = true',
        expiringSoon: 'SELECT COUNT(*) FROM api_keys WHERE expires_at < NOW() + INTERVAL \'7 days\' AND is_active = true',
        rotationDue: 'SELECT COUNT(*) FROM api_keys WHERE created_at < NOW() - INTERVAL \'30 days\' AND is_active = true',
      };

      const stats: any = {};

      for (const [key, query] of Object.entries(queries)) {
        const result = await database.query(query);
        stats[key] = parseInt(result.rows[0].count);
      }

      return stats;
    } catch (error) {
      console.error('Get API key stats error:', error);
      return {
        totalKeys: 0,
        activeKeys: 0,
        expiredKeys: 0,
        expiringSoon: 0,
        rotationDue: 0,
      };
    }
  }

  /**
   * Update last used timestamp
   */
  private async updateLastUsed(keyId: string): Promise<void> {
    try {
      const query = `
        UPDATE api_keys 
        SET last_used = CURRENT_TIMESTAMP 
        WHERE id = $1
      `;

      await database.query(query, [keyId]);
    } catch (error) {
      console.error('Update last used error:', error);
    }
  }

  /**
   * Start automatic rotation schedule
   */
  private startRotationSchedule(): void {
    // Run cleanup every hour
    setInterval(async () => {
      await this.cleanupExpiredKeys();
    }, 60 * 60 * 1000);

    // Run rotation check daily
    setInterval(async () => {
      try {
        const stats = await this.getAPIKeyStats();
        if (stats.rotationDue > 0) {
          console.log(`Found ${stats.rotationDue} keys due for rotation`);
          // In production, you might want to send notifications instead of auto-rotating
        }
      } catch (error) {
        console.error('Rotation check error:', error);
      }
    }, 24 * 60 * 60 * 1000);
  }

  /**
   * Revoke an API key
   */
  async revokeAPIKey(keyId: string): Promise<boolean> {
    try {
      const query = `
        UPDATE api_keys 
        SET is_active = false, updated_at = CURRENT_TIMESTAMP
        WHERE id = $1
        RETURNING key_hash
      `;

      const result = await database.query(query, [keyId]);
      if (result.rows.length > 0) {
        const keyHash = result.rows[0].key_hash;
        await cache.delete(cacheKeys.apiKey(keyHash));
        return true;
      }

      return false;
    } catch (error) {
      console.error('Revoke API key error:', error);
      return false;
    }
  }

  /**
   * Get user's API keys
   */
  async getUserAPIKeys(userId: string): Promise<any[]> {
    try {
      const query = `
        SELECT id, name, permissions, last_used, expires_at, created_at, is_active
        FROM api_keys 
        WHERE user_id = $1
        ORDER BY created_at DESC
      `;

      const result = await database.query(query, [userId]);
      return result.rows;
    } catch (error) {
      console.error('Get user API keys error:', error);
      return [];
    }
  }
}

// Global API key rotation service
export const apiKeyRotation = new APIKeyRotationService();

// Middleware to extract and verify API key
export function withAPIKeyAuth(handler: (req: any, userId: string, permissions: string[]) => Promise<Response>) {
  return async (req: any): Promise<Response> => {
    const authHeader = req.headers.get('Authorization');
    const apiKeyHeader = req.headers.get('X-API-Key');

    let apiKey: string | null = null;

    if (authHeader && authHeader.startsWith('Bearer ')) {
      apiKey = authHeader.substring(7);
    } else if (apiKeyHeader) {
      apiKey = apiKeyHeader;
    }

    if (!apiKey) {
      return new Response(
        JSON.stringify({
          error: 'API key required',
          message: 'Please provide an API key in the Authorization header or X-API-Key header',
        }),
        {
          status: 401,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    const verification = await apiKeyRotation.verifyAPIKey(apiKey);
    if (!verification.valid) {
      return new Response(
        JSON.stringify({
          error: 'Invalid API key',
          message: 'The provided API key is invalid or expired',
        }),
        {
          status: 401,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    return handler(req, verification.userId!, verification.permissions || []);
  };
}

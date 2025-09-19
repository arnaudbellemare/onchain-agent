/**
 * Comprehensive Caching Strategy
 * Implements multi-layer caching with Redis and in-memory fallbacks
 */

import Redis from 'ioredis';
// import { database } from './database';

export interface CacheConfig {
  defaultTTL: number; // seconds
  maxMemory: number; // bytes
  compressionEnabled: boolean;
  serializationEnabled: boolean;
}

export interface CacheEntry<T = any> {
  value: T;
  expiresAt: number;
  createdAt: number;
  accessCount: number;
  lastAccessed: number;
}

class CacheService {
  private redis: Redis | null = null;
  private memoryCache: Map<string, CacheEntry> = new Map();
  private config: CacheConfig;
  private isRedisAvailable = false;

  constructor(config: CacheConfig = {
    defaultTTL: 3600, // 1 hour
    maxMemory: 100 * 1024 * 1024, // 100MB
    compressionEnabled: true,
    serializationEnabled: true,
  }) {
    this.config = config;
    this.initializeRedis();
    this.startCleanupInterval();
  }

  /**
   * Initialize Redis connection
   */
  private async initializeRedis(): Promise<void> {
    try {
      if (process.env.REDIS_HOST) {
        this.redis = new Redis({
          host: process.env.REDIS_HOST,
          port: parseInt(process.env.REDIS_PORT || '6379'),
          password: process.env.REDIS_PASSWORD,
          db: parseInt(process.env.REDIS_DB || '0'),
          maxRetriesPerRequest: 3,
          lazyConnect: true,
        });

        await this.redis.ping();
        this.isRedisAvailable = true;
        console.log('Redis cache initialized successfully');
      }
    } catch (error) {
      console.warn('Redis not available, falling back to memory cache:', error);
      this.isRedisAvailable = false;
    }
  }

  /**
   * Get value from cache
   */
  async get<T = any>(key: string): Promise<T | null> {
    try {
      // Try Redis first if available
      if (this.isRedisAvailable && this.redis) {
        const value = await this.redis.get(key);
        if (value) {
          return this.deserialize(value);
        }
      }

      // Fallback to memory cache
      const entry = this.memoryCache.get(key);
      if (entry && entry.expiresAt > Date.now()) {
        entry.accessCount++;
        entry.lastAccessed = Date.now();
        return entry.value;
      }

      // Clean up expired entry
      if (entry) {
        this.memoryCache.delete(key);
      }

      return null;
    } catch (error) {
      console.error('Cache get error:', error);
      return null;
    }
  }

  /**
   * Set value in cache
   */
  async set<T = any>(key: string, value: T, ttl?: number): Promise<boolean> {
    try {
      const expiresAt = Date.now() + (ttl || this.config.defaultTTL) * 1000;
      const serializedValue = this.serialize(value);

      // Try Redis first if available
      if (this.isRedisAvailable && this.redis) {
        await this.redis.setex(key, ttl || this.config.defaultTTL, serializedValue);
        return true;
      }

      // Fallback to memory cache
      const entry: CacheEntry<T> = {
        value,
        expiresAt,
        createdAt: Date.now(),
        accessCount: 0,
        lastAccessed: Date.now(),
      };

      this.memoryCache.set(key, entry);
      this.enforceMemoryLimit();
      return true;
    } catch (error) {
      console.error('Cache set error:', error);
      return false;
    }
  }

  /**
   * Delete value from cache
   */
  async delete(key: string): Promise<boolean> {
    try {
      // Delete from Redis if available
      if (this.isRedisAvailable && this.redis) {
        await this.redis.del(key);
      }

      // Delete from memory cache
      return this.memoryCache.delete(key);
    } catch (error) {
      console.error('Cache delete error:', error);
      return false;
    }
  }

  /**
   * Check if key exists in cache
   */
  async exists(key: string): Promise<boolean> {
    try {
      if (this.isRedisAvailable && this.redis) {
        const exists = await this.redis.exists(key);
        return exists === 1;
      }

      const entry = this.memoryCache.get(key);
      return entry ? entry.expiresAt > Date.now() : false;
    } catch (error) {
      console.error('Cache exists error:', error);
      return false;
    }
  }

  /**
   * Get or set pattern
   */
  async getOrSet<T = any>(
    key: string,
    factory: () => Promise<T>,
    ttl?: number
  ): Promise<T> {
    const cached = await this.get<T>(key);
    if (cached !== null) {
      return cached;
    }

    const value = await factory();
    await this.set(key, value, ttl);
    return value;
  }

  /**
   * Clear all cache
   */
  async clear(): Promise<void> {
    try {
      if (this.isRedisAvailable && this.redis) {
        await this.redis.flushdb();
      }

      this.memoryCache.clear();
    } catch (error) {
      console.error('Cache clear error:', error);
    }
  }

  /**
   * Get cache statistics
   */
  getStats(): {
    memoryEntries: number;
    memorySize: number;
    redisAvailable: boolean;
    hitRate: number;
  } {
    let totalAccesses = 0;
    let totalHits = 0;

    for (const entry of this.memoryCache.values()) {
      totalAccesses += entry.accessCount;
      if (entry.expiresAt > Date.now()) {
        totalHits += entry.accessCount;
      }
    }

    return {
      memoryEntries: this.memoryCache.size,
      memorySize: this.calculateMemoryUsage(),
      redisAvailable: this.isRedisAvailable,
      hitRate: totalAccesses > 0 ? totalHits / totalAccesses : 0,
    };
  }

  /**
   * Serialize value for storage
   */
  private serialize(value: any): string {
    if (this.config.serializationEnabled) {
      return JSON.stringify(value);
    }
    return String(value);
  }

  /**
   * Deserialize value from storage
   */
  private deserialize<T>(value: string): T {
    if (this.config.serializationEnabled) {
      return JSON.parse(value);
    }
    return value as T;
  }

  /**
   * Enforce memory limit
   */
  private enforceMemoryLimit(): void {
    const currentSize = this.calculateMemoryUsage();
    if (currentSize > this.config.maxMemory) {
      // Remove least recently used entries
      const entries = Array.from(this.memoryCache.entries());
      entries.sort((a, b) => a[1].lastAccessed - b[1].lastAccessed);

      const toRemove = Math.ceil(entries.length * 0.1); // Remove 10%
      for (let i = 0; i < toRemove; i++) {
        this.memoryCache.delete(entries[i][0]);
      }
    }
  }

  /**
   * Calculate memory usage
   */
  private calculateMemoryUsage(): number {
    let size = 0;
    for (const [key, entry] of this.memoryCache.entries()) {
      size += key.length * 2; // UTF-16
      size += JSON.stringify(entry).length * 2;
    }
    return size;
  }

  /**
   * Start cleanup interval
   */
  private startCleanupInterval(): void {
    setInterval(() => {
      const now = Date.now();
      for (const [key, entry] of this.memoryCache.entries()) {
        if (entry.expiresAt <= now) {
          this.memoryCache.delete(key);
        }
      }
    }, 60000); // Run every minute
  }
}

// Global cache service instance
export const cache = new CacheService();

// Cache decorators and utilities
export function cached(ttl: number = 3600) {
  return function(target: any, propertyName: string, descriptor: PropertyDescriptor) {
    const method = descriptor.value;

    descriptor.value = async function(...args: any[]) {
      const cacheKey = `${target.constructor.name}:${propertyName}:${JSON.stringify(args)}`;
      
      const cached = await cache.get(cacheKey);
      if (cached !== null) {
        return cached;
      }

      const result = await method.apply(this, args);
      await cache.set(cacheKey, result, ttl);
      return result;
    };
  };
}

export function invalidateCache(pattern: string) {
  return function(target: any, propertyName: string, descriptor: PropertyDescriptor) {
    const method = descriptor.value;

    descriptor.value = async function(...args: any[]) {
      const result = await method.apply(this, args);
      
      // Clear cache entries matching pattern
      if (cache['isRedisAvailable'] && cache['redis']) {
        const keys = await cache['redis'].keys(pattern);
        if (keys.length > 0) {
          await cache['redis'].del(...keys);
        }
      }

      return result;
    };
  };
}

// Cache key generators
export const cacheKeys = {
  user: (id: string) => `user:${id}`,
  apiKey: (hash: string) => `apikey:${hash}`,
  transaction: (id: string) => `transaction:${id}`,
  aiCall: (id: string) => `aicall:${id}`,
  optimization: (id: string) => `optimization:${id}`,
  rateLimit: (key: string) => `ratelimit:${key}`,
  systemMetric: (name: string) => `metric:${name}`,
};

// Cache TTL constants
export const cacheTTL = {
  user: 3600, // 1 hour
  apiKey: 86400, // 24 hours
  transaction: 86400, // 24 hours
  aiCall: 3600, // 1 hour
  optimization: 7200, // 2 hours
  rateLimit: 900, // 15 minutes
  systemMetric: 300, // 5 minutes
};

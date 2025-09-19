/**
 * Proper Caching System for API Optimization
 * Addresses database, security, and scalability concerns
 */

import { Redis } from 'ioredis';
import crypto from 'crypto';

interface CacheEntry {
  id: string;
  promptHash: string;
  response: string;
  cost: number;
  timestamp: number;
  ttl: number;
  hitCount: number;
  userId?: string; // For user-specific caching
  isPublic: boolean; // Whether this can be shared across users
}

interface CacheStats {
  hits: number;
  misses: number;
  evictions: number;
  totalSize: number;
  hitRate: number;
}

export class ProperCacheSystem {
  private redis: Redis;
  private stats: CacheStats = {
    hits: 0,
    misses: 0,
    evictions: 0,
    totalSize: 0,
    hitRate: 0
  };

  constructor(redisUrl?: string) {
    // Use Redis for distributed caching
    this.redis = new Redis(redisUrl || process.env.REDIS_URL || 'redis://localhost:6379');
  }

  /**
   * Generate secure cache key with proper hashing
   */
  private generateCacheKey(prompt: string, userId?: string): string {
    // Use SHA-256 for secure hashing
    const hash = crypto.createHash('sha256');
    hash.update(prompt);
    const promptHash = hash.digest('hex');
    
    // Include user ID for user-specific caching
    return userId ? `cache:${userId}:${promptHash}` : `cache:public:${promptHash}`;
  }

  /**
   * Check if response can be cached (security check)
   */
  private canCache(response: string, prompt: string): boolean {
    // Don't cache sensitive information
    const sensitivePatterns = [
      /password/i,
      /token/i,
      /secret/i,
      /key/i,
      /credential/i,
      /ssn/i,
      /social security/i
    ];

    const combinedText = `${prompt} ${response}`.toLowerCase();
    
    return !sensitivePatterns.some(pattern => pattern.test(combinedText));
  }

  /**
   * Get cached response
   */
  async get(prompt: string, userId?: string): Promise<CacheEntry | null> {
    try {
      const cacheKey = this.generateCacheKey(prompt, userId);
      const cached = await this.redis.get(cacheKey);
      
      if (!cached) {
        this.stats.misses++;
        return null;
      }

      const entry: CacheEntry = JSON.parse(cached);
      
      // Check TTL
      if (Date.now() - entry.timestamp > entry.ttl) {
        await this.redis.del(cacheKey);
        this.stats.misses++;
        return null;
      }

      // Update hit count
      entry.hitCount++;
      await this.redis.setex(cacheKey, Math.floor(entry.ttl / 1000), JSON.stringify(entry));
      
      this.stats.hits++;
      return entry;
      
    } catch (error) {
      console.error('Cache get error:', error);
      this.stats.misses++;
      return null;
    }
  }

  /**
   * Set cached response
   */
  async set(
    prompt: string, 
    response: string, 
    cost: number, 
    ttlMs: number = 3600000, // 1 hour default
    userId?: string
  ): Promise<boolean> {
    try {
      // Security check
      if (!this.canCache(response, prompt)) {
        console.log('Response contains sensitive data, not caching');
        return false;
      }

      const cacheKey = this.generateCacheKey(prompt, userId);
      const promptHash = crypto.createHash('sha256').update(prompt).digest('hex');
      
      const entry: CacheEntry = {
        id: crypto.randomUUID(),
        promptHash,
        response,
        cost,
        timestamp: Date.now(),
        ttl: ttlMs,
        hitCount: 1,
        userId,
        isPublic: !userId // Public if no user ID
      };

      // Store in Redis with TTL
      await this.redis.setex(cacheKey, Math.floor(ttlMs / 1000), JSON.stringify(entry));
      
      // Update stats
      this.stats.totalSize = await this.redis.dbsize();
      
      return true;
      
    } catch (error) {
      console.error('Cache set error:', error);
      return false;
    }
  }

  /**
   * Invalidate cache entries
   */
  async invalidate(pattern: string, userId?: string): Promise<number> {
    try {
      const searchPattern = userId ? `cache:${userId}:*${pattern}*` : `cache:*${pattern}*`;
      const keys = await this.redis.keys(searchPattern);
      
      if (keys.length > 0) {
        await this.redis.del(...keys);
        this.stats.evictions += keys.length;
      }
      
      return keys.length;
      
    } catch (error) {
      console.error('Cache invalidation error:', error);
      return 0;
    }
  }

  /**
   * Get cache statistics
   */
  getStats(): CacheStats {
    const total = this.stats.hits + this.stats.misses;
    this.stats.hitRate = total > 0 ? (this.stats.hits / total) * 100 : 0;
    
    return { ...this.stats };
  }

  /**
   * Clear all cache
   */
  async clear(): Promise<void> {
    try {
      await this.redis.flushdb();
      this.stats = {
        hits: 0,
        misses: 0,
        evictions: 0,
        totalSize: 0,
        hitRate: 0
      };
    } catch (error) {
      console.error('Cache clear error:', error);
    }
  }

  /**
   * Cleanup expired entries
   */
  async cleanup(): Promise<number> {
    try {
      const keys = await this.redis.keys('cache:*');
      let cleaned = 0;
      
      for (const key of keys) {
        const cached = await this.redis.get(key);
        if (cached) {
          const entry: CacheEntry = JSON.parse(cached);
          if (Date.now() - entry.timestamp > entry.ttl) {
            await this.redis.del(key);
            cleaned++;
          }
        }
      }
      
      this.stats.evictions += cleaned;
      return cleaned;
      
    } catch (error) {
      console.error('Cache cleanup error:', error);
      return 0;
    }
  }
}

/**
 * Database-backed cache for persistent storage
 */
export class DatabaseCache {
  // This would integrate with your database
  // For now, showing the interface
  
  async storeCacheEntry(entry: CacheEntry): Promise<void> {
    // Store in database with proper indexing
    // Include user_id, prompt_hash, response, cost, timestamp, ttl
    console.log('Storing cache entry in database:', entry.id);
  }

  async getCacheEntry(promptHash: string, userId?: string): Promise<CacheEntry | null> {
    // Query database for cached entry
    console.log('Getting cache entry from database:', promptHash);
    return null;
  }

  async invalidateUserCache(userId: string): Promise<void> {
    // Remove all cache entries for a specific user
    console.log('Invalidating cache for user:', userId);
  }
}

/**
 * Hybrid caching strategy
 */
export class HybridCache {
  private properCache: ProperCacheSystem;
  private dbCache: DatabaseCache;
  private memoryCache: Map<string, CacheEntry> = new Map();

  constructor() {
    this.properCache = new ProperCacheSystem();
    this.dbCache = new DatabaseCache();
  }

  async get(prompt: string, userId?: string): Promise<CacheEntry | null> {
    // 1. Check memory cache first (fastest)
    const memoryKey = this.generateMemoryKey(prompt, userId);
    const memoryEntry = this.memoryCache.get(memoryKey);
    
    if (memoryEntry && Date.now() - memoryEntry.timestamp < memoryEntry.ttl) {
      return memoryEntry;
    }

    // 2. Check Redis cache (fast)
    const redisEntry = await this.properCache.get(prompt, userId);
    if (redisEntry) {
      // Store in memory cache for faster access
      this.memoryCache.set(memoryKey, redisEntry);
      return redisEntry;
    }

    // 3. Check database cache (slower but persistent)
    const promptHash = crypto.createHash('sha256').update(prompt).digest('hex');
    const dbEntry = await this.dbCache.getCacheEntry(promptHash, userId);
    
    if (dbEntry) {
      // Store in Redis and memory for faster access
      await this.properCache.set(prompt, dbEntry.response, dbEntry.cost, dbEntry.ttl, userId);
      this.memoryCache.set(memoryKey, dbEntry);
      return dbEntry;
    }

    return null;
  }

  async set(
    prompt: string, 
    response: string, 
    cost: number, 
    ttlMs: number = 3600000,
    userId?: string
  ): Promise<boolean> {
    const promptHash = crypto.createHash('sha256').update(prompt).digest('hex');
    const memoryKey = this.generateMemoryKey(prompt, userId);
    
    const entry: CacheEntry = {
      id: crypto.randomUUID(),
      promptHash,
      response,
      cost,
      timestamp: Date.now(),
      ttl: ttlMs,
      hitCount: 1,
      userId,
      isPublic: !userId
    };

    // Store in all three layers
    this.memoryCache.set(memoryKey, entry);
    await this.properCache.set(prompt, response, cost, ttlMs, userId);
    await this.dbCache.storeCacheEntry(entry);

    return true;
  }

  private generateMemoryKey(prompt: string, userId?: string): string {
    return userId ? `mem:${userId}:${prompt}` : `mem:public:${prompt}`;
  }
}

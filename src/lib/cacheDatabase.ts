/**
 * Database Schema and Operations for Proper Caching
 * Addresses the database concerns you raised
 */

import { Pool } from 'pg';

interface CacheEntry {
  id: string;
  prompt_hash: string;
  response: string;
  cost: number;
  created_at: Date;
  expires_at: Date;
  hit_count: number;
  user_id?: string;
  is_public: boolean;
  response_size: number;
}

interface CacheStats {
  total_entries: number;
  total_size_mb: number;
  hit_rate: number;
  most_cached_prompts: Array<{ prompt_hash: string; hit_count: number }>;
}

export class CacheDatabase {
  private pool: Pool;

  constructor() {
    this.pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      max: 20,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 2000,
    });
  }

  /**
   * Initialize cache tables
   */
  async initializeTables(): Promise<void> {
    const createTableQuery = `
      CREATE TABLE IF NOT EXISTS api_cache (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        prompt_hash VARCHAR(64) NOT NULL,
        response TEXT NOT NULL,
        cost DECIMAL(10, 6) NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
        hit_count INTEGER DEFAULT 1,
        user_id UUID,
        is_public BOOLEAN DEFAULT true,
        response_size INTEGER NOT NULL,
        
        -- Indexes for performance
        INDEX idx_prompt_hash (prompt_hash),
        INDEX idx_user_id (user_id),
        INDEX idx_expires_at (expires_at),
        INDEX idx_created_at (created_at),
        INDEX idx_hit_count (hit_count),
        
        -- Composite indexes
        INDEX idx_user_prompt (user_id, prompt_hash),
        INDEX idx_public_prompt (is_public, prompt_hash)
      );
      
      -- Partitioning by date for better performance
      CREATE TABLE IF NOT EXISTS api_cache_2024 PARTITION OF api_cache
      FOR VALUES FROM ('2024-01-01') TO ('2025-01-01');
      
      CREATE TABLE IF NOT EXISTS api_cache_2025 PARTITION OF api_cache
      FOR VALUES FROM ('2025-01-01') TO ('2026-01-01');
    `;

    await this.pool.query(createTableQuery);
  }

  /**
   * Store cache entry in database
   */
  async storeCacheEntry(
    promptHash: string,
    response: string,
    cost: number,
    ttlMs: number,
    userId?: string
  ): Promise<string> {
    const expiresAt = new Date(Date.now() + ttlMs);
    const responseSize = Buffer.byteLength(response, 'utf8');
    
    const query = `
      INSERT INTO api_cache (
        prompt_hash, response, cost, expires_at, user_id, is_public, response_size
      ) VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING id
    `;

    const values = [
      promptHash,
      response,
      cost,
      expiresAt,
      userId || null,
      !userId, // is_public = true if no user_id
      responseSize
    ];

    const result = await this.pool.query(query, values);
    return result.rows[0].id;
  }

  /**
   * Get cache entry from database
   */
  async getCacheEntry(promptHash: string, userId?: string): Promise<CacheEntry | null> {
    const query = `
      SELECT * FROM api_cache 
      WHERE prompt_hash = $1 
        AND expires_at > NOW()
        AND (user_id = $2 OR (is_public = true AND $2 IS NULL))
      ORDER BY created_at DESC
      LIMIT 1
    `;

    const result = await this.pool.query(query, [promptHash, userId]);
    
    if (result.rows.length === 0) {
      return null;
    }

    const row = result.rows[0];
    
    // Update hit count
    await this.pool.query(
      'UPDATE api_cache SET hit_count = hit_count + 1 WHERE id = $1',
      [row.id]
    );

    return {
      id: row.id,
      prompt_hash: row.prompt_hash,
      response: row.response,
      cost: parseFloat(row.cost),
      created_at: row.created_at,
      expires_at: row.expires_at,
      hit_count: row.hit_count + 1,
      user_id: row.user_id,
      is_public: row.is_public,
      response_size: row.response_size
    };
  }

  /**
   * Clean up expired cache entries
   */
  async cleanupExpiredEntries(): Promise<number> {
    const query = 'DELETE FROM api_cache WHERE expires_at < NOW()';
    const result = await this.pool.query(query);
    return result.rowCount || 0;
  }

  /**
   * Get cache statistics
   */
  async getCacheStats(): Promise<CacheStats> {
    const statsQuery = `
      SELECT 
        COUNT(*) as total_entries,
        SUM(response_size) / 1024 / 1024 as total_size_mb,
        AVG(hit_count) as avg_hit_count
      FROM api_cache 
      WHERE expires_at > NOW()
    `;

    const topPromptsQuery = `
      SELECT prompt_hash, hit_count
      FROM api_cache 
      WHERE expires_at > NOW()
      ORDER BY hit_count DESC
      LIMIT 10
    `;

    const [statsResult, topPromptsResult] = await Promise.all([
      this.pool.query(statsQuery),
      this.pool.query(topPromptsQuery)
    ]);

    const stats = statsResult.rows[0];
    const topPrompts = topPromptsResult.rows;

    return {
      total_entries: parseInt(stats.total_entries) || 0,
      total_size_mb: parseFloat(stats.total_size_mb) || 0,
      hit_rate: parseFloat(stats.avg_hit_count) || 0,
      most_cached_prompts: topPrompts.map(row => ({
        prompt_hash: row.prompt_hash,
        hit_count: parseInt(row.hit_count)
      }))
    };
  }

  /**
   * Invalidate cache for specific user
   */
  async invalidateUserCache(userId: string): Promise<number> {
    const query = 'DELETE FROM api_cache WHERE user_id = $1';
    const result = await this.pool.query(query, [userId]);
    return result.rowCount || 0;
  }

  /**
   * Invalidate cache by pattern
   */
  async invalidateByPattern(pattern: string, userId?: string): Promise<number> {
    const query = `
      DELETE FROM api_cache 
      WHERE prompt_hash LIKE $1 
        AND (user_id = $2 OR (is_public = true AND $2 IS NULL))
    `;
    
    const result = await this.pool.query(query, [`%${pattern}%`, userId]);
    return result.rowCount || 0;
  }

  /**
   * Get cache size by user
   */
  async getCacheSizeByUser(userId: string): Promise<number> {
    const query = `
      SELECT SUM(response_size) as total_size
      FROM api_cache 
      WHERE user_id = $1 AND expires_at > NOW()
    `;
    
    const result = await this.pool.query(query, [userId]);
    return parseInt(result.rows[0]?.total_size) || 0;
  }

  /**
   * Archive old cache entries (instead of deleting)
   */
  async archiveOldEntries(daysOld: number = 30): Promise<number> {
    const query = `
      INSERT INTO api_cache_archive 
      SELECT * FROM api_cache 
      WHERE created_at < NOW() - INTERVAL '${daysOld} days'
    `;

    const deleteQuery = `
      DELETE FROM api_cache 
      WHERE created_at < NOW() - INTERVAL '${daysOld} days'
    `;

    await this.pool.query(query);
    const result = await this.pool.query(deleteQuery);
    return result.rowCount || 0;
  }

  /**
   * Monitor cache performance
   */
  async getCachePerformance(): Promise<{
    hit_rate: number;
    avg_response_time: number;
    cache_efficiency: number;
  }> {
    const query = `
      SELECT 
        AVG(hit_count) as avg_hits,
        COUNT(*) as total_entries,
        SUM(response_size) as total_size
      FROM api_cache 
      WHERE expires_at > NOW()
    `;

    const result = await this.pool.query(query);
    const row = result.rows[0];

    return {
      hit_rate: parseFloat(row.avg_hits) || 0,
      avg_response_time: 0, // Would need separate metrics table
      cache_efficiency: parseFloat(row.avg_hits) / parseFloat(row.total_entries) || 0
    };
  }
}

/**
 * Cache Management Service
 */
export class CacheManagementService {
  private db: CacheDatabase;
  private cleanupInterval?: NodeJS.Timeout;

  constructor() {
    this.db = new CacheDatabase();
    this.startCleanup();
  }

  /**
   * Start automatic cleanup of expired entries
   */
  private startCleanup(): void {
    // Clean up every hour
    this.cleanupInterval = setInterval(async () => {
      try {
        const cleaned = await this.db.cleanupExpiredEntries();
        console.log(`Cleaned up ${cleaned} expired cache entries`);
      } catch (error) {
        console.error('Cache cleanup error:', error);
      }
    }, 3600000); // 1 hour
  }

  /**
   * Stop cleanup service
   */
  stop(): void {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
    }
  }

  /**
   * Get comprehensive cache report
   */
  async getCacheReport(): Promise<{
    stats: CacheStats;
    performance: any;
    recommendations: string[];
  }> {
    const [stats, performance] = await Promise.all([
      this.db.getCacheStats(),
      this.db.getCachePerformance()
    ]);

    const recommendations: string[] = [];
    
    if (stats.total_size_mb > 1000) {
      recommendations.push('Consider implementing cache compression');
    }
    
    if (performance.hit_rate < 0.5) {
      recommendations.push('Cache hit rate is low, consider adjusting TTL');
    }
    
    if (stats.total_entries > 100000) {
      recommendations.push('Consider implementing cache partitioning');
    }

    return {
      stats,
      performance,
      recommendations
    };
  }
}

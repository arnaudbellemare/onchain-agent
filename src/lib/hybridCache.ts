/**
 * Hybrid Caching System for Cost Optimization
 * Implements intelligent caching to minimize API calls and costs
 */

import crypto from 'crypto';

interface CacheEntry {
  prompt: string;
  optimizedPrompt: string;
  cost: number;
  savings: number;
  timestamp: number;
  hitCount: number;
  lastUsed: number;
}

interface CacheStats {
  hits: number;
  misses: number;
  totalSavings: number;
  cacheSize: number;
  hitRate: number;
}

class HybridCache {
  private cache: Map<string, CacheEntry> = new Map();
  private maxSize: number = 1000;
  private ttl: number = 24 * 60 * 60 * 1000; // 24 hours
  private stats: CacheStats = {
    hits: 0,
    misses: 0,
    totalSavings: 0,
    cacheSize: 0,
    hitRate: 0
  };

  /**
   * Generate cache key from prompt
   */
  private generateKey(prompt: string): string {
    // Normalize prompt for better cache hits
    const normalized = prompt
      .toLowerCase()
      .replace(/\s+/g, ' ')
      .replace(/[^\w\s]/g, '')
      .trim();
    
    return crypto.createHash('md5').update(normalized).digest('hex');
  }

  /**
   * Check if entry is expired
   */
  private isExpired(entry: CacheEntry): boolean {
    return Date.now() - entry.timestamp > this.ttl;
  }

  /**
   * Get cached optimization result
   */
  get(prompt: string): CacheEntry | null {
    const key = this.generateKey(prompt);
    const entry = this.cache.get(key);

    if (!entry) {
      this.stats.misses++;
      this.updateHitRate();
      return null;
    }

    if (this.isExpired(entry)) {
      this.cache.delete(key);
      this.stats.misses++;
      this.updateHitRate();
      return null;
    }

    // Update usage stats
    entry.hitCount++;
    entry.lastUsed = Date.now();
    this.stats.hits++;
    this.stats.totalSavings += entry.savings;
    this.updateHitRate();

    console.log(`[Hybrid Cache] HIT: Saved $${entry.savings.toFixed(6)} on prompt optimization`);
    return entry;
  }

  /**
   * Store optimization result in cache
   */
  set(prompt: string, optimizedPrompt: string, cost: number, savings: number): void {
    const key = this.generateKey(prompt);
    
    // Clean up expired entries if cache is full
    if (this.cache.size >= this.maxSize) {
      this.cleanup();
    }

    const entry: CacheEntry = {
      prompt,
      optimizedPrompt,
      cost,
      savings,
      timestamp: Date.now(),
      hitCount: 0,
      lastUsed: Date.now()
    };

    this.cache.set(key, entry);
    this.stats.cacheSize = this.cache.size;
    
    console.log(`[Hybrid Cache] STORED: Optimization cached with $${savings.toFixed(6)} savings`);
  }

  /**
   * Clean up expired and least used entries
   */
  private cleanup(): void {
    const now = Date.now();
    const entries = Array.from(this.cache.entries());
    
    // Remove expired entries first
    entries.forEach(([key, entry]) => {
      if (this.isExpired(entry)) {
        this.cache.delete(key);
      }
    });

    // If still full, remove least used entries
    if (this.cache.size >= this.maxSize) {
      const sortedEntries = entries
        .filter(([_, entry]) => !this.isExpired(entry))
        .sort((a, b) => a[1].hitCount - b[1].hitCount);

      const toRemove = sortedEntries.slice(0, Math.floor(this.maxSize * 0.2));
      toRemove.forEach(([key]) => this.cache.delete(key));
    }

    this.stats.cacheSize = this.cache.size;
    console.log(`[Hybrid Cache] CLEANUP: Cache size reduced to ${this.cache.size}`);
  }

  /**
   * Update hit rate statistics
   */
  private updateHitRate(): void {
    const total = this.stats.hits + this.stats.misses;
    this.stats.hitRate = total > 0 ? (this.stats.hits / total) * 100 : 0;
  }

  /**
   * Get cache statistics
   */
  getStats(): CacheStats {
    return { ...this.stats };
  }

  /**
   * Clear cache
   */
  clear(): void {
    this.cache.clear();
    this.stats = {
      hits: 0,
      misses: 0,
      totalSavings: 0,
      cacheSize: 0,
      hitRate: 0
    };
  }

  /**
   * Get cache size
   */
  size(): number {
    return this.cache.size;
  }
}

// Export singleton instance
export const hybridCache = new HybridCache();

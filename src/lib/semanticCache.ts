/**
 * Semantic Cache Implementation
 * Uses embedding-based similarity for better cache hit rates
 */

interface CacheEntry {
  key: string;
  value: any;
  embedding: number[];
  timestamp: number;
  hitCount: number;
  promptType: string;
}

interface SemanticCacheConfig {
  maxSize: number;
  similarityThreshold: number;
  embeddingDimension: number;
  ttl: number; // Time to live in milliseconds
}

export class SemanticCache {
  private cache = new Map<string, CacheEntry>();
  private embeddings = new Map<string, number[]>();
  private config: SemanticCacheConfig;
  private accessOrder: string[] = [];

  constructor(config: Partial<SemanticCacheConfig> = {}) {
    this.config = {
      maxSize: config.maxSize || 1000,
      similarityThreshold: config.similarityThreshold || 0.85,
      embeddingDimension: config.embeddingDimension || 384,
      ttl: config.ttl || 24 * 60 * 60 * 1000 // 24 hours
    };
  }

  // Simple embedding generation (in production, use a proper embedding model)
  private generateEmbedding(text: string): number[] {
    // Simple hash-based embedding for demo purposes
    // In production, use sentence-transformers or similar
    const words = text.toLowerCase().split(/\s+/);
    const embedding = new Array(this.config.embeddingDimension).fill(0);
    
    words.forEach((word, index) => {
      const hash = this.simpleHash(word);
      const position = hash % this.config.embeddingDimension;
      embedding[position] += 1 / (index + 1); // Weight by position
    });

    // Normalize embedding
    const magnitude = Math.sqrt(embedding.reduce((sum, val) => sum + val * val, 0));
    return embedding.map(val => val / magnitude);
  }

  private simpleHash(str: string): number {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash);
  }

  // Calculate cosine similarity between two embeddings
  private cosineSimilarity(embedding1: number[], embedding2: number[]): number {
    if (embedding1.length !== embedding2.length) return 0;
    
    let dotProduct = 0;
    let norm1 = 0;
    let norm2 = 0;
    
    for (let i = 0; i < embedding1.length; i++) {
      dotProduct += embedding1[i] * embedding2[i];
      norm1 += embedding1[i] * embedding1[i];
      norm2 += embedding2[i] * embedding2[i];
    }
    
    return dotProduct / (Math.sqrt(norm1) * Math.sqrt(norm2));
  }

  // Find semantically similar cache entries
  private findSimilarEntries(queryEmbedding: number[], promptType: string): CacheEntry[] {
    const similarEntries: { entry: CacheEntry; similarity: number }[] = [];
    
    for (const [key, entry] of this.cache) {
      // Skip if different prompt type
      if (entry.promptType !== promptType) continue;
      
      // Skip if expired
      if (Date.now() - entry.timestamp > this.config.ttl) continue;
      
      const similarity = this.cosineSimilarity(queryEmbedding, entry.embedding);
      if (similarity >= this.config.similarityThreshold) {
        similarEntries.push({ entry, similarity });
      }
    }
    
    // Sort by similarity (highest first)
    return similarEntries
      .sort((a, b) => b.similarity - a.similarity)
      .map(item => item.entry);
  }

  // Get cache entry with semantic similarity
  get(key: string, promptType: string): any | null {
    const queryEmbedding = this.generateEmbedding(key);
    const similarEntries = this.findSimilarEntries(queryEmbedding, promptType);
    
    if (similarEntries.length > 0) {
      const bestMatch = similarEntries[0];
      
      // Update access order for LRU
      this.updateAccessOrder(key);
      bestMatch.hitCount++;
      
      console.log(`[Semantic Cache] HIT: Found ${similarEntries.length} similar entries, using best match (similarity: ${this.cosineSimilarity(queryEmbedding, bestMatch.embedding).toFixed(3)})`);
      
      return bestMatch.value;
    }
    
    console.log(`[Semantic Cache] MISS: No similar entries found for prompt type: ${promptType}`);
    return null;
  }

  // Set cache entry with semantic information
  set(key: string, value: any, promptType: string): void {
    const embedding = this.generateEmbedding(key);
    const timestamp = Date.now();
    
    // Remove oldest entries if cache is full
    if (this.cache.size >= this.config.maxSize) {
      this.evictOldest();
    }
    
    const entry: CacheEntry = {
      key,
      value,
      embedding,
      timestamp,
      hitCount: 0,
      promptType
    };
    
    this.cache.set(key, entry);
    this.updateAccessOrder(key);
    
    console.log(`[Semantic Cache] SET: Added entry for prompt type: ${promptType}`);
  }

  // Update access order for LRU eviction
  private updateAccessOrder(key: string): void {
    const index = this.accessOrder.indexOf(key);
    if (index > -1) {
      this.accessOrder.splice(index, 1);
    }
    this.accessOrder.push(key);
  }

  // Evict oldest cache entry
  private evictOldest(): void {
    if (this.accessOrder.length > 0) {
      const oldestKey = this.accessOrder.shift()!;
      this.cache.delete(oldestKey);
      console.log(`[Semantic Cache] EVICTED: Removed oldest entry: ${oldestKey}`);
    }
  }

  // Get cache statistics
  getStats(): {
    size: number;
    hitRate: number;
    totalHits: number;
    entriesByType: Record<string, number>;
    averageSimilarity: number;
  } {
    let totalHits = 0;
    const entriesByType: Record<string, number> = {};
    let similaritySum = 0;
    let similarityCount = 0;
    
    for (const [key, entry] of this.cache) {
      totalHits += entry.hitCount;
      entriesByType[entry.promptType] = (entriesByType[entry.promptType] || 0) + 1;
      
      // Calculate average similarity with other entries of same type
      const sameTypeEntries = Array.from(this.cache.values()).filter(e => e.promptType === entry.promptType && e.key !== key);
      for (const otherEntry of sameTypeEntries) {
        similaritySum += this.cosineSimilarity(entry.embedding, otherEntry.embedding);
        similarityCount++;
      }
    }
    
    return {
      size: this.cache.size,
      hitRate: totalHits / Math.max(1, this.cache.size),
      totalHits,
      entriesByType,
      averageSimilarity: similarityCount > 0 ? similaritySum / similarityCount : 0
    };
  }

  // Clear cache
  clear(): void {
    this.cache.clear();
    this.accessOrder = [];
    console.log(`[Semantic Cache] CLEARED: All entries removed`);
  }

  // Warm cache with common queries
  warmCache(commonQueries: Array<{ prompt: string; promptType: string; result: any }>): void {
    console.log(`[Semantic Cache] WARMING: Adding ${commonQueries.length} common queries`);
    
    commonQueries.forEach(({ prompt, promptType, result }) => {
      this.set(prompt, result, promptType);
    });
    
    console.log(`[Semantic Cache] WARMED: Cache now contains ${this.cache.size} entries`);
  }
}

// Export singleton instance
export const semanticCache = new SemanticCache({
  maxSize: 2000,
  similarityThreshold: 0.85,
  embeddingDimension: 384,
  ttl: 24 * 60 * 60 * 1000 // 24 hours
});


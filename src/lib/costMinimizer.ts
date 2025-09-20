/**
 * Cost Minimization System
 * Implements multiple strategies to reduce API costs
 */

import { hybridCache } from './hybridCache';

interface OptimizationStrategy {
  name: string;
  weight: number;
  apply: (prompt: string) => { optimized: string; savings: number };
}

interface CostMinimizationResult {
  originalPrompt: string;
  optimizedPrompt: string;
  strategies: string[];
  costReduction: number;
  tokenReduction: number;
  cacheHit: boolean;
  totalSavings: number;
}

class CostMinimizer {
  private strategies: OptimizationStrategy[] = [
    {
      name: 'remove_politeness',
      weight: 0.3,
      apply: (prompt: string) => {
        const optimized = prompt
          .replace(/\b(please|kindly|would you|could you|thank you|thanks)\b/gi, '')
          .replace(/\s+/g, ' ')
          .trim();
        return {
          optimized,
          savings: (prompt.length - optimized.length) / prompt.length
        };
      }
    },
    {
      name: 'shorten_phrases',
      weight: 0.4,
      apply: (prompt: string) => {
        const optimized = prompt
          .replace(/\bI would like to\b/gi, 'I want to')
          .replace(/\bI need to\b/gi, 'I must')
          .replace(/\bcan you help me\b/gi, 'help')
          .replace(/\bI would appreciate it if\b/gi, 'please')
          .replace(/\bI would be grateful if\b/gi, 'please')
          .replace(/\bI would be thankful if\b/gi, 'please')
          .replace(/\s+/g, ' ')
          .trim();
        return {
          optimized,
          savings: (prompt.length - optimized.length) / prompt.length
        };
      }
    },
    {
      name: 'remove_redundancy',
      weight: 0.5,
      apply: (prompt: string) => {
        const optimized = prompt
          .replace(/\b(very|really|quite|rather|extremely|incredibly)\s+/gi, '')
          .replace(/\b(in order to|so as to)\b/gi, 'to')
          .replace(/\b(due to the fact that|because of the fact that)\b/gi, 'because')
          .replace(/\b(at this point in time|at the present time)\b/gi, 'now')
          .replace(/\b(in the event that|in case)\b/gi, 'if')
          .replace(/\s+/g, ' ')
          .trim();
        return {
          optimized,
          savings: (prompt.length - optimized.length) / prompt.length
        };
      }
    },
    {
      name: 'simplify_sentences',
      weight: 0.6,
      apply: (prompt: string) => {
        const optimized = prompt
          .replace(/\b(it is important to note that|it should be noted that)\b/gi, 'note:')
          .replace(/\b(it is worth mentioning that|it is worth noting that)\b/gi, 'note:')
          .replace(/\b(as a matter of fact|in fact|actually)\b/gi, '')
          .replace(/\b(for the purpose of|in order to)\b/gi, 'to')
          .replace(/\b(with regard to|in regard to|regarding)\b/gi, 'about')
          .replace(/\s+/g, ' ')
          .trim();
        return {
          optimized,
          savings: (prompt.length - optimized.length) / prompt.length
        };
      }
    },
    {
      name: 'remove_filler_words',
      weight: 0.7,
      apply: (prompt: string) => {
        const optimized = prompt
          .replace(/\b(well|so|um|uh|like|you know|I mean)\b/gi, '')
          .replace(/\b(sort of|kind of|pretty much|basically)\b/gi, '')
          .replace(/\b(obviously|clearly|of course|naturally)\b/gi, '')
          .replace(/\s+/g, ' ')
          .trim();
        return {
          optimized,
          savings: (prompt.length - optimized.length) / prompt.length
        };
      }
    },
    {
      name: 'aggressive_compression',
      weight: 0.8,
      apply: (prompt: string) => {
        let optimized = prompt;
        
        // Remove articles in non-critical positions
        optimized = optimized.replace(/\b(the|a|an)\s+/gi, '');
        
        // Remove unnecessary prepositions
        optimized = optimized.replace(/\b(of|in|on|at|by|for|with|to|from)\s+/gi, '');
        
        // Remove common connecting words
        optimized = optimized.replace(/\b(and|or|but|however|therefore|thus|hence)\b/gi, '');
        
        // Clean up spaces
        optimized = optimized.replace(/\s+/g, ' ').trim();
        
        // Ensure minimum length (don't over-optimize)
        if (optimized.length < prompt.length * 0.3) {
          optimized = prompt; // Fallback to original if too aggressive
        }
        
        return {
          optimized,
          savings: (prompt.length - optimized.length) / prompt.length
        };
      }
    }
  ];

  /**
   * Optimize prompt using multiple strategies
   */
  optimize(prompt: string): CostMinimizationResult {
    // Check cache first
    const cached = hybridCache.get(prompt);
    if (cached) {
      return {
        originalPrompt: prompt,
        optimizedPrompt: cached.optimizedPrompt,
        strategies: ['cache_hit'],
        costReduction: cached.savings,
        tokenReduction: (prompt.length - cached.optimizedPrompt.length) / prompt.length,
        cacheHit: true,
        totalSavings: cached.savings
      };
    }

    let bestOptimized = prompt;
    let bestSavings = 0;
    const appliedStrategies: string[] = [];

    // Apply strategies in order of weight (highest first)
    const sortedStrategies = [...this.strategies].sort((a, b) => b.weight - a.weight);
    
    for (const strategy of sortedStrategies) {
      const result = strategy.apply(bestOptimized);
      
      // Only apply if it provides meaningful savings
      if (result.savings > 0.05 && result.optimized.length > bestOptimized.length * 0.5) {
        bestOptimized = result.optimized;
        bestSavings += result.savings;
        appliedStrategies.push(strategy.name);
        
        console.log(`[Cost Minimizer] Applied ${strategy.name}: ${(result.savings * 100).toFixed(1)}% reduction`);
      }
    }

    // Calculate final metrics
    const tokenReduction = (prompt.length - bestOptimized.length) / prompt.length;
    const costReduction = bestSavings;

    // Cache the result
    hybridCache.set(prompt, bestOptimized, 0, costReduction);

    console.log(`[Cost Minimizer] Total optimization: ${(costReduction * 100).toFixed(1)}% cost reduction, ${(tokenReduction * 100).toFixed(1)}% token reduction`);

    return {
      originalPrompt: prompt,
      optimizedPrompt: bestOptimized,
      strategies: appliedStrategies,
      costReduction,
      tokenReduction,
      cacheHit: false,
      totalSavings: costReduction
    };
  }

  /**
   * Get optimization statistics
   */
  getStats() {
    const cacheStats = hybridCache.getStats();
    return {
      cache: cacheStats,
      strategies: this.strategies.length,
      totalOptimizations: cacheStats.hits + cacheStats.misses
    };
  }
}

// Export singleton instance
export const costMinimizer = new CostMinimizer();

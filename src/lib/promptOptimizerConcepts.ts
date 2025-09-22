/**
 * Prompt Optimizer Concepts Implementation
 * Based on https://github.com/vaibkumr/prompt-optimizer
 * 
 * This implements the key optimization methods from prompt-optimizer
 * to compare against our CAPO system
 */

export interface OptimizationResult {
  originalPrompt: string;
  optimizedPrompt: string;
  method: string;
  tokenReduction: number;
  costSavings: number;
  processingTime: number;
}

export class PromptOptimizerConcepts {
  
  /**
   * Entropy Optimization - removes low-entropy words
   */
  static entropyOptimization(prompt: string, p: number = 0.1): string {
    const words = prompt.split(/\s+/);
    const optimizedWords = words.filter(word => {
      // Calculate entropy (simplified)
      const entropy = this.calculateWordEntropy(word);
      return entropy > p;
    });
    return optimizedWords.join(' ');
  }

  /**
   * Synonym Replacement - replaces words with shorter synonyms
   */
  static synonymReplacement(prompt: string): string {
    const synonymMap: { [key: string]: string } = {
      'utilize': 'use',
      'facilitate': 'help',
      'implement': 'do',
      'comprehensive': 'full',
      'significant': 'big',
      'approximately': 'about',
      'consequently': 'so',
      'furthermore': 'also',
      'moreover': 'also',
      'nevertheless': 'but',
      'nonetheless': 'but',
      'therefore': 'so',
      'thus': 'so',
      'whereas': 'while',
      'whilst': 'while',
      'concerning': 'about',
      'regarding': 'about',
      'pertaining': 'about',
      'subsequent': 'next',
      'preceding': 'before',
      'aforementioned': 'said'
    };

    let optimized = prompt;
    for (const [long, short] of Object.entries(synonymMap)) {
      const regex = new RegExp(`\\b${long}\\b`, 'gi');
      optimized = optimized.replace(regex, short);
    }
    return optimized;
  }

  /**
   * Lemmatization - reduces words to root form
   */
  static lemmatization(prompt: string): string {
    const lemmatizationMap: { [key: string]: string } = {
      'running': 'run',
      'walking': 'walk',
      'talking': 'talk',
      'working': 'work',
      'playing': 'play',
      'studying': 'study',
      'learning': 'learn',
      'teaching': 'teach',
      'helping': 'help',
      'making': 'make',
      'taking': 'take',
      'giving': 'give',
      'getting': 'get',
      'putting': 'put',
      'coming': 'come',
      'going': 'go',
      'seeing': 'see',
      'knowing': 'know',
      'thinking': 'think',
      'feeling': 'feel',
      'looking': 'look',
      'finding': 'find',
      'using': 'use',
      'doing': 'do',
      'having': 'have',
      'being': 'be',
      'saying': 'say',
      'telling': 'tell',
      'asking': 'ask',
      'trying': 'try',
      'calling': 'call',
      'moving': 'move',
      'living': 'live'
    };

    let optimized = prompt;
    for (const [inflected, root] of Object.entries(lemmatizationMap)) {
      const regex = new RegExp(`\\b${inflected}\\b`, 'gi');
      optimized = optimized.replace(regex, root);
    }
    return optimized;
  }

  /**
   * Punctuation Optimization - removes unnecessary punctuation
   */
  static punctuationOptimization(prompt: string): string {
    return prompt
      .replace(/[;:]/g, ',') // Replace semicolons and colons with commas
      .replace(/[!]{2,}/g, '!') // Replace multiple exclamation marks with single
      .replace(/[?]{2,}/g, '?') // Replace multiple question marks with single
      .replace(/[.]{2,}/g, '.') // Replace multiple periods with single
      .replace(/\s+([,.!?])/g, '$1') // Remove spaces before punctuation
      .replace(/([,.!?])\s*([,.!?])/g, '$1') // Remove consecutive punctuation
      .trim();
  }

  /**
   * Sequential Optimization - applies multiple methods in sequence
   */
  static async sequentialOptimization(prompt: string): Promise<OptimizationResult> {
    const startTime = Date.now();
    let optimized = prompt;
    const methods: string[] = [];

    // Stage 1: Entropy Optimization
    const entropyOptimized = this.entropyOptimization(optimized, 0.1);
    if (entropyOptimized !== optimized) {
      optimized = entropyOptimized;
      methods.push('EntropyOptim');
    }

    // Stage 2: Synonym Replacement
    const synonymOptimized = this.synonymReplacement(optimized);
    if (synonymOptimized !== optimized) {
      optimized = synonymOptimized;
      methods.push('SynonymReplace');
    }

    // Stage 3: Lemmatization
    const lemmatized = this.lemmatization(optimized);
    if (lemmatized !== optimized) {
      optimized = lemmatized;
      methods.push('Lemmatizer');
    }

    // Stage 4: Punctuation Optimization
    const punctuationOptimized = this.punctuationOptimization(optimized);
    if (punctuationOptimized !== optimized) {
      optimized = punctuationOptimized;
      methods.push('PunctuationOptim');
    }

    const processingTime = Date.now() - startTime;
    const originalTokens = Math.ceil(prompt.length / 3.5);
    const optimizedTokens = Math.ceil(optimized.length / 3.5);
    const tokenReduction = originalTokens > 0 ? ((originalTokens - optimizedTokens) / originalTokens) * 100 : 0;
    const costSavings = tokenReduction * 0.2; // Assume $0.2 per 1M tokens

    return {
      originalPrompt: prompt,
      optimizedPrompt: optimized,
      method: methods.join(' + '),
      tokenReduction,
      costSavings,
      processingTime
    };
  }

  /**
   * Calculate word entropy (simplified)
   */
  private static calculateWordEntropy(word: string): number {
    if (word.length <= 2) return 0.1; // Very low entropy for short words
    if (word.length <= 4) return 0.3; // Low entropy for medium words
    if (word.length <= 6) return 0.5; // Medium entropy
    if (word.length <= 8) return 0.7; // High entropy
    return 0.9; // Very high entropy for long words
  }

  /**
   * Protected Tags - preserves important sections
   */
  static preserveProtectedTags(prompt: string): { protected: string[], unprotected: string } {
    const protectedRegex = /<PROTECTED>(.*?)<\/PROTECTED>/g;
    const protectedSections: string[] = [];
    let match;
    
    while ((match = protectedRegex.exec(prompt)) !== null) {
      protectedSections.push(match[1]);
    }
    
    const unprotected = prompt.replace(protectedRegex, '');
    
    return { protected: protectedSections, unprotected };
  }

  /**
   * Restore protected sections after optimization
   */
  static restoreProtectedSections(optimized: string, protectedSections: string[]): string {
    let result = optimized;
    protectedSections.forEach((section, index) => {
      result = result.replace(`<PROTECTED_${index}>`, `<PROTECTED>${section}</PROTECTED>`);
    });
    return result;
  }
}

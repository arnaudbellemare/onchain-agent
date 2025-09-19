/**
 * Advanced CAPO Mutations
 * Implements semantic mutations and few-shot examples for state-of-the-art optimization
 * Based on latest research in prompt optimization and few-shot learning
 */

import { RealLLMPromptOptimizer } from './realLLMIntegration';

interface FewShotExample {
  input: string;
  output: string;
  explanation: string;
  cost_reduction: number;
  accuracy_maintained: number;
}

interface SemanticMutation {
  type: 'semantic_similarity' | 'context_aware' | 'domain_specific' | 'few_shot_learning';
  description: string;
  apply: (prompt: string, examples?: FewShotExample[]) => Promise<string>;
}

interface AdvancedCAPOConfig {
  enable_semantic_mutations: boolean;
  enable_few_shot_learning: boolean;
  max_few_shot_examples: number;
  semantic_similarity_threshold: number;
  domain_knowledge_weight: number;
}

/**
 * Advanced CAPO Mutations Engine
 * Implements cutting-edge mutation strategies
 */
export class AdvancedCAPOMutations {
  private llmOptimizer: RealLLMPromptOptimizer;
  private config: AdvancedCAPOConfig;
  private fewShotExamples: FewShotExample[] = [];

  constructor(config: Partial<AdvancedCAPOConfig> = {}) {
    this.config = {
      enable_semantic_mutations: true,
      enable_few_shot_learning: true,
      max_few_shot_examples: 5,
      semantic_similarity_threshold: 0.8,
      domain_knowledge_weight: 0.3,
      ...config
    };
    
    this.llmOptimizer = new RealLLMPromptOptimizer();
    this.initializeFewShotExamples();
  }

  /**
   * Initialize few-shot examples for different domains
   */
  private initializeFewShotExamples(): void {
    this.fewShotExamples = [
      {
        input: "Please analyze the following financial data and provide comprehensive insights on market trends, risk factors, and investment opportunities for the next quarter.",
        output: "Analyze financial data for Q4 market trends, risks, and opportunities.",
        explanation: "Removed redundant words, focused on key deliverables, maintained core meaning",
        cost_reduction: 0.45,
        accuracy_maintained: 0.95
      },
      {
        input: "I need you to examine the customer feedback data and generate a detailed report with recommendations for improving our product features and user experience.",
        output: "Examine customer feedback and recommend product improvements.",
        explanation: "Simplified structure, removed unnecessary qualifiers, kept essential action items",
        cost_reduction: 0.38,
        accuracy_maintained: 0.92
      },
      {
        input: "Could you please review the technical documentation and create a comprehensive summary that highlights the key implementation details, potential issues, and suggested solutions?",
        output: "Review technical docs and summarize key details, issues, and solutions.",
        explanation: "Eliminated politeness markers, condensed complex phrases, maintained technical accuracy",
        cost_reduction: 0.42,
        accuracy_maintained: 0.94
      },
      {
        input: "I would like you to analyze the sales performance data from the last six months and provide insights on trends, patterns, and recommendations for optimizing our sales strategy.",
        output: "Analyze 6-month sales data for trends and optimization recommendations.",
        explanation: "Removed time qualifiers, simplified request structure, focused on actionable outcomes",
        cost_reduction: 0.35,
        accuracy_maintained: 0.96
      },
      {
        input: "Please conduct a thorough evaluation of our current marketing campaigns and suggest improvements based on performance metrics, audience engagement, and ROI analysis.",
        output: "Evaluate marketing campaigns and suggest improvements based on metrics and ROI.",
        explanation: "Streamlined evaluation request, removed redundant analysis terms, kept core objectives",
        cost_reduction: 0.40,
        accuracy_maintained: 0.93
      }
    ];
  }

  /**
   * Apply semantic similarity mutation
   */
  private async applySemanticSimilarityMutation(prompt: string): Promise<string> {
    try {
      // Find most similar few-shot example
      const similarExample = this.findMostSimilarExample(prompt);
      
      if (similarExample) {
        // Use LLM to apply similar optimization pattern
        const optimizationPrompt = `Apply the same optimization pattern from this example to the new prompt:

Example:
Input: "${similarExample.input}"
Output: "${similarExample.output}"
Explanation: "${similarExample.explanation}"

New prompt to optimize: "${prompt}"

Apply the same optimization principles: ${similarExample.explanation}`;

        const result = await this.llmOptimizer.optimizePrompt(optimizationPrompt, 'cost');
        return result.optimized_prompt;
      }
      
      return prompt;
    } catch (error) {
      console.warn('Semantic similarity mutation failed:', error);
      return prompt;
    }
  }

  /**
   * Apply context-aware mutation
   */
  private async applyContextAwareMutation(prompt: string): Promise<string> {
    try {
      // Analyze prompt context and apply domain-specific optimizations
      const contextAnalysis = this.analyzePromptContext(prompt);
      
      const optimizationPrompt = `Optimize this prompt for ${contextAnalysis.domain} domain:

Original: "${prompt}"

Domain: ${contextAnalysis.domain}
Key terms: ${contextAnalysis.keyTerms.join(', ')}
Complexity: ${contextAnalysis.complexity}

Apply domain-specific optimization while maintaining accuracy.`;

      const result = await this.llmOptimizer.optimizePrompt(optimizationPrompt, 'cost');
      return result.optimized_prompt;
    } catch (error) {
      console.warn('Context-aware mutation failed:', error);
      return prompt;
    }
  }

  /**
   * Apply domain-specific mutation
   */
  private async applyDomainSpecificMutation(prompt: string): Promise<string> {
    const domain = this.identifyDomain(prompt);
    
    switch (domain) {
      case 'financial':
        return this.optimizeFinancialPrompt(prompt);
      case 'technical':
        return this.optimizeTechnicalPrompt(prompt);
      case 'marketing':
        return this.optimizeMarketingPrompt(prompt);
      case 'customer_service':
        return this.optimizeCustomerServicePrompt(prompt);
      default:
        return prompt;
    }
  }

  /**
   * Apply few-shot learning mutation
   */
  private async applyFewShotLearningMutation(prompt: string, examples: FewShotExample[]): Promise<string> {
    try {
      const relevantExamples = this.selectRelevantExamples(prompt, examples);
      
      if (relevantExamples.length === 0) {
        return prompt;
      }
      
      const fewShotPrompt = `Learn from these optimization examples and apply the same principles:

${relevantExamples.map((ex, i) => `
Example ${i + 1}:
Input: "${ex.input}"
Output: "${ex.output}"
Cost reduction: ${(ex.cost_reduction * 100).toFixed(1)}%
Accuracy maintained: ${(ex.accuracy_maintained * 100).toFixed(1)}%
`).join('\n')}

Now optimize this prompt using the same principles:
"${prompt}"`;

      const result = await this.llmOptimizer.optimizePrompt(fewShotPrompt, 'cost');
      return result.optimized_prompt;
    } catch (error) {
      console.warn('Few-shot learning mutation failed:', error);
      return prompt;
    }
  }

  /**
   * Find most similar few-shot example
   */
  private findMostSimilarExample(prompt: string): FewShotExample | null {
    let bestMatch: FewShotExample | null = null;
    let bestSimilarity = 0;

    for (const example of this.fewShotExamples) {
      const similarity = this.calculateSimilarity(prompt, example.input);
      if (similarity > bestSimilarity && similarity >= this.config.semantic_similarity_threshold) {
        bestSimilarity = similarity;
        bestMatch = example;
      }
    }

    return bestMatch;
  }

  /**
   * Calculate semantic similarity between two prompts
   */
  private calculateSimilarity(prompt1: string, prompt2: string): number {
    // Simple word-based similarity (in production, would use embeddings)
    const words1 = new Set(prompt1.toLowerCase().split(/\s+/));
    const words2 = new Set(prompt2.toLowerCase().split(/\s+/));
    
    const intersection = new Set([...words1].filter(x => words2.has(x)));
    const union = new Set([...words1, ...words2]);
    
    return intersection.size / union.size;
  }

  /**
   * Analyze prompt context
   */
  private analyzePromptContext(prompt: string): {
    domain: string;
    keyTerms: string[];
    complexity: 'low' | 'medium' | 'high';
  } {
    const domain = this.identifyDomain(prompt);
    const keyTerms = this.extractKeyTerms(prompt);
    const complexity = this.assessComplexity(prompt);

    return { domain, keyTerms, complexity };
  }

  /**
   * Identify prompt domain
   */
  private identifyDomain(prompt: string): string {
    const lowerPrompt = prompt.toLowerCase();
    
    if (lowerPrompt.includes('financial') || lowerPrompt.includes('market') || lowerPrompt.includes('investment')) {
      return 'financial';
    } else if (lowerPrompt.includes('technical') || lowerPrompt.includes('code') || lowerPrompt.includes('implementation')) {
      return 'technical';
    } else if (lowerPrompt.includes('marketing') || lowerPrompt.includes('campaign') || lowerPrompt.includes('customer')) {
      return 'marketing';
    } else if (lowerPrompt.includes('customer') || lowerPrompt.includes('support') || lowerPrompt.includes('service')) {
      return 'customer_service';
    }
    
    return 'general';
  }

  /**
   * Extract key terms from prompt
   */
  private extractKeyTerms(prompt: string): string[] {
    // Simple key term extraction (in production, would use NLP)
    const words = prompt.toLowerCase().split(/\s+/);
    const stopWords = new Set(['the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by']);
    
    return words
      .filter(word => word.length > 3 && !stopWords.has(word))
      .slice(0, 10); // Top 10 key terms
  }

  /**
   * Assess prompt complexity
   */
  private assessComplexity(prompt: string): 'low' | 'medium' | 'high' {
    const wordCount = prompt.split(/\s+/).length;
    const sentenceCount = prompt.split(/[.!?]+/).length;
    const avgWordsPerSentence = wordCount / sentenceCount;
    
    if (wordCount < 20 && avgWordsPerSentence < 15) {
      return 'low';
    } else if (wordCount < 50 && avgWordsPerSentence < 25) {
      return 'medium';
    } else {
      return 'high';
    }
  }

  /**
   * Select relevant examples for few-shot learning
   */
  private selectRelevantExamples(prompt: string, examples: FewShotExample[]): FewShotExample[] {
    const relevantExamples = examples
      .map(ex => ({
        example: ex,
        similarity: this.calculateSimilarity(prompt, ex.input)
      }))
      .filter(item => item.similarity >= 0.3)
      .sort((a, b) => b.similarity - a.similarity)
      .slice(0, this.config.max_few_shot_examples)
      .map(item => item.example);

    return relevantExamples;
  }

  /**
   * Domain-specific optimizations
   */
  private optimizeFinancialPrompt(prompt: string): string {
    return prompt
      .replace(/comprehensive insights on/g, 'insights on')
      .replace(/thorough analysis of/g, 'analyze')
      .replace(/detailed evaluation of/g, 'evaluate')
      .replace(/risk factors and investment opportunities/g, 'risks and opportunities')
      .replace(/market trends, risk factors, and investment opportunities/g, 'market trends, risks, and opportunities');
  }

  private optimizeTechnicalPrompt(prompt: string): string {
    return prompt
      .replace(/comprehensive summary that highlights/g, 'summary of')
      .replace(/key implementation details, potential issues, and suggested solutions/g, 'implementation details, issues, and solutions')
      .replace(/thorough evaluation of/g, 'evaluate')
      .replace(/detailed report with recommendations/g, 'report with recommendations');
  }

  private optimizeMarketingPrompt(prompt: string): string {
    return prompt
      .replace(/conduct a thorough evaluation of/g, 'evaluate')
      .replace(/suggest improvements based on performance metrics, audience engagement, and ROI analysis/g, 'suggest improvements based on metrics and ROI')
      .replace(/comprehensive analysis of/g, 'analyze')
      .replace(/detailed insights on/g, 'insights on');
  }

  private optimizeCustomerServicePrompt(prompt: string): string {
    return prompt
      .replace(/examine the customer feedback data and generate a detailed report/g, 'examine customer feedback and generate report')
      .replace(/recommendations for improving our product features and user experience/g, 'recommendations for product improvements')
      .replace(/comprehensive analysis of/g, 'analyze')
      .replace(/thorough review of/g, 'review');
  }

  /**
   * Apply advanced mutation
   */
  async applyAdvancedMutation(prompt: string, mutationType: string): Promise<string> {
    switch (mutationType) {
      case 'semantic_similarity':
        return await this.applySemanticSimilarityMutation(prompt);
      case 'context_aware':
        return await this.applyContextAwareMutation(prompt);
      case 'domain_specific':
        return await this.applyDomainSpecificMutation(prompt);
      case 'few_shot_learning':
        return await this.applyFewShotLearningMutation(prompt, this.fewShotExamples);
      default:
        return prompt;
    }
  }

  /**
   * Get available mutation types
   */
  getAvailableMutations(): SemanticMutation[] {
    return [
      {
        type: 'semantic_similarity',
        description: 'Apply optimization patterns from similar prompts',
        apply: (prompt: string) => this.applySemanticSimilarityMutation(prompt)
      },
      {
        type: 'context_aware',
        description: 'Optimize based on prompt context and domain',
        apply: (prompt: string) => this.applyContextAwareMutation(prompt)
      },
      {
        type: 'domain_specific',
        description: 'Apply domain-specific optimization rules',
        apply: (prompt: string) => this.applyDomainSpecificMutation(prompt)
      },
      {
        type: 'few_shot_learning',
        description: 'Learn from few-shot examples',
        apply: (prompt: string, examples?: FewShotExample[]) => 
          this.applyFewShotLearningMutation(prompt, examples || this.fewShotExamples)
      }
    ];
  }

  /**
   * Add new few-shot example
   */
  addFewShotExample(example: FewShotExample): void {
    this.fewShotExamples.push(example);
    console.log(`[Advanced CAPO] Added few-shot example: ${example.input.substring(0, 50)}...`);
  }

  /**
   * Get few-shot examples
   */
  getFewShotExamples(): FewShotExample[] {
    return [...this.fewShotExamples];
  }

  /**
   * Update configuration
   */
  updateConfig(newConfig: Partial<AdvancedCAPOConfig>): void {
    this.config = { ...this.config, ...newConfig };
    console.log('[Advanced CAPO] Configuration updated:', this.config);
  }
}

// Export for use in CAPO integration
export type { FewShotExample, SemanticMutation, AdvancedCAPOConfig };

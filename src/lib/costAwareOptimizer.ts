// Cost-Aware GEPA Optimization Engine with Real API/GPU Pricing

interface TestCase {
  amount: number;
  urgency: string;
  type: string;
}

interface CostMetrics {
  tokensIn: number;
  tokensOut: number;
  inferenceSeconds: number;
  requestFee: number;
  totalCostUSD: number;
}

interface OptimizationResult {
  evolvedPrompt: string;
  accuracy: number;
  costReduction: number;
  totalCost: number;
  optimizationScore: number;
}

interface PricingConfig {
  perplexityInputRate: number;   // $ per 1M input tokens
  perplexityOutputRate: number;  // $ per 1M output tokens
  perplexityRequestFee: number;  // $ per request
  gpuRatePerSecond: number;      // $ per second for GPU inference
  accuracyWeight: number;        // Weight for accuracy in Pareto optimization
  costWeight: number;           // Weight for cost in Pareto optimization
}

// Real pricing data as of September 2025
const CURRENT_PRICING: PricingConfig = {
  // Perplexity AI Sonar models pricing
  perplexityInputRate: 1.0 / 1_000_000,    // $1 per 1M tokens
  perplexityOutputRate: 1.0 / 1_000_000,   // $1 per 1M tokens  
  perplexityRequestFee: 0.005,             // $0.005 per request
  
  // GPU inference pricing (H100 average)
  gpuRatePerSecond: 0.0018,                // $6.50/hour / 3600 seconds
  
  // Pareto optimization weights
  accuracyWeight: 0.6,                     // 60% weight on accuracy
  costWeight: 0.4                          // 40% weight on cost efficiency
};

export class CostAwareOptimizer {
  private pricing: PricingConfig;
  private optimizationHistory: OptimizationResult[] = [];
  private currentPopulation: string[] = [];
  private generationCount: number = 0;

  constructor(pricing: Partial<PricingConfig> = {}) {
    this.pricing = { ...CURRENT_PRICING, ...pricing };
    this.initializePopulation();
  }

  // Initialize population with base prompts for evolution
  private initializePopulation() {
    this.currentPopulation = [
      "Analyze the payment request and select the optimal payment rail based on amount, urgency, and cost.",
      "Determine the best payment method considering fees, speed, and reliability.",
      "Select payment rail: USDC for <$100, ACH for >$1000, wire for urgent >$5000.",
      "Optimize payment selection using cost-benefit analysis and user preferences."
    ];
  }

  // Calculate real-time cost metrics for a request
  calculateCostMetrics(tokensIn: number, tokensOut: number, inferenceSeconds: number = 0): CostMetrics {
    const inputCost = tokensIn * this.pricing.perplexityInputRate;
    const outputCost = tokensOut * this.pricing.perplexityOutputRate;
    const requestCost = this.pricing.perplexityRequestFee;
    const gpuCost = inferenceSeconds * this.pricing.gpuRatePerSecond;
    
    const totalCost = inputCost + outputCost + requestCost + gpuCost;

    return {
      tokensIn,
      tokensOut,
      inferenceSeconds,
      requestFee: requestCost,
      totalCostUSD: totalCost
    };
  }

  // Calculate Pareto optimization score balancing accuracy vs cost
  calculateOptimizationScore(accuracy: number, costMetrics: CostMetrics): number {
    // Normalize accuracy (0-1)
    const normalizedAccuracy = Math.max(0, Math.min(1, accuracy));
    
    // Normalize cost (inverse relationship - lower cost is better)
    // Use log scaling to handle wide cost ranges
    const normalizedCost = 1 / (1 + Math.log(costMetrics.totalCostUSD + 1e-6));
    
    // Weighted combination for Pareto front
    const score = (normalizedAccuracy * this.pricing.accuracyWeight) + 
                  (normalizedCost * this.pricing.costWeight);
    
    return score;
  }

  // Simulate prompt evolution using cost-aware mutations
  evolvePrompt(basePrompt: string, iteration: number): string[] {
    const mutations = [];
    
    // Mutation 1: Token reduction (cost optimization)
    if (basePrompt.length > 50) {
      const shortened = basePrompt
        .split(' ')
        .filter((word, index) => index % 2 === 0 || word.length > 4)
        .join(' ');
      mutations.push(shortened);
    }
    
    // Mutation 2: Add cost awareness
    const costAware = basePrompt + " Minimize API costs while maintaining accuracy.";
    mutations.push(costAware);
    
    // Mutation 3: Specific instruction optimization
    const optimized = basePrompt
      .replace(/Analyze the payment request/g, 'Analyze payment')
      .replace(/considering fees, speed, and reliability/g, 'optimize for cost')
      .replace(/cost-benefit analysis/g, 'cost analysis');
    mutations.push(optimized);
    
    // Mutation 4: Concise version
    const concise = basePrompt
      .split('.')
      .map(sentence => sentence.trim())
      .filter(sentence => sentence.length > 0)
      .slice(0, 2)
      .join('. ') + '.';
    mutations.push(concise);
    
    return mutations;
  }

  // Evaluate prompt performance with real cost tracking
  async evaluatePrompt(prompt: string, testCases: TestCase[]): Promise<{ accuracy: number; avgCost: number; score: number }> {
    let totalAccuracy = 0;
    let totalCost = 0;
    let validTests = 0;
    
    for (const testCase of testCases) {
      try {
        // Simulate API call with token counting
        const estimatedTokens = this.estimateTokenCount(prompt + JSON.stringify(testCase));
        const responseTokens = Math.max(10, Math.floor(estimatedTokens * 0.3)); // Assume 30% response ratio
        
        const costMetrics = this.calculateCostMetrics(estimatedTokens, responseTokens, 2); // 2s GPU time
        totalCost += costMetrics.totalCostUSD;
        
        // Simulate accuracy calculation (in real implementation, this would be actual evaluation)
        const accuracy = this.simulateAccuracy(prompt, testCase);
        totalAccuracy += accuracy;
        validTests++;
        
      } catch (error) {
        console.error('Evaluation error:', error);
      }
    }
    
    const avgAccuracy = validTests > 0 ? totalAccuracy / validTests : 0;
    const avgCost = validTests > 0 ? totalCost / validTests : 0;
    const avgCostMetrics = this.calculateCostMetrics(0, 0, 0);
    avgCostMetrics.totalCostUSD = avgCost;
    
    const score = this.calculateOptimizationScore(avgAccuracy, avgCostMetrics);
    
    return { accuracy: avgAccuracy, avgCost, score };
  }

  // Estimate token count for cost calculation
  private estimateTokenCount(text: string): number {
    // Rough estimation: 1 token ≈ 4 characters for English text
    return Math.ceil(text.length / 4);
  }

  // Simulate accuracy evaluation (replace with real evaluation in production)
  private simulateAccuracy(prompt: string, _testCase: TestCase): number {
    // Base accuracy on prompt characteristics
    let accuracy = 0.7; // Base accuracy
    
    // Reward concise prompts
    if (prompt.length < 100) accuracy += 0.1;
    if (prompt.includes('cost') || prompt.includes('optimize')) accuracy += 0.1;
    if (prompt.includes('USD') || prompt.includes('USDC')) accuracy += 0.05;
    
    // Add some randomness for realism
    accuracy += (Math.random() - 0.5) * 0.1;
    
    return Math.max(0, Math.min(1, accuracy));
  }

  // Main optimization loop - GEPA-inspired evolution
  async optimize(budget: number = 150): Promise<OptimizationResult> {
    console.log(`Starting cost-aware optimization with budget: ${budget} evaluations`);
    
    let bestResult: OptimizationResult | null = null;
    let evaluationCount = 0;
    
    // Test cases for evaluation
    const testCases = [
      { amount: 50, urgency: 'low', type: 'vendor_payment' },
      { amount: 500, urgency: 'medium', type: 'payroll' },
      { amount: 5000, urgency: 'high', type: 'invoice' },
      { amount: 100, urgency: 'low', type: 'refund' },
      { amount: 1000, urgency: 'medium', type: 'subscription' }
    ];
    
    while (evaluationCount < budget && this.currentPopulation.length > 0) {
      // Select top performers for reproduction
      const evaluations = await Promise.all(
        this.currentPopulation.slice(0, 8).map(async (prompt) => {
          const result = await this.evaluatePrompt(prompt, testCases);
          evaluationCount++;
          return { prompt, ...result };
        })
      );
      
      // Sort by optimization score
      evaluations.sort((a, b) => b.score - a.score);
      
      // Track best result
      const currentBest = evaluations[0];
      if (!bestResult || currentBest.score > bestResult.optimizationScore) {
        bestResult = {
          evolvedPrompt: currentBest.prompt,
          accuracy: currentBest.accuracy,
          costReduction: bestResult ? (bestResult.totalCost - currentBest.avgCost) / bestResult.totalCost * 100 : 0,
          totalCost: currentBest.avgCost,
          optimizationScore: currentBest.score
        };
      }
      
      // Evolve population
      const newPopulation = [];
      const topPerformers = evaluations.slice(0, 4);
      
      for (const performer of topPerformers) {
        // Keep original
        newPopulation.push(performer.prompt);
        
        // Add mutations
        const mutations = this.evolvePrompt(performer.prompt, this.generationCount);
        newPopulation.push(...mutations);
      }
      
      // Add random exploration
      if (Math.random() < 0.3) {
        const randomPrompt = this.generateRandomPrompt();
        newPopulation.push(randomPrompt);
      }
      
      this.currentPopulation = newPopulation.slice(0, 12); // Limit population size
      this.generationCount++;
      
      console.log(`Generation ${this.generationCount}: Best score: ${currentBest.score.toFixed(4)}, Cost: $${currentBest.avgCost.toFixed(6)}`);
    }
    
    if (!bestResult) {
      throw new Error('Optimization failed to produce results');
    }
    
    this.optimizationHistory.push(bestResult);
    console.log(`Optimization completed. Best result:`, bestResult);
    
    return bestResult;
  }

  // Generate random prompt for exploration
  private generateRandomPrompt(): string {
    const templates = [
      "Select optimal payment rail for transaction.",
      "Choose payment method based on cost and speed.",
      "Route payment through cheapest available option.",
      "Optimize payment selection for minimum cost."
    ];
    
    return templates[Math.floor(Math.random() * templates.length)];
  }

  // Update pricing configuration
  updatePricing(newPricing: Partial<PricingConfig>) {
    this.pricing = { ...this.pricing, ...newPricing };
    console.log('Pricing configuration updated:', this.pricing);
  }

  // Get optimization history
  getOptimizationHistory(): OptimizationResult[] {
    return [...this.optimizationHistory];
  }

  // Get current pricing
  getCurrentPricing(): PricingConfig {
    return { ...this.pricing };
  }

  // Calculate potential savings
  calculateSavings(baselineCost: number, optimizedCost: number): number {
    return ((baselineCost - optimizedCost) / baselineCost) * 100;
  }

  // Export evolved prompt for deployment
  exportEvolvedPrompt(result: OptimizationResult): string {
    return JSON.stringify({
      prompt: result.evolvedPrompt,
      metadata: {
        accuracy: result.accuracy,
        costReduction: result.costReduction,
        totalCost: result.totalCost,
        optimizationScore: result.optimizationScore,
        timestamp: new Date().toISOString(),
        pricing: this.pricing
      }
    }, null, 2);
  }
}

// Export singleton instance
export const costAwareOptimizer = new CostAwareOptimizer();

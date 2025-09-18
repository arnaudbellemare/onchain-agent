// CAPO (Cost-Aware Prompt Optimization) Integration
// Based on the paper: "CAPO: Cost-Aware Prompt Optimization" (arXiv:2504.16005)
import { costAwareOptimizer } from './costAwareOptimizer';

interface CAPOConfig {
  populationSize: number;
  budget: number;
  lengthPenalty: number;
  racingThreshold: number;
  paretoWeights: {
    accuracy: number;
    length: number;
    cost: number;
  };
}

interface CAPOIndividual {
  prompt: string;
  accuracy: number;
  length: number;
  cost: number;
  fitness: number;
  evaluations: number;
}

interface CAPOResult {
  bestPrompt: string;
  finalAccuracy: number;
  costReduction: number;
  lengthReduction: number;
  totalEvaluations: number;
  paretoFront: CAPOIndividual[];
}

// Default CAPO configuration
const DEFAULT_CAPO_CONFIG: CAPOConfig = {
  populationSize: 20,
  budget: 100,
  lengthPenalty: 0.2,
  racingThreshold: 5,
  paretoWeights: {
    accuracy: 0.5,
    length: 0.25,
    cost: 0.25
  }
};

export class CAPOOptimizer {
  private config: CAPOConfig;
  private population: CAPOIndividual[] = [];
  private generationCount: number = 0;
  private evaluationCount: number = 0;
  private paretoFront: CAPOIndividual[] = [];

  constructor(config: Partial<CAPOConfig> = {}) {
    this.config = { ...DEFAULT_CAPO_CONFIG, ...config };
  }

  // Initialize population from task description
  initializePopulation(taskDescription: string): void {
    this.population = [];
    
    // Generate diverse initial population
    const basePrompts = [
      taskDescription,
      `Optimize ${taskDescription.toLowerCase()} for cost efficiency.`,
      `Select best option for ${taskDescription.toLowerCase()} considering price.`,
      `Choose optimal solution for ${taskDescription.toLowerCase()} with minimal cost.`,
      `Route ${taskDescription.toLowerCase()} through cheapest available method.`
    ];

    for (let i = 0; i < this.config.populationSize; i++) {
      const prompt = this.mutatePrompt(basePrompts[i % basePrompts.length]);
      this.population.push({
        prompt,
        accuracy: 0,
        length: prompt.length,
        cost: 0,
        fitness: 0,
        evaluations: 0
      });
    }

    console.log(`CAPO: Initialized population of ${this.population.length} individuals`);
  }

  // CAPO mutation operators (using LLM-inspired mutations)
  mutatePrompt(prompt: string): string {
    const mutations = [
      // Length reduction mutation
      () => this.reduceLength(prompt),
      // Cost awareness mutation
      () => this.addCostAwareness(prompt),
      // Instruction optimization mutation
      () => this.optimizeInstructions(prompt),
      // Synonym replacement mutation
      () => this.replaceSynonyms(prompt),
      // Structure simplification mutation
      () => this.simplifyStructure(prompt)
    ];

    const mutation = mutations[Math.floor(Math.random() * mutations.length)];
    return mutation();
  }

  // Length reduction mutation
  private reduceLength(prompt: string): string {
    const sentences = prompt.split('.').filter(s => s.trim().length > 0);
    if (sentences.length > 1) {
      return sentences.slice(0, Math.ceil(sentences.length / 2)).join('. ') + '.';
    }
    
    // Remove redundant words
    const words = prompt.split(' ');
    const filtered = words.filter((word, index) => {
      const redundant = ['the', 'and', 'or', 'but', 'with', 'for', 'to', 'of', 'in', 'on', 'at'];
      return !redundant.includes(word.toLowerCase()) || index % 3 === 0;
    });
    
    return filtered.join(' ');
  }

  // Add cost awareness
  private addCostAwareness(prompt: string): string {
    const costTerms = ['cost-efficient', 'budget-friendly', 'minimize expense', 'optimize cost', 'cheapest option'];
    const term = costTerms[Math.floor(Math.random() * costTerms.length)];
    
    if (prompt.includes('cost') || prompt.includes('price')) {
      return prompt;
    }
    
    return `${prompt} Focus on ${term}.`;
  }

  // Optimize instructions
  private optimizeInstructions(prompt: string): string {
    return prompt
      .replace(/analyze the/g, 'analyze')
      .replace(/determine the/g, 'determine')
      .replace(/select the/g, 'select')
      .replace(/choose the/g, 'choose')
      .replace(/considering/g, 'consider')
      .replace(/based on/g, 'using');
  }

  // Replace with synonyms
  private replaceSynonyms(prompt: string): string {
    const synonyms: Record<string, string[]> = {
      'optimal': ['best', 'ideal', 'perfect'],
      'payment': ['transaction', 'transfer', 'payment'],
      'method': ['approach', 'way', 'option'],
      'cost': ['price', 'expense', 'fee'],
      'select': ['choose', 'pick', 'decide']
    };

    let result = prompt;
    for (const [word, alternatives] of Object.entries(synonyms)) {
      if (result.toLowerCase().includes(word)) {
        const replacement = alternatives[Math.floor(Math.random() * alternatives.length)];
        result = result.replace(new RegExp(word, 'gi'), replacement);
        break; // Only replace one word per mutation
      }
    }
    
    return result;
  }

  // Simplify structure
  private simplifyStructure(prompt: string): string {
    return prompt
      .replace(/,/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
  }

  // Racing evaluation (early stopping for underperformers)
  private shouldStopEarly(individual: CAPOIndividual): boolean {
    return individual.evaluations >= this.config.racingThreshold && 
           individual.fitness < 0.5; // Low fitness threshold
  }

  // Evaluate individual with cost tracking
  async evaluateIndividual(individual: CAPOIndividual, testCases: any[]): Promise<void> {
    if (this.shouldStopEarly(individual)) {
      console.log(`CAPO: Early stopping for individual with fitness ${individual.fitness.toFixed(4)}`);
      return;
    }

    try {
      // Estimate token usage
      const inputTokens = Math.ceil(individual.prompt.length / 4);
      const outputTokens = Math.ceil(inputTokens * 0.3); // Assume 30% response ratio
      
      // Calculate cost using real pricing
      const costMetrics = costAwareOptimizer.calculateCostMetrics(inputTokens, outputTokens, 1);
      individual.cost = costMetrics.totalCostUSD;
      
      // Simulate accuracy evaluation
      individual.accuracy = this.simulateAccuracy(individual.prompt, testCases);
      
      // Calculate fitness using Pareto optimization
      individual.fitness = this.calculateFitness(individual);
      individual.evaluations++;
      
      this.evaluationCount++;
      
    } catch (error) {
      console.error('CAPO: Evaluation error:', error);
      individual.fitness = 0;
    }
  }

  // Simulate accuracy evaluation
  private simulateAccuracy(prompt: string, testCases: any[]): number {
    let accuracy = 0.6; // Base accuracy
    
    // Reward concise prompts
    if (prompt.length < 80) accuracy += 0.1;
    if (prompt.length < 50) accuracy += 0.1;
    
    // Reward cost-aware prompts
    if (prompt.includes('cost') || prompt.includes('cheap') || prompt.includes('budget')) {
      accuracy += 0.1;
    }
    
    // Reward action-oriented prompts
    if (prompt.includes('select') || prompt.includes('choose') || prompt.includes('pick')) {
      accuracy += 0.05;
    }
    
    // Add realistic variance
    accuracy += (Math.random() - 0.5) * 0.1;
    
    return Math.max(0, Math.min(1, accuracy));
  }

  // Calculate Pareto fitness
  private calculateFitness(individual: CAPOIndividual): number {
    const accuracyScore = individual.accuracy * this.config.paretoWeights.accuracy;
    const lengthScore = (1 - individual.length / 200) * this.config.paretoWeights.length; // Normalize by 200 chars
    const costScore = (1 / (individual.cost + 1e-6)) * this.config.paretoWeights.cost;
    
    return accuracyScore + lengthScore + costScore;
  }

  // Pareto selection using NSGA-II inspired approach
  private paretoSelection(): CAPOIndividual[] {
    // Sort by fitness (descending)
    const sorted = [...this.population].sort((a, b) => b.fitness - a.fitness);
    
    // Select top performers for next generation
    const selected = sorted.slice(0, Math.floor(this.config.populationSize / 2));
    
    // Update Pareto front
    this.paretoFront = sorted.filter(ind => ind.fitness > 0.7);
    
    return selected;
  }

  // Main CAPO optimization loop
  async optimize(taskDescription: string, testCases: any[]): Promise<CAPOResult> {
    console.log(`CAPO: Starting optimization with budget ${this.config.budget}`);
    
    this.initializePopulation(taskDescription);
    
    while (this.evaluationCount < this.config.budget) {
      // Evaluate current population
      const evaluationPromises = this.population.map(individual => 
        this.evaluateIndividual(individual, testCases)
      );
      
      await Promise.all(evaluationPromises);
      
      // Select parents for next generation
      const parents = this.paretoSelection();
      
      // Generate offspring through mutation
      const offspring: CAPOIndividual[] = [];
      
      for (const parent of parents) {
        // Create offspring through mutation
        const mutatedPrompt = this.mutatePrompt(parent.prompt);
        offspring.push({
          prompt: mutatedPrompt,
          accuracy: 0,
          length: mutatedPrompt.length,
          cost: 0,
          fitness: 0,
          evaluations: 0
        });
      }
      
      // Replace population
      this.population = [...parents, ...offspring];
      
      this.generationCount++;
      
      // Log progress
      const bestIndividual = this.population.reduce((best, current) => 
        current.fitness > best.fitness ? current : best
      );
      
      console.log(`CAPO Generation ${this.generationCount}: Best fitness ${bestIndividual.fitness.toFixed(4)}, Evaluations: ${this.evaluationCount}/${this.config.budget}`);
      
      // Early stopping if converged
      if (this.generationCount > 10 && this.paretoFront.length > 0) {
        const avgFitness = this.paretoFront.reduce((sum, ind) => sum + ind.fitness, 0) / this.paretoFront.length;
        if (avgFitness > 0.9) {
          console.log('CAPO: Convergence detected, stopping early');
          break;
        }
      }
    }
    
    // Find best result
    const bestIndividual = this.population.reduce((best, current) => 
      current.fitness > best.fitness ? current : best
    );
    
    const result: CAPOResult = {
      bestPrompt: bestIndividual.prompt,
      finalAccuracy: bestIndividual.accuracy,
      costReduction: this.calculateCostReduction(bestIndividual),
      lengthReduction: this.calculateLengthReduction(bestIndividual),
      totalEvaluations: this.evaluationCount,
      paretoFront: [...this.paretoFront]
    };
    
    console.log('CAPO: Optimization completed', result);
    
    return result;
  }

  // Calculate cost reduction percentage
  private calculateCostReduction(best: CAPOIndividual): number {
    const baselineCost = 0.01; // Assume baseline cost
    return ((baselineCost - best.cost) / baselineCost) * 100;
  }

  // Calculate length reduction percentage
  private calculateLengthReduction(best: CAPOIndividual): number {
    const baselineLength = 100; // Assume baseline length
    return ((baselineLength - best.length) / baselineLength) * 100;
  }

  // Get current configuration
  getConfig(): CAPOConfig {
    return { ...this.config };
  }

  // Update configuration
  updateConfig(newConfig: Partial<CAPOConfig>): void {
    this.config = { ...this.config, ...newConfig };
    console.log('CAPO: Configuration updated', this.config);
  }

  // Export optimized prompt for deployment
  exportOptimizedPrompt(result: CAPOResult): string {
    return JSON.stringify({
      prompt: result.bestPrompt,
      metadata: {
        accuracy: result.finalAccuracy,
        costReduction: result.costReduction,
        lengthReduction: result.lengthReduction,
        totalEvaluations: result.totalEvaluations,
        paretoFrontSize: result.paretoFront.length,
        timestamp: new Date().toISOString(),
        config: this.config
      }
    }, null, 2);
  }
}

// Export singleton instance
export const capoOptimizer = new CAPOOptimizer();

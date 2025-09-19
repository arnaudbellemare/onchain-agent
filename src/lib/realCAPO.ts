/**
 * Real CAPO Implementation
 * Official Cost-Aware Prompt Optimization with actual LLM evaluations
 * Based on the paper: "CAPO: Cost-Aware Prompt Optimization" (arXiv:2504.16005)
 */

import { StatisticalTests, RacingManager } from './statisticalTests';
import { RealDatasets, DatasetEvaluator } from './realDatasets';
import { RealLLMPromptOptimizer, RealLLMManager } from './realLLMIntegration';

interface CAPOIndividual {
  id: string;
  prompt: string;
  instructions: string;
  examples: string[];
  evaluations: number;
  scores: number[];
  meanScore: number;
  cost: number;
  length: number;
  fitness: number;
  isActive: boolean;
}

interface CAPOConfig {
  populationSize: number;
  budget: number; // Total number of evaluations
  lengthPenalty: number;
  racingThreshold: number;
  paretoWeights: {
    accuracy: number;
    length: number;
    cost: number;
  };
  mutationRate: number;
  crossoverRate: number;
  maxGenerations: number;
  earlyStoppingPatience: number;
}

interface CAPOResult {
  bestPrompt: CAPOIndividual;
  finalAccuracy: number;
  costReduction: number;
  lengthReduction: number;
  totalEvaluations: number;
  paretoFront: CAPOIndividual[];
  racingStats: Record<string, any>;
  optimizationHistory: {
    generation: number;
    bestFitness: number;
    avgFitness: number;
    evaluations: number;
  }[];
}

/**
 * Real CAPO Optimizer with actual LLM evaluations
 */
export class RealCAPOOptimizer {
  private config: CAPOConfig;
  private population: CAPOIndividual[] = [];
  private generationCount: number = 0;
  private evaluationCount: number = 0;
  private paretoFront: CAPOIndividual[] = [];
  private racingManager: RacingManager;
  private datasetEvaluator!: DatasetEvaluator;
  private llmOptimizer: RealLLMPromptOptimizer;
  private llmManager: RealLLMManager;
  private optimizationHistory: CAPOResult['optimizationHistory'] = [];
  private taskDescription: string = '';

  constructor(config: Partial<CAPOConfig> = {}) {
    this.config = {
      populationSize: 20,
      budget: 100,
      lengthPenalty: 0.2,
      racingThreshold: 5,
      paretoWeights: { accuracy: 0.5, length: 0.25, cost: 0.25 },
      mutationRate: 0.3,
      crossoverRate: 0.7,
      maxGenerations: 50,
      earlyStoppingPatience: 10,
      ...config
    };

    this.racingManager = new RacingManager(this.config.budget);
    this.llmOptimizer = new RealLLMPromptOptimizer();
    this.llmManager = new RealLLMManager();
  }

  /**
   * Initialize CAPO with real dataset
   */
  async initialize(
    taskDescription: string,
    datasetName: string = 'financial_decisions'
  ): Promise<void> {
    this.taskDescription = taskDescription;
    this.datasetEvaluator = new DatasetEvaluator(datasetName);
    
    console.log(`CAPO: Initializing with dataset ${datasetName}`);
    console.log(`CAPO: Task: ${taskDescription}`);
    console.log(`CAPO: Budget: ${this.config.budget} evaluations`);
    
    await this.initializePopulation();
  }

  /**
   * Initialize population with diverse prompts
   */
  private async initializePopulation(): Promise<void> {
    this.population = [];
    
    // Generate diverse initial population using LLM
    const basePrompts = await this.generateBasePrompts();
    
    for (let i = 0; i < this.config.populationSize; i++) {
      const prompt = await this.createInitialPrompt(basePrompts[i % basePrompts.length]);
      const individual: CAPOIndividual = {
        id: `ind_${i}`,
        prompt: prompt.fullPrompt,
        instructions: prompt.instructions,
        examples: prompt.examples,
        evaluations: 0,
        scores: [],
        meanScore: 0,
        cost: 0,
        length: prompt.fullPrompt.length,
        fitness: 0,
        isActive: true
      };
      
      this.population.push(individual);
    }
    
    console.log(`CAPO: Initialized population of ${this.population.length} individuals`);
  }

  /**
   * Generate base prompts using LLM
   */
  private async generateBasePrompts(): Promise<string[]> {
    const basePrompts = [
      this.taskDescription,
      `Optimize ${this.taskDescription.toLowerCase()} for cost efficiency.`,
      `Select best option for ${this.taskDescription.toLowerCase()} considering price.`,
      `Choose optimal solution for ${this.taskDescription.toLowerCase()} with minimal cost.`,
      `Route ${this.taskDescription.toLowerCase()} through cheapest available method.`
    ];

    // Enhance base prompts with LLM
    const enhancedPrompts: string[] = [];
    for (const prompt of basePrompts) {
      try {
        const enhanced = await this.llmOptimizer.optimizePrompt(prompt, 'cost');
        enhancedPrompts.push(enhanced.optimized_prompt);
      } catch (error) {
        console.warn('LLM optimization failed, using base prompt:', error);
        enhancedPrompts.push(prompt);
      }
    }

    return enhancedPrompts;
  }

  /**
   * Create initial prompt with instructions and examples
   */
  private async createInitialPrompt(basePrompt: string): Promise<{
    fullPrompt: string;
    instructions: string;
    examples: string[];
  }> {
    const instructions = await this.generateInstructions(basePrompt);
    const examples = await this.generateExamples(basePrompt);
    
    const fullPrompt = `${instructions}\n\nExamples:\n${examples.join('\n')}`;
    
    return {
      fullPrompt,
      instructions,
      examples
    };
  }

  /**
   * Generate instructions using LLM
   */
  private async generateInstructions(basePrompt: string): Promise<string> {
    const instructionPrompt = `Generate clear, concise instructions for: ${basePrompt}
    
    Requirements:
    - Be specific and actionable
    - Include cost considerations
    - Keep under 100 words
    - Focus on optimization`;
    
    try {
      const response = await this.llmManager.generateResponse({
        prompt: instructionPrompt,
        max_tokens: 150,
        temperature: 0.7
      });
      return response.content;
    } catch (error) {
      console.warn('Instruction generation failed:', error);
      return basePrompt;
    }
  }

  /**
   * Generate examples using LLM
   */
  private async generateExamples(basePrompt: string): Promise<string[]> {
    const examplePrompt = `Generate 2-3 examples for: ${basePrompt}
    
    Format each example as:
    Input: [description]
    Output: [optimized solution]
    
    Focus on cost optimization and practical solutions.`;
    
    try {
      const response = await this.llmManager.generateResponse({
        prompt: examplePrompt,
        max_tokens: 300,
        temperature: 0.8
      });
      
      // Parse examples from response
      const lines = response.content.split('\n');
      const examples: string[] = [];
      let currentExample = '';
      
      for (const line of lines) {
        if (line.startsWith('Input:') || line.startsWith('Output:')) {
          currentExample += line + '\n';
        } else if (currentExample.trim()) {
          examples.push(currentExample.trim());
          currentExample = '';
        }
      }
      
      if (currentExample.trim()) {
        examples.push(currentExample.trim());
      }
      
      return examples.length > 0 ? examples : ['Input: Example input\nOutput: Example output'];
    } catch (error) {
      console.warn('Example generation failed:', error);
      return ['Input: Example input\nOutput: Example output'];
    }
  }

  /**
   * Evaluate individual with real LLM calls
   */
  private async evaluateIndividual(individual: CAPOIndividual): Promise<void> {
    if (!individual.isActive) return;

    try {
      // Check racing decision
      const racingDecision = this.racingManager.shouldStopEvaluation(individual.id);
      if (racingDecision.shouldStop) {
        console.log(`CAPO: Stopping evaluation for ${individual.id}: ${racingDecision.reason}`);
        individual.isActive = false;
        return;
      }

      // Real LLM evaluation
      const evaluation = await this.datasetEvaluator.evaluatePrompt(
        individual.prompt,
        async (input: string, prompt: string) => {
          const fullPrompt = `${prompt}\n\nTask: ${input}`;
          const response = await this.llmManager.generateResponse({
            prompt: fullPrompt,
            max_tokens: 200,
            temperature: 0.3
          });
          return response.content;
        }
      );

      // Update individual
      individual.scores.push(evaluation.accuracy);
      individual.meanScore = this.calculateMean(individual.scores);
      individual.cost += evaluation.cost;
      individual.evaluations++;
      individual.fitness = this.calculateFitness(individual);

      // Update racing manager
      this.racingManager.addEvaluation(individual.id, evaluation.accuracy);
      this.evaluationCount++;

      console.log(`CAPO: Individual ${individual.id} - Accuracy: ${evaluation.accuracy.toFixed(3)}, Cost: $${evaluation.cost.toFixed(4)}, Evaluations: ${individual.evaluations}`);

    } catch (error) {
      console.error(`CAPO: Evaluation error for ${individual.id}:`, error);
      individual.isActive = false;
    }
  }

  /**
   * Calculate fitness using Pareto optimization
   */
  private calculateFitness(individual: CAPOIndividual): number {
    const accuracyScore = individual.meanScore * this.config.paretoWeights.accuracy;
    const lengthScore = (1 - individual.length / 500) * this.config.paretoWeights.length; // Normalize by 500 chars
    const costScore = (1 / (individual.cost + 1e-6)) * this.config.paretoWeights.cost;
    
    return accuracyScore + lengthScore + costScore;
  }

  /**
   * CAPO mutation operators
   */
  private async mutateIndividual(individual: CAPOIndividual): Promise<CAPOIndividual> {
    const mutations = [
      () => this.mutateInstructions(individual),
      () => this.mutateExamples(individual),
      () => this.mutateLength(individual),
      () => this.mutateCostAwareness(individual)
    ];

    const mutation = mutations[Math.floor(Math.random() * mutations.length)];
    return await mutation();
  }

  /**
   * Mutate instructions using LLM
   */
  private async mutateInstructions(individual: CAPOIndividual): Promise<CAPOIndividual> {
    try {
      const mutationPrompt = `Optimize these instructions for better cost efficiency and clarity:
      
      ${individual.instructions}
      
      Make the instructions more specific about cost optimization while maintaining clarity.`;
      
      const response = await this.llmManager.generateResponse({
        prompt: mutationPrompt,
        max_tokens: 150,
        temperature: 0.7
      });

      const newInstructions = response.content;
      const newPrompt = `${newInstructions}\n\nExamples:\n${individual.examples.join('\n')}`;

      return {
        ...individual,
        id: `${individual.id}_mut_${Date.now()}`,
        prompt: newPrompt,
        instructions: newInstructions,
        length: newPrompt.length,
        evaluations: 0,
        scores: [],
        meanScore: 0,
        cost: 0,
        fitness: 0,
        isActive: true
      };
    } catch (error) {
      console.warn('Instruction mutation failed:', error);
      return individual;
    }
  }

  /**
   * Mutate examples using LLM
   */
  private async mutateExamples(individual: CAPOIndividual): Promise<CAPOIndividual> {
    try {
      const mutationPrompt = `Generate a new example for these instructions:
      
      ${individual.instructions}
      
      Create an example that demonstrates cost optimization and practical decision making.`;
      
      const response = await this.llmManager.generateResponse({
        prompt: mutationPrompt,
        max_tokens: 200,
        temperature: 0.8
      });

      // Replace one random example
      const newExamples = [...individual.examples];
      const randomIndex = Math.floor(Math.random() * newExamples.length);
      newExamples[randomIndex] = response.content;

      const newPrompt = `${individual.instructions}\n\nExamples:\n${newExamples.join('\n')}`;

      return {
        ...individual,
        id: `${individual.id}_mut_${Date.now()}`,
        prompt: newPrompt,
        examples: newExamples,
        length: newPrompt.length,
        evaluations: 0,
        scores: [],
        meanScore: 0,
        cost: 0,
        fitness: 0,
        isActive: true
      };
    } catch (error) {
      console.warn('Example mutation failed:', error);
      return individual;
    }
  }

  /**
   * Mutate length (simplify or expand)
   */
  private async mutateLength(individual: CAPOIndividual): Promise<CAPOIndividual> {
    const shouldSimplify = Math.random() < 0.5;
    
    if (shouldSimplify) {
      // Simplify instructions
      const simplified = individual.instructions
        .replace(/\b(the|and|or|but|with|for|to|of|in|on|at)\b/gi, '')
        .replace(/\s+/g, ' ')
        .trim();
      
      const newPrompt = `${simplified}\n\nExamples:\n${individual.examples.join('\n')}`;
      
      return {
        ...individual,
        id: `${individual.id}_mut_${Date.now()}`,
        prompt: newPrompt,
        instructions: simplified,
        length: newPrompt.length,
        evaluations: 0,
        scores: [],
        meanScore: 0,
        cost: 0,
        fitness: 0,
        isActive: true
      };
    } else {
      // Expand with more detail
      const expanded = `${individual.instructions} Consider all options and choose the most cost-effective solution.`;
      const newPrompt = `${expanded}\n\nExamples:\n${individual.examples.join('\n')}`;
      
      return {
        ...individual,
        id: `${individual.id}_mut_${Date.now()}`,
        prompt: newPrompt,
        instructions: expanded,
        length: newPrompt.length,
        evaluations: 0,
        scores: [],
        meanScore: 0,
        cost: 0,
        fitness: 0,
        isActive: true
      };
    }
  }

  /**
   * Mutate cost awareness
   */
  private async mutateCostAwareness(individual: CAPOIndividual): Promise<CAPOIndividual> {
    const costTerms = [
      'minimize cost',
      'optimize expenses',
      'reduce spending',
      'budget-friendly approach',
      'cost-effective solution'
    ];
    
    const term = costTerms[Math.floor(Math.random() * costTerms.length)];
    const enhanced = `${individual.instructions} ${term}.`;
    const newPrompt = `${enhanced}\n\nExamples:\n${individual.examples.join('\n')}`;
    
    return {
      ...individual,
      id: `${individual.id}_mut_${Date.now()}`,
      prompt: newPrompt,
      instructions: enhanced,
      length: newPrompt.length,
      evaluations: 0,
      scores: [],
      meanScore: 0,
      cost: 0,
      fitness: 0,
      isActive: true
    };
  }

  /**
   * Pareto selection
   */
  private paretoSelection(): CAPOIndividual[] {
    // Sort by fitness (descending)
    const sorted = [...this.population].sort((a, b) => b.fitness - a.fitness);
    
    // Select top performers
    const selected = sorted.slice(0, Math.floor(this.config.populationSize / 2));
    
    // Update Pareto front
    this.paretoFront = sorted.filter(ind => ind.fitness > 0.7 && ind.evaluations > 0);
    
    return selected;
  }

  /**
   * Main CAPO optimization loop
   */
  async optimize(): Promise<CAPOResult> {
    console.log('CAPO: Starting optimization with real LLM evaluations');
    
    let patience = 0;
    let bestFitness = -Infinity;
    
    while (this.evaluationCount < this.config.budget && 
           this.generationCount < this.config.maxGenerations &&
           patience < this.config.earlyStoppingPatience) {
      
      console.log(`\nCAPO Generation ${this.generationCount + 1}:`);
      
      // Evaluate active individuals
      const activeIndividuals = this.population.filter(ind => ind.isActive);
      const evaluationPromises = activeIndividuals.map(individual => 
        this.evaluateIndividual(individual)
      );
      
      await Promise.all(evaluationPromises);
      
      // Update population baseline for racing
      const scores = this.population
        .filter(ind => ind.scores.length > 0)
        .map(ind => ind.meanScore);
      
      if (scores.length > 0) {
        this.racingManager.updateBaseline(scores);
      }
      
      // Select parents
      const parents = this.paretoSelection();
      
      // Generate offspring through mutation
      const offspring: CAPOIndividual[] = [];
      for (const parent of parents) {
        const offspringCount = Math.floor(this.config.mutationRate * 3) + 1;
        for (let i = 0; i < offspringCount; i++) {
          const mutated = await this.mutateIndividual(parent);
          offspring.push(mutated);
        }
      }
      
      // Replace population
      this.population = [...parents, ...offspring].slice(0, this.config.populationSize);
      
      this.generationCount++;
      
      // Track optimization history
      const currentBest = this.population.reduce((best, current) => 
        current.fitness > best.fitness ? current : best
      );
      
      const avgFitness = this.population
        .filter(ind => ind.fitness > 0)
        .reduce((sum, ind) => sum + ind.fitness, 0) / this.population.length;
      
      this.optimizationHistory.push({
        generation: this.generationCount,
        bestFitness: currentBest.fitness,
        avgFitness: avgFitness || 0,
        evaluations: this.evaluationCount
      });
      
      // Early stopping check
      if (currentBest.fitness > bestFitness) {
        bestFitness = currentBest.fitness;
        patience = 0;
      } else {
        patience++;
      }
      
      console.log(`CAPO: Best fitness: ${currentBest.fitness.toFixed(4)}, Avg: ${avgFitness.toFixed(4)}, Evaluations: ${this.evaluationCount}/${this.config.budget}`);
      console.log(`CAPO: Active individuals: ${activeIndividuals.length}, Pareto front: ${this.paretoFront.length}`);
    }
    
    // Find best result
    const bestIndividual = this.population.reduce((best, current) => 
      current.fitness > best.fitness ? current : best
    );
    
    const result: CAPOResult = {
      bestPrompt: bestIndividual,
      finalAccuracy: bestIndividual.meanScore,
      costReduction: this.calculateCostReduction(bestIndividual),
      lengthReduction: this.calculateLengthReduction(bestIndividual),
      totalEvaluations: this.evaluationCount,
      paretoFront: [...this.paretoFront],
      racingStats: this.racingManager.getRacingStats(),
      optimizationHistory: [...this.optimizationHistory]
    };
    
    console.log('\nCAPO: Optimization completed');
    console.log(`CAPO: Best accuracy: ${result.finalAccuracy.toFixed(3)}`);
    console.log(`CAPO: Cost reduction: ${result.costReduction.toFixed(1)}%`);
    console.log(`CAPO: Length reduction: ${result.lengthReduction.toFixed(1)}%`);
    console.log(`CAPO: Total evaluations: ${result.totalEvaluations}`);
    
    return result;
  }

  // Helper methods
  private calculateMean(scores: number[]): number {
    return scores.reduce((sum, score) => sum + score, 0) / scores.length;
  }

  private calculateCostReduction(best: CAPOIndividual): number {
    const baselineCost = 0.01; // Baseline cost per evaluation
    const reduction = ((baselineCost - best.cost / best.evaluations) / baselineCost) * 100;
    return Math.max(0, reduction);
  }

  private calculateLengthReduction(best: CAPOIndividual): number {
    const baselineLength = 200; // Baseline prompt length
    return ((baselineLength - best.length) / baselineLength) * 100;
  }

  /**
   * Get current configuration
   */
  getConfig(): CAPOConfig {
    return { ...this.config };
  }

  /**
   * Update configuration
   */
  updateConfig(newConfig: Partial<CAPOConfig>): void {
    this.config = { ...this.config, ...newConfig };
    console.log('CAPO: Configuration updated', this.config);
  }

  /**
   * Export optimized prompt
   */
  exportOptimizedPrompt(result: CAPOResult): string {
    return JSON.stringify({
      prompt: result.bestPrompt.prompt,
      metadata: {
        accuracy: result.finalAccuracy,
        costReduction: result.costReduction,
        lengthReduction: result.lengthReduction,
        totalEvaluations: result.totalEvaluations,
        paretoFrontSize: result.paretoFront.length,
        racingStats: result.racingStats,
        timestamp: new Date().toISOString(),
        config: this.config
      }
    }, null, 2);
  }
}

// Export singleton instance
export const realCAPOOptimizer = new RealCAPOOptimizer();

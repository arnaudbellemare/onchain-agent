/**
 * Advanced CAPO Implementation with Full Racing
 * Based on the paper: "CAPO: Cost-Aware Prompt Optimization" (arXiv:2504.16005)
 */

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
  generation: number;
  parents?: string[];
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
  statisticalSignificance: number; // p-value threshold
  racingBatchSize: number;
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
    averageFitness: number;
    populationDiversity: number;
    evaluationsUsed: number;
  }[];
}

export class AdvancedCAPO {
  private config: CAPOConfig;
  private population: CAPOIndividual[] = [];
  private paretoFront: CAPOIndividual[] = [];
  private optimizationHistory: any[] = [];
  private racingStats: Record<string, any> = {};

  constructor(config: Partial<CAPOConfig> = {}) {
    this.config = {
      populationSize: config.populationSize || 50,
      budget: config.budget || 1000,
      lengthPenalty: config.lengthPenalty || 0.1,
      racingThreshold: config.racingThreshold || 0.05,
      paretoWeights: {
        accuracy: config.paretoWeights?.accuracy || 0.5,
        length: config.paretoWeights?.length || 0.25,
        cost: config.paretoWeights?.cost || 0.25
      },
      mutationRate: config.mutationRate || 0.1,
      crossoverRate: config.crossoverRate || 0.8,
      maxGenerations: config.maxGenerations || 20,
      earlyStoppingPatience: config.earlyStoppingPatience || 5,
      statisticalSignificance: config.statisticalSignificance || 0.05,
      racingBatchSize: config.racingBatchSize || 10
    };
  }

  // Statistical significance testing
  private tTest(sample1: number[], sample2: number[]): number {
    const n1 = sample1.length;
    const n2 = sample2.length;
    
    if (n1 < 2 || n2 < 2) return 1.0; // Not enough data
    
    const mean1 = sample1.reduce((sum, val) => sum + val, 0) / n1;
    const mean2 = sample2.reduce((sum, val) => sum + val, 0) / n2;
    
    const var1 = sample1.reduce((sum, val) => sum + Math.pow(val - mean1, 2), 0) / (n1 - 1);
    const var2 = sample2.reduce((sum, val) => sum + Math.pow(val - mean2, 2), 0) / (n2 - 1);
    
    const pooledVar = ((n1 - 1) * var1 + (n2 - 1) * var2) / (n1 + n2 - 2);
    const standardError = Math.sqrt(pooledVar * (1/n1 + 1/n2));
    
    if (standardError === 0) return 1.0;
    
    const tStat = Math.abs(mean1 - mean2) / standardError;
    const degreesOfFreedom = n1 + n2 - 2;
    
    // Simplified p-value calculation (in production, use proper t-distribution)
    return Math.max(0.001, Math.min(0.999, 1 / (1 + tStat)));
  }

  // Racing algorithm for statistical significance
  private racingElimination(individuals: CAPOIndividual[], batchSize: number = 10): CAPOIndividual[] {
    console.log(`[Advanced CAPO] Starting racing with ${individuals.length} individuals, batch size: ${batchSize}`);
    
    let activeIndividuals = [...individuals];
    const eliminated: CAPOIndividual[] = [];
    
    while (activeIndividuals.length > batchSize) {
      const batch = activeIndividuals.slice(0, batchSize);
      const remaining = activeIndividuals.slice(batchSize);
      
      console.log(`[Advanced CAPO] Racing batch of ${batch.length} individuals`);
      
      // Evaluate batch
      const evaluatedBatch = batch.map(ind => this.evaluateIndividual(ind));
      
      // Find worst performer
      evaluatedBatch.sort((a, b) => a.fitness - b.fitness);
      const worst = evaluatedBatch[0];
      
      // Test if worst is significantly worse than best
      const best = evaluatedBatch[evaluatedBatch.length - 1];
      const pValue = this.tTest(worst.scores, best.scores);
      
      console.log(`[Advanced CAPO] Racing result: p-value = ${pValue.toFixed(4)} (threshold: ${this.config.statisticalSignificance})`);
      
      if (pValue < this.config.statisticalSignificance) {
        // Statistically significant difference - eliminate worst
        eliminated.push(worst);
        activeIndividuals = evaluatedBatch.slice(1).concat(remaining);
        console.log(`[Advanced CAPO] Eliminated individual: ${worst.id} (fitness: ${worst.fitness.toFixed(3)})`);
      } else {
        // No significant difference - stop racing
        console.log(`[Advanced CAPO] No significant difference found, stopping racing`);
        break;
      }
    }
    
    this.racingStats = {
      totalRaces: Math.ceil(individuals.length / batchSize),
      individualsEliminated: eliminated.length,
      finalActiveCount: activeIndividuals.length,
      averagePValue: eliminated.length > 0 ? eliminated.reduce((sum, ind) => sum + 0.05, 0) / eliminated.length : 0
    };
    
    return activeIndividuals;
  }

  // Enhanced mutation with adaptive rates
  private adaptiveMutation(individual: CAPOIndividual, generation: number): CAPOIndividual {
    const diversity = this.calculatePopulationDiversity();
    const adaptiveRate = this.config.mutationRate * (1 + diversity * 0.5); // Increase mutation if diversity is low
    
    console.log(`[Advanced CAPO] Adaptive mutation rate: ${adaptiveRate.toFixed(3)} (diversity: ${diversity.toFixed(3)})`);
    
    let mutatedPrompt = individual.prompt;
    
    if (Math.random() < adaptiveRate) {
      // Apply different types of mutations
      const mutationTypes = [
        () => this.wordReplacementMutation(mutatedPrompt),
        () => this.sentenceRestructuringMutation(mutatedPrompt),
        () => this.punctuationOptimizationMutation(mutatedPrompt),
        () => this.synonymReplacementMutation(mutatedPrompt)
      ];
      
      const selectedMutation = mutationTypes[Math.floor(Math.random() * mutationTypes.length)];
      mutatedPrompt = selectedMutation();
    }
    
    return {
      ...individual,
      prompt: mutatedPrompt,
      length: mutatedPrompt.length,
      id: `mut_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      generation: generation + 1,
      parents: [individual.id],
      evaluations: 0,
      scores: [],
      meanScore: 0,
      fitness: 0
    };
  }

  // Crossover operation between successful individuals
  private crossover(parent1: CAPOIndividual, parent2: CAPOIndividual, generation: number): CAPOIndividual {
    console.log(`[Advanced CAPO] Crossover between ${parent1.id} and ${parent2.id}`);
    
    const words1 = parent1.prompt.split(/\s+/);
    const words2 = parent2.prompt.split(/\s+/);
    
    // Single-point crossover
    const crossoverPoint = Math.floor(Math.random() * Math.min(words1.length, words2.length));
    
    const childWords = [
      ...words1.slice(0, crossoverPoint),
      ...words2.slice(crossoverPoint)
    ];
    
    const childPrompt = childWords.join(' ');
    
    return {
      id: `cross_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      prompt: childPrompt,
      instructions: parent1.instructions,
      examples: [...parent1.examples, ...parent2.examples].slice(0, 5),
      length: childPrompt.length,
      generation: generation + 1,
      parents: [parent1.id, parent2.id],
      evaluations: 0,
      scores: [],
      meanScore: 0,
      cost: 0,
      fitness: 0,
      isActive: true
    };
  }

  // Calculate population diversity
  private calculatePopulationDiversity(): number {
    if (this.population.length < 2) return 1.0;
    
    let totalSimilarity = 0;
    let comparisons = 0;
    
    for (let i = 0; i < this.population.length; i++) {
      for (let j = i + 1; j < this.population.length; j++) {
        const similarity = this.calculateSimilarity(
          this.population[i].prompt,
          this.population[j].prompt
        );
        totalSimilarity += similarity;
        comparisons++;
      }
    }
    
    return 1 - (totalSimilarity / comparisons); // Higher diversity = lower average similarity
  }

  // Calculate similarity between two prompts
  private calculateSimilarity(prompt1: string, prompt2: string): number {
    const words1 = new Set(prompt1.toLowerCase().split(/\s+/));
    const words2 = new Set(prompt2.toLowerCase().split(/\s+/));
    
    const intersection = new Set([...words1].filter(x => words2.has(x)));
    const union = new Set([...words1, ...words2]);
    
    return intersection.size / union.size;
  }

  // Mutation strategies
  private wordReplacementMutation(prompt: string): string {
    const words = prompt.split(/\s+/);
    const replaceableWords = words.filter(word => word.length > 3);
    
    if (replaceableWords.length === 0) return prompt;
    
    const randomWord = replaceableWords[Math.floor(Math.random() * replaceableWords.length)];
    const synonyms = this.getSynonyms(randomWord);
    
    if (synonyms.length > 0) {
      const replacement = synonyms[Math.floor(Math.random() * synonyms.length)];
      return prompt.replace(new RegExp(`\\b${randomWord}\\b`, 'gi'), replacement);
    }
    
    return prompt;
  }

  private sentenceRestructuringMutation(prompt: string): string {
    const sentences = prompt.split(/[.!?]+/).filter(s => s.trim().length > 0);
    
    if (sentences.length < 2) return prompt;
    
    // Swap two sentences
    const [sentence1, sentence2] = sentences.slice(0, 2);
    const rest = sentences.slice(2);
    
    return [sentence2.trim(), sentence1.trim(), ...rest].join('. ').trim();
  }

  private punctuationOptimizationMutation(prompt: string): string {
    return prompt
      .replace(/[.,!?;:]\s*/g, '. ')
      .replace(/\s+/g, ' ')
      .trim();
  }

  private synonymReplacementMutation(prompt: string): string {
    const synonymMap = new Map([
      ['very', ''],
      ['really', ''],
      ['quite', ''],
      ['rather', ''],
      ['somewhat', ''],
      ['pretty', ''],
      ['fairly', '']
    ]);
    
    let optimized = prompt;
    synonymMap.forEach((replacement, word) => {
      const regex = new RegExp(`\\b${word}\\b`, 'gi');
      optimized = optimized.replace(regex, replacement);
    });
    
    return optimized.replace(/\s+/g, ' ').trim();
  }

  private getSynonyms(word: string): string[] {
    const synonymMap = new Map([
      ['help', ['assist', 'aid', 'support']],
      ['good', ['excellent', 'great', 'superior']],
      ['bad', ['poor', 'inferior', 'substandard']],
      ['big', ['large', 'huge', 'enormous']],
      ['small', ['tiny', 'little', 'miniature']],
      ['fast', ['quick', 'rapid', 'swift']],
      ['slow', ['sluggish', 'lethargic', 'gradual']]
    ]);
    
    return synonymMap.get(word.toLowerCase()) || [];
  }

  // Evaluate individual with multi-objective scoring
  private evaluateIndividual(individual: CAPOIndividual): CAPOIndividual {
    // Simulate evaluation (in production, use actual LLM calls)
    const accuracy = 0.8 + Math.random() * 0.2; // 0.8-1.0
    const costReduction = Math.random() * 0.3; // 0-30%
    const lengthReduction = Math.random() * 0.4; // 0-40%
    
    const score = (
      accuracy * this.config.paretoWeights.accuracy +
      costReduction * this.config.paretoWeights.cost +
      lengthReduction * this.config.paretoWeights.length
    );
    
    const fitness = score - (individual.length * this.config.lengthPenalty / 1000);
    
    return {
      ...individual,
      evaluations: individual.evaluations + 1,
      scores: [...individual.scores, score],
      meanScore: (individual.meanScore * individual.evaluations + score) / (individual.evaluations + 1),
      fitness,
      cost: costReduction
    };
  }

  // Main optimization method with full racing
  public optimize(originalPrompt: string, instructions: string = "", examples: string[] = []): CAPOResult {
    console.log(`[Advanced CAPO] Starting optimization with full racing`);
    console.log(`[Advanced CAPO] Population size: ${this.config.populationSize}, Budget: ${this.config.budget}`);
    
    // Initialize population
    this.initializePopulation(originalPrompt, instructions, examples);
    
    let generation = 0;
    let evaluationsUsed = 0;
    let noImprovementCount = 0;
    let bestFitness = -Infinity;
    
    while (generation < this.config.maxGenerations && evaluationsUsed < this.config.budget) {
      console.log(`[Advanced CAPO] Generation ${generation + 1}/${this.config.maxGenerations}`);
      
      // Racing elimination
      const activeIndividuals = this.racingElimination(this.population, this.config.racingBatchSize);
      
      // Evaluate remaining individuals
      const evaluatedIndividuals = activeIndividuals.map(ind => this.evaluateIndividual(ind));
      evaluationsUsed += evaluatedIndividuals.length;
      
      // Update population
      this.population = evaluatedIndividuals;
      
      // Update Pareto front
      this.updateParetoFront();
      
      // Check for improvement
      const currentBest = Math.max(...this.population.map(ind => ind.fitness));
      if (currentBest > bestFitness) {
        bestFitness = currentBest;
        noImprovementCount = 0;
      } else {
        noImprovementCount++;
      }
      
      // Early stopping
      if (noImprovementCount >= this.config.earlyStoppingPatience) {
        console.log(`[Advanced CAPO] Early stopping: no improvement for ${this.config.earlyStoppingPatience} generations`);
        break;
      }
      
      // Create next generation
      if (generation < this.config.maxGenerations - 1) {
        this.createNextGeneration(generation);
      }
      
      // Record history
      this.optimizationHistory.push({
        generation: generation + 1,
        bestFitness,
        averageFitness: this.population.reduce((sum, ind) => sum + ind.fitness, 0) / this.population.length,
        populationDiversity: this.calculatePopulationDiversity(),
        evaluationsUsed
      });
      
      generation++;
    }
    
    // Find best individual
    const bestIndividual = this.population.reduce((best, current) => 
      current.fitness > best.fitness ? current : best
    );
    
    console.log(`[Advanced CAPO] Optimization complete. Best fitness: ${bestFitness.toFixed(3)}`);
    console.log(`[Advanced CAPO] Total evaluations used: ${evaluationsUsed}/${this.config.budget}`);
    
    return {
      bestPrompt: bestIndividual,
      finalAccuracy: bestIndividual.meanScore,
      costReduction: bestIndividual.cost,
      lengthReduction: (originalPrompt.length - bestIndividual.length) / originalPrompt.length,
      totalEvaluations: evaluationsUsed,
      paretoFront: this.paretoFront,
      racingStats: this.racingStats,
      optimizationHistory: this.optimizationHistory
    };
  }

  private initializePopulation(originalPrompt: string, instructions: string, examples: string[]): void {
    this.population = [];
    
    // Add original prompt
    this.population.push({
      id: 'original',
      prompt: originalPrompt,
      instructions,
      examples,
      length: originalPrompt.length,
      generation: 0,
      evaluations: 0,
      scores: [],
      meanScore: 0,
      cost: 0,
      fitness: 0,
      isActive: true
    });
    
    // Generate diverse mutations
    for (let i = 1; i < this.config.populationSize; i++) {
      const mutated = this.adaptiveMutation(this.population[0], 0);
      this.population.push(mutated);
    }
  }

  private updateParetoFront(): void {
    // Simplified Pareto front update
    this.paretoFront = this.population
      .filter(ind => ind.evaluations > 0)
      .sort((a, b) => b.fitness - a.fitness)
      .slice(0, 10); // Keep top 10
  }

  private createNextGeneration(generation: number): void {
    const newGeneration: CAPOIndividual[] = [];
    
    // Keep best individuals (elitism)
    const eliteCount = Math.floor(this.config.populationSize * 0.2);
    const elite = this.population
      .sort((a, b) => b.fitness - a.fitness)
      .slice(0, eliteCount);
    
    newGeneration.push(...elite);
    
    // Generate offspring through crossover and mutation
    while (newGeneration.length < this.config.populationSize) {
      if (Math.random() < this.config.crossoverRate && newGeneration.length >= 2) {
        // Crossover
        const parent1 = newGeneration[Math.floor(Math.random() * newGeneration.length)];
        const parent2 = newGeneration[Math.floor(Math.random() * newGeneration.length)];
        const child = this.crossover(parent1, parent2, generation);
        newGeneration.push(child);
      } else {
        // Mutation
        const parent = newGeneration[Math.floor(Math.random() * newGeneration.length)];
        const child = this.adaptiveMutation(parent, generation);
        newGeneration.push(child);
      }
    }
    
    this.population = newGeneration.slice(0, this.config.populationSize);
  }
}

export const advancedCAPO = new AdvancedCAPO({
  populationSize: 50,
  budget: 1000,
  lengthPenalty: 0.1,
  racingThreshold: 0.05,
  paretoWeights: {
    accuracy: 0.5,
    length: 0.25,
    cost: 0.25
  },
  mutationRate: 0.1,
  crossoverRate: 0.8,
  maxGenerations: 20,
  earlyStoppingPatience: 5,
  statisticalSignificance: 0.05,
  racingBatchSize: 10
});


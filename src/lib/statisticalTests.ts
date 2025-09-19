/**
 * Statistical Tests for CAPO Racing Mechanism
 * Implements proper early stopping based on statistical significance
 * Based on the official CAPO paper implementation
 */

interface StatisticalTestResult {
  isSignificant: boolean;
  pValue: number;
  confidence: number;
  effectSize: number;
  recommendation: 'continue' | 'stop' | 'uncertain';
}

interface PerformanceData {
  scores: number[];
  mean: number;
  std: number;
  n: number;
}

/**
 * Statistical significance testing for racing mechanism
 * Implements t-test and effect size calculations
 */
export class StatisticalTests {
  private static readonly SIGNIFICANCE_LEVEL = 0.05;
  private static readonly MIN_SAMPLE_SIZE = 5;
  private static readonly MAX_EVALUATIONS = 20;

  /**
   * Perform Welch's t-test for unequal variances
   * More robust than standard t-test when variances differ
   */
  static welchTTest(data1: number[], data2: number[]): StatisticalTestResult {
    if (data1.length < this.MIN_SAMPLE_SIZE || data2.length < this.MIN_SAMPLE_SIZE) {
      return {
        isSignificant: false,
        pValue: 1.0,
        confidence: 0,
        effectSize: 0,
        recommendation: 'continue'
      };
    }

    const n1 = data1.length;
    const n2 = data2.length;
    const mean1 = this.mean(data1);
    const mean2 = this.mean(data2);
    const var1 = this.variance(data1, mean1);
    const var2 = this.variance(data2, mean2);

    // Welch's t-statistic
    const se = Math.sqrt(var1 / n1 + var2 / n2);
    const tStat = (mean1 - mean2) / se;

    // Degrees of freedom (Welch-Satterthwaite equation)
    const df = Math.pow(var1 / n1 + var2 / n2, 2) / 
               (Math.pow(var1 / n1, 2) / (n1 - 1) + Math.pow(var2 / n2, 2) / (n2 - 1));

    // Approximate p-value using normal approximation for large df
    const pValue = 2 * (1 - this.normalCDF(Math.abs(tStat)));

    // Cohen's d effect size
    const pooledStd = Math.sqrt(((n1 - 1) * var1 + (n2 - 1) * var2) / (n1 + n2 - 2));
    const effectSize = (mean1 - mean2) / pooledStd;

    const confidence = (1 - pValue) * 100;
    const isSignificant = pValue < this.SIGNIFICANCE_LEVEL;

    let recommendation: 'continue' | 'stop' | 'uncertain';
    if (isSignificant && Math.abs(effectSize) > 0.5) {
      recommendation = 'stop';
    } else if (isSignificant && Math.abs(effectSize) > 0.2) {
      recommendation = 'uncertain';
    } else {
      recommendation = 'continue';
    }

    return {
      isSignificant,
      pValue,
      confidence,
      effectSize: Math.abs(effectSize),
      recommendation
    };
  }

  /**
   * Sequential testing for early stopping
   * Stops evaluation if performance is significantly worse than baseline
   */
  static sequentialTest(
    currentScores: number[], 
    baselineScores: number[], 
    maxEvaluations: number = this.MAX_EVALUATIONS
  ): StatisticalTestResult {
    if (currentScores.length < this.MIN_SAMPLE_SIZE) {
      return {
        isSignificant: false,
        pValue: 1.0,
        confidence: 0,
        effectSize: 0,
        recommendation: 'continue'
      };
    }

    const test = this.welchTTest(currentScores, baselineScores);
    
    // Adjust recommendation based on sample size and max evaluations
    if (currentScores.length >= maxEvaluations) {
      test.recommendation = 'stop';
    } else if (test.recommendation === 'continue' && currentScores.length < this.MIN_SAMPLE_SIZE * 2) {
      test.recommendation = 'continue';
    }

    return test;
  }

  /**
   * Racing mechanism with statistical significance
   * Implements the core CAPO racing algorithm
   */
  static racingDecision(
    individualScores: number[],
    populationBaseline: number[],
    evaluationCount: number,
    maxEvaluations: number = this.MAX_EVALUATIONS
  ): { shouldStop: boolean; confidence: number; reason: string } {
    
    if (evaluationCount < this.MIN_SAMPLE_SIZE) {
      return {
        shouldStop: false,
        confidence: 0,
        reason: 'Insufficient evaluations for statistical significance'
      };
    }

    const test = this.sequentialTest(individualScores, populationBaseline, maxEvaluations);
    
    let shouldStop = false;
    let reason = '';

    if (test.recommendation === 'stop') {
      shouldStop = true;
      if (test.effectSize > 0.8) {
        reason = `Large effect size (${test.effectSize.toFixed(3)}) with high confidence (${test.confidence.toFixed(1)}%)`;
      } else {
        reason = `Statistical significance (p=${test.pValue.toFixed(4)}) with ${test.confidence.toFixed(1)}% confidence`;
      }
    } else if (test.recommendation === 'uncertain') {
      shouldStop = evaluationCount >= maxEvaluations * 0.8; // Stop at 80% of max evaluations if uncertain
      reason = `Uncertain significance (p=${test.pValue.toFixed(4)}), ${shouldStop ? 'stopping due to evaluation limit' : 'continuing evaluation'}`;
    } else {
      shouldStop = evaluationCount >= maxEvaluations;
      reason = shouldStop ? 'Reached maximum evaluations' : 'Continuing evaluation - no significant difference detected';
    }

    return {
      shouldStop,
      confidence: test.confidence,
      reason
    };
  }

  /**
   * Bootstrap confidence interval for performance estimates
   */
  static bootstrapConfidenceInterval(
    scores: number[], 
    confidenceLevel: number = 0.95,
    bootstrapSamples: number = 1000
  ): { lower: number; upper: number; mean: number } {
    if (scores.length < 3) {
      return { lower: Math.min(...scores), upper: Math.max(...scores), mean: this.mean(scores) };
    }

    const bootstrapMeans: number[] = [];
    
    for (let i = 0; i < bootstrapSamples; i++) {
      const sample = this.bootstrapSample(scores);
      bootstrapMeans.push(this.mean(sample));
    }

    bootstrapMeans.sort((a, b) => a - b);
    
    const alpha = 1 - confidenceLevel;
    const lowerIndex = Math.floor(alpha / 2 * bootstrapSamples);
    const upperIndex = Math.ceil((1 - alpha / 2) * bootstrapSamples);

    return {
      lower: bootstrapMeans[lowerIndex],
      upper: bootstrapMeans[upperIndex],
      mean: this.mean(scores)
    };
  }

  /**
   * Power analysis for determining minimum sample size
   */
  static powerAnalysis(
    expectedEffectSize: number,
    power: number = 0.8,
    alpha: number = this.SIGNIFICANCE_LEVEL
  ): number {
    // Simplified power analysis calculation
    const zAlpha = this.normalQuantile(1 - alpha / 2);
    const zBeta = this.normalQuantile(power);
    
    const n = Math.pow((zAlpha + zBeta) / expectedEffectSize, 2) * 2;
    return Math.ceil(n);
  }

  // Helper methods
  private static mean(data: number[]): number {
    return data.reduce((sum, val) => sum + val, 0) / data.length;
  }

  private static variance(data: number[], mean: number): number {
    const squaredDiffs = data.map(val => Math.pow(val - mean, 2));
    return this.mean(squaredDiffs);
  }

  private static bootstrapSample(data: number[]): number[] {
    const sample: number[] = [];
    for (let i = 0; i < data.length; i++) {
      const randomIndex = Math.floor(Math.random() * data.length);
      sample.push(data[randomIndex]);
    }
    return sample;
  }

  // Normal distribution approximations
  private static normalCDF(x: number): number {
    // Approximation of normal CDF using error function
    return 0.5 * (1 + this.erf(x / Math.sqrt(2)));
  }

  private static normalQuantile(p: number): number {
    // Approximation of normal quantile function
    if (p <= 0 || p >= 1) return 0;
    return Math.sqrt(2) * this.inverseErf(2 * p - 1);
  }

  private static erf(x: number): number {
    // Approximation of error function
    const a1 =  0.254829592;
    const a2 = -0.284496736;
    const a3 =  1.421413741;
    const a4 = -1.453152027;
    const a5 =  1.061405429;
    const p  =  0.3275911;

    const sign = x >= 0 ? 1 : -1;
    x = Math.abs(x);

    const t = 1.0 / (1.0 + p * x);
    const y = 1.0 - (((((a5 * t + a4) * t) + a3) * t + a2) * t + a1) * t * Math.exp(-x * x);

    return sign * y;
  }

  private static inverseErf(x: number): number {
    // Approximation of inverse error function
    const a = 0.147;
    const ln1MinusX2 = Math.log(1 - x * x);
    const term1 = Math.sqrt(Math.PI / (4 * a) + ln1MinusX2 / 2);
    const term2 = Math.sqrt(ln1MinusX2 / 2);
    
    return Math.sign(x) * (term1 - term2);
  }
}

/**
 * Racing manager for CAPO optimization
 */
export class RacingManager {
  private individualScores: Map<string, number[]> = new Map();
  private populationBaseline: number[] = [];
  private maxEvaluations: number;

  constructor(maxEvaluations: number = 20) {
    this.maxEvaluations = maxEvaluations;
  }

  /**
   * Add evaluation result for an individual
   */
  addEvaluation(individualId: string, score: number): void {
    if (!this.individualScores.has(individualId)) {
      this.individualScores.set(individualId, []);
    }
    this.individualScores.get(individualId)!.push(score);
  }

  /**
   * Update population baseline for comparison
   */
  updateBaseline(scores: number[]): void {
    this.populationBaseline = [...scores];
  }

  /**
   * Check if individual should stop evaluation
   */
  shouldStopEvaluation(individualId: string): { shouldStop: boolean; reason: string; confidence: number } {
    const scores = this.individualScores.get(individualId) || [];
    
    if (scores.length === 0) {
      return { shouldStop: false, reason: 'No evaluations yet', confidence: 0 };
    }

    const decision = StatisticalTests.racingDecision(
      scores,
      this.populationBaseline,
      scores.length,
      this.maxEvaluations
    );

    return {
      shouldStop: decision.shouldStop,
      reason: decision.reason,
      confidence: decision.confidence
    };
  }

  /**
   * Get racing statistics for all individuals
   */
  getRacingStats(): Record<string, { evaluations: number; shouldStop: boolean; reason: string; confidence: number }> {
    const stats: Record<string, any> = {};
    
    for (const [id, scores] of this.individualScores.entries()) {
      const decision = this.shouldStopEvaluation(id);
      stats[id] = {
        evaluations: scores.length,
        shouldStop: decision.shouldStop,
        reason: decision.reason,
        confidence: decision.confidence
      };
    }

    return stats;
  }

  /**
   * Reset racing state
   */
  reset(): void {
    this.individualScores.clear();
    this.populationBaseline = [];
  }
}

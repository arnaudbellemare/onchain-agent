// Enhanced PaymentRouter with Cost-Aware GEPA Optimization
import { costAwareOptimizer } from './costAwareOptimizer';
import { capoOptimizer } from './capoIntegration';
import { x402APIWrapper } from './x402APIWrapper';

interface PaymentRequest {
  amount: number;
  currency: string;
  urgency: 'low' | 'medium' | 'high';
  type: 'vendor_payment' | 'payroll' | 'invoice' | 'refund' | 'subscription';
  recipient: string;
  metadata?: Record<string, unknown>;
}

interface PaymentRail {
  id: string;
  name: string;
  estimatedCost: number;
  estimatedTime: string;
  reliability: number;
  maxAmount: number;
  minAmount: number;
  supportedCurrencies: string[];
  x402Supported: boolean;
}

interface PaymentDecision {
  selectedRail: PaymentRail;
  reasoning: string;
  confidence: number;
  costBreakdown: {
    railFee: number;
    networkFee: number;
    totalCost: number;
    costInUSD: number;
  };
  optimizationMetrics: {
    tokensUsed: number;
    inferenceTime: number;
    optimizationCost: number;
    totalRequestCost: number;
  };
  transactionHash?: string;
}

interface OptimizationConfig {
  useGEPA: boolean;
  useCAPO: boolean;
  optimizationBudget: number;
  accuracyThreshold: number;
  costThreshold: number;
  autoOptimize: boolean;
}

export class EnhancedPaymentRouter {
  private availableRails: PaymentRail[] = [];
  private optimizationConfig: OptimizationConfig;
  private optimizationHistory: PaymentDecision[] = [];
  private evolvedPrompts: Map<string, string> = new Map();

  constructor(config: Partial<OptimizationConfig> = {}) {
    this.optimizationConfig = {
      useGEPA: true,
      useCAPO: true,
      optimizationBudget: 100,
      accuracyThreshold: 0.8,
      costThreshold: 0.01,
      autoOptimize: true,
      ...config
    };

    this.initializePaymentRails();
    this.loadEvolvedPrompts();
  }

  // Initialize available payment rails
  private initializePaymentRails(): void {
    this.availableRails = [
      {
        id: 'usdc_base',
        name: 'USDC on Base',
        estimatedCost: 0.001,
        estimatedTime: '1-2 minutes',
        reliability: 0.98,
        maxAmount: 100000,
        minAmount: 1,
        supportedCurrencies: ['USD', 'USDC'],
        x402Supported: true
      },
      {
        id: 'ach',
        name: 'ACH Transfer',
        estimatedCost: 0.25,
        estimatedTime: '1-3 business days',
        reliability: 0.95,
        maxAmount: 1000000,
        minAmount: 1,
        supportedCurrencies: ['USD'],
        x402Supported: false
      },
      {
        id: 'wire',
        name: 'Wire Transfer',
        estimatedCost: 15,
        estimatedTime: 'Same day',
        reliability: 0.99,
        maxAmount: 5000000,
        minAmount: 1000,
        supportedCurrencies: ['USD'],
        x402Supported: false
      },
      {
        id: 'credit_card',
        name: 'Credit Card',
        estimatedCost: 0.029,
        estimatedTime: 'Immediate',
        reliability: 0.97,
        maxAmount: 10000,
        minAmount: 1,
        supportedCurrencies: ['USD'],
        x402Supported: false
      }
    ];
  }

  // Load evolved prompts from optimization
  private async loadEvolvedPrompts(): Promise<void> {
    try {
      // In production, load from persistent storage
      // For now, use default optimized prompts
      this.evolvedPrompts.set('default', 'Select optimal payment rail based on amount, urgency, and cost efficiency.');
      this.evolvedPrompts.set('small_amount', 'For amounts <$100, prefer USDC on Base for lowest cost.');
      this.evolvedPrompts.set('urgent', 'For urgent payments >$1000, use wire transfer for speed.');
      this.evolvedPrompts.set('bulk', 'For bulk payments, use ACH for cost efficiency.');
    } catch (error) {
      console.error('Failed to load evolved prompts:', error);
    }
  }

  // Main routing function with cost-aware optimization
  async routePayment(request: PaymentRequest): Promise<PaymentDecision> {
    const startTime = Date.now();
    
    try {
      // Step 1: Select appropriate evolved prompt
      const prompt = this.selectEvolvedPrompt(request);
      
      // Step 2: Generate payment decision using optimized prompt
      const decision = await this.generatePaymentDecision(prompt, request);
      
      // Step 3: Calculate optimization metrics
      const optimizationMetrics = this.calculateOptimizationMetrics(prompt, startTime);
      
      // Step 4: Execute payment if confidence is high enough
      if (decision.confidence >= this.optimizationConfig.accuracyThreshold) {
        const transactionHash = await this.executePayment(decision, request);
        decision.transactionHash = transactionHash;
      }
      
      // Step 5: Track metrics for continuous optimization
      decision.optimizationMetrics = optimizationMetrics;
      this.optimizationHistory.push(decision);
      
      // Step 6: Trigger auto-optimization if enabled
      if (this.optimizationConfig.autoOptimize) {
        this.triggerAutoOptimization(request, decision);
      }
      
      return decision;
      
    } catch (error) {
      console.error('Payment routing failed:', error);
      throw new Error(`Payment routing failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // Select appropriate evolved prompt based on request characteristics
  private selectEvolvedPrompt(request: PaymentRequest): string {
    const promptKey = this.determinePromptKey(request);
    return this.evolvedPrompts.get(promptKey) || this.evolvedPrompts.get('default') || 'Select optimal payment rail.';
  }

  // Determine prompt key based on request characteristics
  private determinePromptKey(request: PaymentRequest): string {
    if (request.amount < 100) return 'small_amount';
    if (request.urgency === 'high') return 'urgent';
    if (request.type === 'payroll' || request.type === 'subscription') return 'bulk';
    return 'default';
  }

  // Generate payment decision using evolved prompt
  private async generatePaymentDecision(prompt: string, request: PaymentRequest): Promise<PaymentDecision> {
    // Filter available rails based on request constraints
    const suitableRails = this.availableRails.filter(rail => 
      rail.supportedCurrencies.includes(request.currency) &&
      request.amount >= rail.minAmount &&
      request.amount <= rail.maxAmount
    );

    if (suitableRails.length === 0) {
      throw new Error('No suitable payment rails available for this request');
    }

    // Use evolved prompt logic to select rail
    const selectedRail = this.applyEvolvedPrompt(prompt, suitableRails, request);
    
    // Calculate cost breakdown
    const costBreakdown = this.calculateCostBreakdown(selectedRail, request);
    
    // Generate reasoning
    const reasoning = this.generateReasoning(selectedRail, request, prompt);
    
    // Calculate confidence based on rail characteristics and prompt optimization
    const confidence = this.calculateConfidence(selectedRail, request, prompt);

    return {
      selectedRail,
      reasoning,
      confidence,
      costBreakdown,
      optimizationMetrics: {
        tokensUsed: 0,
        inferenceTime: 0,
        optimizationCost: 0,
        totalRequestCost: 0
      }
    };
  }

  // Apply evolved prompt logic to select rail
  private applyEvolvedPrompt(prompt: string, rails: PaymentRail[], request: PaymentRequest): PaymentRail {
    // Simplified logic based on prompt optimization
    // In production, this would use the actual LLM with the evolved prompt
    
    if (!rails || rails.length === 0) {
      throw new Error('No payment rails available');
    }
    
    let selectedRail: PaymentRail;
    
    if (prompt.includes('USDC') && prompt.includes('Base')) {
      selectedRail = rails.find(rail => rail.id === 'usdc_base') || rails[0];
    } else if (prompt.includes('urgent') || prompt.includes('wire')) {
      selectedRail = rails.find(rail => rail.id === 'wire') || rails[0];
    } else if (prompt.includes('bulk') || prompt.includes('ACH')) {
      selectedRail = rails.find(rail => rail.id === 'ach') || rails[0];
    } else {
      // Default to cost-optimal selection
      selectedRail = rails.reduce((best, current) => 
        current.estimatedCost < best.estimatedCost ? current : best
      );
    }
    
    if (!selectedRail) {
      selectedRail = rails[0]; // Fallback to first available rail
    }
    
    return selectedRail;
  }

  // Calculate cost breakdown
  private calculateCostBreakdown(rail: PaymentRail, request: PaymentRequest): PaymentDecision['costBreakdown'] {
    const railFee = rail.estimatedCost;
    const networkFee = rail.x402Supported ? 0.001 : 0; // x402 micropayment fee
    const totalCost = railFee + networkFee;
    const costInUSD = totalCost; // Assuming USD for simplicity

    return {
      railFee,
      networkFee,
      totalCost,
      costInUSD
    };
  }

  // Generate reasoning for decision
  private generateReasoning(rail: PaymentRail, request: PaymentRequest, prompt: string): string {
    const reasons = [];
    
    if (rail.x402Supported && request.amount < 1000) {
      reasons.push('Selected for cost efficiency and x402 micropayment support');
    }
    
    if (request.urgency === 'high' && rail.estimatedTime.includes('Same day')) {
      reasons.push('Chosen for speed and urgency requirements');
    }
    
    if (rail.estimatedCost < 1 && request.amount < 100) {
      reasons.push('Optimal for small amount transactions');
    }
    
    reasons.push(`Based on evolved prompt: "${prompt.substring(0, 50)}..."`);
    
    return reasons.join('. ');
  }

  // Calculate confidence score
  private calculateConfidence(rail: PaymentRail, request: PaymentRequest, prompt: string): number {
    let confidence = 0.7; // Base confidence
    
    // Boost confidence for well-suited rails
    if (rail.x402Supported && request.amount < 1000) confidence += 0.1;
    if (request.urgency === 'high' && rail.estimatedTime.includes('Same day')) confidence += 0.1;
    if (rail.reliability > 0.97) confidence += 0.05;
    
    // Boost confidence for optimized prompts
    if (prompt.length < 100) confidence += 0.05; // Concise prompts
    if (prompt.includes('cost') || prompt.includes('optimal')) confidence += 0.05;
    
    return Math.min(1, confidence);
  }

  // Calculate optimization metrics
  private calculateOptimizationMetrics(prompt: string, startTime: number): PaymentDecision['optimizationMetrics'] {
    const tokensUsed = Math.ceil(prompt.length / 4); // Rough token estimation
    const inferenceTime = (Date.now() - startTime) / 1000;
    
    // Calculate costs using real pricing
    const costMetrics = costAwareOptimizer.calculateCostMetrics(tokensUsed, tokensUsed * 0.3, inferenceTime);
    
    return {
      tokensUsed,
      inferenceTime,
      optimizationCost: costMetrics.totalCostUSD,
      totalRequestCost: costMetrics.totalCostUSD
    };
  }

  // Execute payment through x402 system
  private async executePayment(decision: PaymentDecision, request: PaymentRequest): Promise<string> {
    try {
      if (decision.selectedRail.x402Supported) {
        // Use x402 micropayment system - simulate payment execution
        // In a real implementation, this would interact with the blockchain
        console.log(`Executing x402 payment: ${request.amount} ${request.currency} to ${request.recipient}`);
        
        // Simulate payment processing time
        await new Promise(resolve => setTimeout(resolve, 100));
        
        // Generate mock transaction hash for x402 payments
        const transactionHash = `0x${Math.random().toString(16).substr(2, 64)}`;
        console.log(`x402 payment executed successfully: ${transactionHash}`);
        
        return transactionHash;
      } else {
        // Use traditional payment system
        console.log(`Executing traditional payment: ${request.amount} ${request.currency} to ${request.recipient}`);
        return 'traditional-payment-reference';
      }
    } catch (error) {
      console.error('Payment execution failed:', error);
      throw new Error('Payment execution failed');
    }
  }

  // Trigger auto-optimization
  private async triggerAutoOptimization(request: PaymentRequest, decision: PaymentDecision): Promise<void> {
    // Only optimize if we have enough history or if cost is high
    if (this.optimizationHistory.length % 50 === 0 || decision.costBreakdown.totalCost > this.optimizationConfig.costThreshold) {
      console.log('Triggering auto-optimization...');
      
      try {
        if (this.optimizationConfig.useCAPO) {
          await this.runCAPOOptimization(request, decision);
        }
        
        if (this.optimizationConfig.useGEPA) {
          await this.runGEPAOptimization(request, decision);
        }
      } catch (error) {
        console.error('Auto-optimization failed:', error);
      }
    }
  }

  // Run CAPO optimization
  private async runCAPOOptimization(request: PaymentRequest, _decision: PaymentDecision): Promise<void> {
    const taskDescription = `Select optimal payment rail for ${request.type} of ${request.currency} ${request.amount}`;
    const testCases = [request];
    
    const result = await capoOptimizer.optimize(taskDescription, testCases);
    
    // Update evolved prompts with CAPO results
    const promptKey = this.determinePromptKey(request);
    this.evolvedPrompts.set(`${promptKey}_capo`, result.bestPrompt);
    
    console.log(`CAPO optimization completed: ${result.costReduction.toFixed(1)}% cost reduction`);
  }

  // Run GEPA optimization
  private async runGEPAOptimization(request: PaymentRequest, _decision: PaymentDecision): Promise<void> {
    const testCases = [request];
    
    const result = await costAwareOptimizer.optimize(this.optimizationConfig.optimizationBudget);
    
    // Update evolved prompts with GEPA results
    const promptKey = this.determinePromptKey(request);
    this.evolvedPrompts.set(`${promptKey}_gepa`, result.evolvedPrompt);
    
    console.log(`GEPA optimization completed: ${result.costReduction.toFixed(1)}% cost reduction`);
  }

  // Get optimization statistics
  getOptimizationStats(): {
    totalDecisions: number;
    averageConfidence: number;
    averageCost: number;
    costSavings: number;
    optimizationHistory: PaymentDecision[];
  } {
    const totalDecisions = this.optimizationHistory.length;
    const averageConfidence = totalDecisions > 0 
      ? this.optimizationHistory.reduce((sum, d) => sum + d.confidence, 0) / totalDecisions 
      : 0;
    const averageCost = totalDecisions > 0
      ? this.optimizationHistory.reduce((sum, d) => sum + d.costBreakdown.totalCost, 0) / totalDecisions
      : 0;
    
    // Calculate cost savings vs baseline
    const baselineCost = 0.02; // Assume baseline cost per transaction
    const costSavings = totalDecisions > 0
      ? ((baselineCost - averageCost) / baselineCost) * 100
      : 0;

    return {
      totalDecisions,
      averageConfidence,
      averageCost,
      costSavings,
      optimizationHistory: [...this.optimizationHistory]
    };
  }

  // Update optimization configuration
  updateOptimizationConfig(config: Partial<OptimizationConfig>): void {
    this.optimizationConfig = { ...this.optimizationConfig, ...config };
    console.log('Optimization configuration updated:', this.optimizationConfig);
  }

  // Get evolved prompts
  getEvolvedPrompts(): Map<string, string> {
    return new Map(this.evolvedPrompts);
  }

  // Export optimization results
  exportOptimizationResults(): string {
    const stats = this.getOptimizationStats();
    return JSON.stringify({
      statistics: stats,
      configuration: this.optimizationConfig,
      evolvedPrompts: Object.fromEntries(this.evolvedPrompts),
      timestamp: new Date().toISOString()
    }, null, 2);
  }
}

// Export singleton instance
export const enhancedPaymentRouter = new EnhancedPaymentRouter();

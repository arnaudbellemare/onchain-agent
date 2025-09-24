/**
 * x402 SDK Integration for AI Micropayments
 * Based on coinbase/x402 and samthedataman/x402-sdk
 * Enables per-token billing and micropayments for AI agents
 */

interface X402Config {
  baseUrl: string;
  chainId: number;
  currency: string;
  privateKey: string;
  provider: string;
}

interface X402Payment {
  amount: string;
  currency: string;
  recipient: string;
  requestId: string;
  metadata?: Record<string, unknown>;
}

interface X402Response {
  paymentRequired: boolean;
  paymentUrl?: string;
  amount?: string;
  currency?: string;
  expiresAt?: number;
  signature?: string;
}

interface X402Receipt {
  transactionHash: string;
  amount: string;
  currency: string;
  timestamp: number;
  gasUsed: number;
  gasPrice: string;
}

interface AIUsageMetrics {
  tokens_in: number;
  tokens_out: number;
  inference_seconds: number;
  model: string;
  cost_usd: number;
  request_id: string;
}

/**
 * x402 SDK for AI Micropayments
 * Implements HTTP/402 protocol for per-token billing
 */
export class X402SDK {
  private config: X402Config;
  private costCalculator: (metrics: AIUsageMetrics) => number;

  constructor(config: X402Config, costCalculator?: (metrics: AIUsageMetrics) => number) {
    this.config = config;
    this.costCalculator = costCalculator || this.defaultCostCalculator;
  }

  /**
   * Default cost calculator based on Perplexity pricing
   */
  private defaultCostCalculator(metrics: AIUsageMetrics): number {
    const PERPLEXITY_INPUT_RATE = 1.0 / 1_000_000;  // $1/1M tokens
    const PERPLEXITY_OUTPUT_RATE = 1.0 / 1_000_000;
    const PERPLEXITY_REQUEST_FEE = 0.005;
    const GPU_RATE_PER_SEC = 0.0018; // H100 average

    const inputCost = metrics.tokens_in * PERPLEXITY_INPUT_RATE;
    const outputCost = metrics.tokens_out * PERPLEXITY_OUTPUT_RATE;
    const gpuCost = metrics.inference_seconds * GPU_RATE_PER_SEC;
    
    return inputCost + outputCost + PERPLEXITY_REQUEST_FEE + gpuCost;
  }

  /**
   * Make AI API call with x402 micropayment
   */
  async makeAICall(
    endpoint: string, 
    payload: Record<string, unknown>, 
    usageMetrics: AIUsageMetrics
  ): Promise<Record<string, unknown>> {
    try {
      // Calculate cost for this specific request
      const costUSD = this.costCalculator(usageMetrics);
      
      // Convert USD to USDC (assuming 1:1 for simplicity)
      const amountUSDC = Math.round(costUSD * 1_000_000); // 6 decimal places
      
      // Create x402 payment
      const payment: X402Payment = {
        amount: amountUSDC.toString(),
        currency: 'USDC',
        recipient: this.config.baseUrl,
        requestId: usageMetrics.request_id,
        metadata: {
          model: usageMetrics.model,
          tokens_in: usageMetrics.tokens_in,
          tokens_out: usageMetrics.tokens_out,
          inference_seconds: usageMetrics.inference_seconds,
          cost_usd: costUSD
        }
      };

      // Make API call with x402 headers
      const headers = await this.createX402Headers(payment);
      
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...headers
        },
        body: JSON.stringify(payload)
      });

      // Handle x402 Payment Required response
      if (response.status === 402) {
        const x402Response = await response.json() as X402Response;
        return await this.handlePaymentRequired(x402Response, payment);
      }

      // Handle successful response
      if (response.ok) {
        const result = await response.json();
        
        // Log successful payment
        await this.logPayment({
          amount: payment.amount,
          currency: payment.currency,
          transactionHash: 'pending',
          timestamp: Date.now(),
          gasUsed: 0,
          gasPrice: '0'
        });

        return result;
      }

      throw new Error(`API call failed: ${response.status} ${response.statusText}`);
      
    } catch (error) {
      console.error('x402 AI call failed:', error);
      throw error;
    }
  }

  /**
   * Create x402 payment headers
   */
  private async createX402Headers(payment: X402Payment): Promise<Record<string, string>> {
    const signature = await this.signPayment(payment);
    
    return {
      'X-402-Amount': payment.amount,
      'X-402-Currency': payment.currency,
      'X-402-Recipient': payment.recipient,
      'X-402-Request-ID': payment.requestId,
      'X-402-Signature': signature,
      'X-402-Metadata': JSON.stringify(payment.metadata)
    };
  }

  /**
   * Sign payment for x402 protocol
   */
  private async signPayment(payment: X402Payment): Promise<string> {
    // In production, this would use proper cryptographic signing
    // For demo purposes, create a deterministic signature
    const message = `${payment.amount}${payment.currency}${payment.recipient}${payment.requestId}`;
    const encoder = new TextEncoder();
    const data = encoder.encode(message);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    
    return `0x${hashHex}`;
  }

  /**
   * Handle x402 Payment Required response
   */
  private async handlePaymentRequired(
    x402Response: X402Response, 
    payment: X402Payment
  ): Promise<any> {
    console.log('Payment required:', x402Response);
    
    // Execute payment on Base network
    const receipt = await this.executePayment(payment);
    
    // Retry API call with payment proof
    return await this.retryWithPaymentProof(payment, receipt);
  }

  /**
   * Execute payment on Base network
   */
  private async executePayment(payment: X402Payment): Promise<X402Receipt> {
    // In production, this would interact with Base network
    // For demo purposes, simulate payment execution
    
    const gasUsed = 21000; // Standard ETH transfer gas
    const gasPrice = '0.00000002'; // 20 gwei
    
    // Simulate blockchain transaction
    const transactionHash = `0x${Math.random().toString(16).substr(2, 64)}`;
    
    const receipt: X402Receipt = {
      transactionHash,
      amount: payment.amount,
      currency: payment.currency,
      timestamp: Date.now(),
      gasUsed,
      gasPrice
    };

    console.log(`Payment executed: ${payment.amount} ${payment.currency} to ${payment.recipient}`);
    console.log(`Transaction hash: ${transactionHash}`);
    
    return receipt;
  }

  /**
   * Retry API call with payment proof
   */
  private async retryWithPaymentProof(
    payment: X402Payment, 
    receipt: X402Receipt
  ): Promise<Record<string, unknown>> {
    // Headers for payment proof (currently unused but available for future use)
    // const headers = {
    //   'X-402-Payment-Proof': receipt.transactionHash,
    //   'X-402-Amount': payment.amount,
    //   'X-402-Currency': payment.currency,
    //   'X-402-Recipient': payment.recipient
    // };

    // In production, retry the original API call with payment proof
    // For demo, return success response
    return {
      success: true,
      payment_receipt: receipt,
      message: 'Payment verified, request processed'
    };
  }

  /**
   * Log payment for audit trail
   */
  private async logPayment(receipt: X402Receipt): Promise<void> {
    console.log('Payment logged:', receipt);
    
    // In production, store in database or audit system
    // For demo, just log to console
  }

  /**
   * Batch process multiple AI requests with x402
   */
  async batchAICalls(
    requests: Array<{
      endpoint: string;
      payload: Record<string, unknown>;
      usageMetrics: AIUsageMetrics;
    }>
  ): Promise<Record<string, unknown>[]> {
    const results = [];
    let totalCost = 0;

    for (const request of requests) {
      try {
        const result = await this.makeAICall(
          request.endpoint,
          request.payload,
          request.usageMetrics
        );
        
        results.push(result);
        totalCost += this.costCalculator(request.usageMetrics);
        
      } catch (error) {
        console.error(`Batch request failed:`, error);
        results.push({ error: error instanceof Error ? error.message : 'Unknown error' });
      }
    }

    console.log(`Batch processing completed. Total cost: $${totalCost.toFixed(6)}`);
    return results;
  }

  /**
   * Calculate cost for usage metrics
   */
  calculateCost(usageMetrics: AIUsageMetrics): number {
    return this.costCalculator(usageMetrics);
  }

  /**
   * Get payment history
   */
  async getPaymentHistory(_limit: number = 100): Promise<X402Receipt[]> {
    // In production, fetch from database
    // For demo, return empty array
    return [];
  }

  /**
   * Validate x402 response
   */
  validateX402Response(response: Record<string, unknown>): boolean {
    return response && 
           typeof response.paymentRequired === 'boolean' &&
           (response.paymentRequired ? 
             (response.paymentUrl && response.amount && response.currency) : 
             true);
  }
}

/**
 * AgentKit Integration for x402
 * Enables seamless integration with AgentKit middleware
 */
export class AgentKitX402Integration {
  private x402SDK: X402SDK;
  private evolvedConfigs: Map<string, any> = new Map();

  constructor(x402SDK: X402SDK) {
    this.x402SDK = x402SDK;
  }

  /**
   * Deploy evolved GEPA configuration to AgentKit
   */
  deployEvolvedConfig(configId: string, config: Record<string, unknown>): void {
    this.evolvedConfigs.set(configId, {
      ...config,
      deployed_at: Date.now(),
      version: '1.0.0'
    });
    
    console.log(`Evolved config deployed: ${configId}`);
  }

  /**
   * Get evolved configuration for AgentKit
   */
  getEvolvedConfig(configId: string): Record<string, unknown> | undefined {
    return this.evolvedConfigs.get(configId);
  }

  /**
   * Route payment using evolved prompt
   */
  async routePaymentWithEvolvedPrompt(
    configId: string,
    paymentRequest: Record<string, unknown>
  ): Promise<Record<string, unknown>> {
    const config = this.getEvolvedConfig(configId);
    if (!config) {
      throw new Error(`Evolved config not found: ${configId}`);
    }

    // Use evolved prompt for routing
    const evolvedPrompt = config.evolved_prompt;
    
    // Create usage metrics for x402 billing
    const usageMetrics: AIUsageMetrics = {
      tokens_in: Math.ceil(evolvedPrompt.length / 4),
      tokens_out: 50, // Estimated response tokens
      inference_seconds: 0.5,
      model: 'sonar-medium-online',
      cost_usd: 0,
      request_id: `payment_${Date.now()}`
    };

    // Calculate cost
    usageMetrics.cost_usd = this.x402SDK.calculateCost(usageMetrics);

    // Make AI call with x402 micropayment
    const result = await this.x402SDK.makeAICall(
      '/api/payment-routing',
      {
        prompt: evolvedPrompt,
        request: paymentRequest
      },
      usageMetrics
    );

    return {
      ...result,
      evolved_config_used: configId,
      cost_usd: usageMetrics.cost_usd,
      prompt_used: evolvedPrompt
    };
  }

  /**
   * Get all deployed configurations
   */
  getAllConfigs(): Array<{ id: string; config: Record<string, unknown> }> {
    return Array.from(this.evolvedConfigs.entries()).map(([id, config]) => ({
      id,
      config
    }));
  }
}

// Export for use in API routes
export type { X402Config, X402Payment, X402Response, AIUsageMetrics };

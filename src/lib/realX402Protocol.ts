/**
 * Real x402 Protocol Implementation
 * Based on coinbase/x402 specification
 * Handles actual HTTP 402 responses and USDC micropayments
 */

import { createPublicClient, createWalletClient, http, parseUnits, encodeFunctionData } from 'viem';
import { base, baseSepolia } from 'viem/chains';
import { privateKeyToAccount } from 'viem/accounts';

// USDC contract address on Base
const USDC_CONTRACT_ADDRESS = '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913'; // Base mainnet
const USDC_CONTRACT_ADDRESS_TESTNET = '0x036CbD53842c5426634e7929541eC2318f3dCF7e'; // Base Sepolia

// ERC20 ABI for USDC transfers
const ERC20_ABI = [
  {
    name: 'transfer',
    type: 'function',
    stateMutability: 'nonpayable',
    inputs: [
      { name: 'to', type: 'address' },
      { name: 'amount', type: 'uint256' }
    ],
    outputs: [{ name: '', type: 'bool' }]
  },
  {
    name: 'balanceOf',
    type: 'function',
    stateMutability: 'view',
    inputs: [{ name: 'account', type: 'address' }],
    outputs: [{ name: '', type: 'uint256' }]
  },
  {
    name: 'decimals',
    type: 'function',
    stateMutability: 'view',
    inputs: [],
    outputs: [{ name: '', type: 'uint8' }]
  }
] as const;

interface X402PaymentRequest {
  amount: string;
  currency: string;
  recipient: string;
  requestId: string;
  metadata?: Record<string, unknown>;
}

interface X402PaymentResponse {
  success: boolean;
  transactionHash?: string;
  error?: string;
  gasUsed?: number;
  gasPrice?: string;
}

interface X402APIResponse {
  status: number;
  headers: Record<string, string>;
  body: {
    payment_required: boolean;
    amount: string;
    currency: string;
    recipient: string;
    request_id: string;
    expires_at?: number;
  };
}

export class RealX402Protocol {
  private publicClient: any;
  private walletClient: any;
  private account: any;
  private isTestnet: boolean;
  private usdcAddress: string;

  constructor(privateKey: string, testnet: boolean = true) {
    this.isTestnet = testnet;
    this.usdcAddress = testnet ? USDC_CONTRACT_ADDRESS_TESTNET : USDC_CONTRACT_ADDRESS;
    
    // Create account from private key
    this.account = privateKeyToAccount(privateKey as `0x${string}`);
    
    // Create clients
    const chain = testnet ? baseSepolia : base;
    const rpcUrl = testnet ? 'https://sepolia.base.org' : 'https://mainnet.base.org';
    
    this.publicClient = createPublicClient({
      chain,
      transport: http(rpcUrl)
    });
    
    this.walletClient = createWalletClient({
      account: this.account,
      chain,
      transport: http(rpcUrl)
    });
  }

  /**
   * Make API call with x402 protocol support
   */
  async makeAPICall(
    endpoint: string, 
    payload: any, 
    options: {
      method?: string;
      headers?: Record<string, string>;
      maxCost?: number;
    } = {}
  ): Promise<any> {
    const { method = 'POST', headers = {}, maxCost = 1.0 } = options;
    
    try {
      // Step 1: Make initial API request
      const response = await fetch(endpoint, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'User-Agent': 'x402-client/1.0',
          ...headers
        },
        body: method !== 'GET' ? JSON.stringify(payload) : undefined
      });

      // Step 2: Check for 402 Payment Required
      if (response.status === 402) {
        console.log('🔗 Received 402 Payment Required response');
        
        const x402Data = await response.json() as X402APIResponse['body'];
        
        // Validate payment request
        if (!this.validatePaymentRequest(x402Data)) {
          throw new Error('Invalid x402 payment request');
        }

        // Check if cost is within limits
        const costUSD = parseFloat(x402Data.amount);
        if (costUSD > maxCost) {
          throw new Error(`Cost $${costUSD} exceeds maximum cost $${maxCost}`);
        }

        // Step 3: Execute USDC payment
        const paymentResult = await this.executeUSDCTransfer({
          amount: x402Data.amount,
          currency: x402Data.currency,
          recipient: x402Data.recipient,
          requestId: x402Data.request_id,
          metadata: { endpoint, originalPayload: payload }
        });

        if (!paymentResult.success) {
          throw new Error(`Payment failed: ${paymentResult.error}`);
        }

        // Step 4: Retry API call with payment proof
        return await this.retryWithPaymentProof(
          endpoint, 
          payload, 
          x402Data.request_id, 
          paymentResult.transactionHash!,
          { method, headers }
        );
      }

      // Step 5: Handle successful response
      if (response.ok) {
        return await response.json();
      }

      throw new Error(`API call failed: ${response.status} ${response.statusText}`);
      
    } catch (error) {
      console.error('x402 API call failed:', error);
      throw error;
    }
  }

  /**
   * Execute USDC transfer on Base network
   */
  private async executeUSDCTransfer(payment: X402PaymentRequest): Promise<X402PaymentResponse> {
    try {
      console.log(`💳 Executing USDC transfer: ${payment.amount} to ${payment.recipient}`);
      
      // Check balance
      const balance = await this.publicClient.readContract({
        address: this.usdcAddress,
        abi: ERC20_ABI,
        functionName: 'balanceOf',
        args: [this.account.address]
      });

      const requiredAmount = parseUnits(payment.amount, 6); // USDC has 6 decimals
      
      if (balance < requiredAmount) {
        return {
          success: false,
          error: `Insufficient USDC balance. Required: ${payment.amount}, Available: ${(Number(balance) / 1e6).toFixed(6)}`
        };
      }

      // Execute transfer
      const hash = await this.walletClient.writeContract({
        address: this.usdcAddress,
        abi: ERC20_ABI,
        functionName: 'transfer',
        args: [payment.recipient as `0x${string}`, requiredAmount]
      });

      // Wait for transaction confirmation
      const receipt = await this.publicClient.waitForTransactionReceipt({ hash });
      
      console.log(`✅ USDC transfer successful: ${hash}`);
      console.log(`Gas used: ${receipt.gasUsed}, Gas price: ${receipt.effectiveGasPrice}`);

      return {
        success: true,
        transactionHash: hash,
        gasUsed: Number(receipt.gasUsed),
        gasPrice: receipt.effectiveGasPrice?.toString()
      };

    } catch (error) {
      console.error('USDC transfer failed:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Retry API call with payment proof
   */
  private async retryWithPaymentProof(
    endpoint: string,
    payload: any,
    requestId: string,
    transactionHash: string,
    options: { method: string; headers: Record<string, string> }
  ): Promise<any> {
    try {
      console.log(`🔄 Retrying API call with payment proof: ${transactionHash}`);
      
      // Add payment proof headers
      const headers = {
        ...options.headers,
        'X-Payment-Proof': transactionHash,
        'X-Request-ID': requestId,
        'X-Payment-Status': 'completed'
      };

      const response = await fetch(endpoint, {
        method: options.method,
        headers,
        body: options.method !== 'GET' ? JSON.stringify(payload) : undefined
      });

      if (response.ok) {
        const result = await response.json();
        console.log(`✅ API call successful after payment`);
        return result;
      }

      throw new Error(`API call failed after payment: ${response.status} ${response.statusText}`);
      
    } catch (error) {
      console.error('Retry with payment proof failed:', error);
      throw error;
    }
  }

  /**
   * Validate x402 payment request
   */
  private validatePaymentRequest(data: any): boolean {
    return (
      data.payment_required === true &&
      typeof data.amount === 'string' &&
      typeof data.currency === 'string' &&
      typeof data.recipient === 'string' &&
      typeof data.request_id === 'string' &&
      parseFloat(data.amount) > 0
    );
  }

  /**
   * Get USDC balance
   */
  async getUSDCBalance(): Promise<string> {
    try {
      const balance = await this.publicClient.readContract({
        address: this.usdcAddress,
        abi: ERC20_ABI,
        functionName: 'balanceOf',
        args: [this.account.address]
      });

      return (Number(balance) / 1e6).toFixed(6);
    } catch (error) {
      console.error('Failed to get USDC balance:', error);
      return '0.000000';
    }
  }

  /**
   * Get wallet address
   */
  getWalletAddress(): string {
    return this.account.address;
  }

  /**
   * Get network info
   */
  getNetworkInfo(): { chainId: number; name: string; testnet: boolean } {
    return {
      chainId: this.isTestnet ? baseSepolia.id : base.id,
      name: this.isTestnet ? 'Base Sepolia' : 'Base',
      testnet: this.isTestnet
    };
  }
}

/**
 * x402 API Provider Interface
 * For APIs that want to implement x402 protocol
 */
export class X402APIProvider {
  private pendingPayments: Map<string, X402PaymentRequest> = new Map();

  /**
   * Handle API request with x402 protocol
   */
  async handleRequest(
    endpoint: string,
    payload: any,
    options: {
      costPerCall: number;
      currency?: string;
      recipient?: string;
    }
  ): Promise<Response> {
    const { costPerCall, currency = 'USDC', recipient = '0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6' } = options;
    
    // Check for payment proof
    const paymentProof = this.getPaymentProof();
    
    if (paymentProof) {
      // Verify payment proof
      const isValid = await this.verifyPaymentProof(paymentProof, costPerCall);
      
      if (isValid) {
        // Process the actual API call
        return await this.processAPICall(endpoint, payload);
      }
    }

    // Return 402 Payment Required
    const requestId = `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const x402Response = {
      payment_required: true,
      amount: costPerCall.toFixed(6),
      currency,
      recipient,
      request_id: requestId,
      expires_at: Date.now() + 300000 // 5 minutes
    };

    return new Response(JSON.stringify(x402Response), {
      status: 402,
      headers: {
        'Content-Type': 'application/json',
        'X-Payment-Required': 'true',
        'X-Request-ID': requestId
      }
    });
  }

  /**
   * Extract payment proof from request headers
   */
  private getPaymentProof(): string | null {
    // This would extract from actual HTTP headers in a real implementation
    // For now, we'll simulate it
    return null;
  }

  /**
   * Verify payment proof on blockchain
   */
  private async verifyPaymentProof(transactionHash: string, expectedAmount: number): Promise<boolean> {
    try {
      // In a real implementation, this would:
      // 1. Fetch transaction from blockchain
      // 2. Verify it's a USDC transfer to the correct recipient
      // 3. Verify the amount matches expected cost
      // 4. Verify the transaction is confirmed
      
      console.log(`🔍 Verifying payment proof: ${transactionHash} for amount: ${expectedAmount}`);
      
      // For now, simulate verification
      return Math.random() > 0.1; // 90% success rate for demo
      
    } catch (error) {
      console.error('Payment verification failed:', error);
      return false;
    }
  }

  /**
   * Process the actual API call after payment verification
   */
  private async processAPICall(endpoint: string, payload: any): Promise<Response> {
    // This would make the actual API call to the underlying service
    // For now, simulate a successful response
    
    const result = {
      success: true,
      data: 'API call processed successfully',
      timestamp: new Date().toISOString(),
      endpoint,
      payload
    };

    return new Response(JSON.stringify(result), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'X-Payment-Verified': 'true'
      }
    });
  }
}

// Export for use in other modules
export type { X402PaymentRequest, X402PaymentResponse, X402APIResponse };

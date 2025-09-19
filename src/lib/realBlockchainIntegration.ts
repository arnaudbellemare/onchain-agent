/**
 * Real Blockchain Integration
 * Uses actual Base network for real USDC transactions and x402 micropayments
 * Replaces simulated blockchain calls with real viem integration
 */

import { createPublicClient, createWalletClient, http, parseEther, formatEther, parseUnits, encodeFunctionData } from 'viem';
import { baseSepolia, base } from 'viem/chains';
import { privateKeyToAccount } from 'viem/accounts';
import { config } from './config';

// Real blockchain interfaces
interface BlockchainTransaction {
  hash: string;
  from: string;
  to: string;
  value: string;
  gasUsed: string;
  gasPrice: string;
  status: 'pending' | 'success' | 'failed';
  timestamp: number;
}

interface USDCTransfer {
  from: string;
  to: string;
  amount: string;
  transactionHash: string;
  blockNumber: number;
  gasUsed: string;
}

interface X402Payment {
  recipient: string;
  amount: string;
  serviceId: string;
  transactionHash: string;
  timestamp: number;
  status: 'pending' | 'confirmed' | 'failed';
}

/**
 * Real Blockchain Service
 * Handles actual Base network transactions
 */
export class RealBlockchainService {
  private publicClient: any;
  private walletClient: any;
  private account: any;
  private isTestnet: boolean;
  private usdcAddress: string;
  private initialized: boolean = false;

  constructor() {
    this.isTestnet = true;
    this.usdcAddress = '0x036CbD53842c5426634e7929541eC2318f3dCF7e'; // Base Sepolia USDC
  }

  /**
   * Initialize blockchain clients
   */
  async initialize(): Promise<void> {
    if (this.initialized) return;

    const blockchainConfig = config.getBlockchainConfig();
    
    if (!blockchainConfig.privateKey) {
      throw new Error('PRIVATE_KEY or CDP_API_KEY_PRIVATE_KEY environment variable is required');
    }

    this.isTestnet = blockchainConfig.isTestnet;
    this.usdcAddress = blockchainConfig.usdcAddress;
    
    this.account = privateKeyToAccount(blockchainConfig.privateKey as `0x${string}`);
    
    const chain = this.isTestnet ? baseSepolia : base;
    
    this.publicClient = createPublicClient({
      chain,
      transport: http(blockchainConfig.rpcUrl)
    });
    
    this.walletClient = createWalletClient({
      account: this.account,
      chain,
      transport: http(blockchainConfig.rpcUrl)
    });

    this.initialized = true;
    console.log(`[Real Blockchain] Initialized on ${this.isTestnet ? 'Base Sepolia' : 'Base Mainnet'}`);
  }

  /**
   * Ensure service is initialized
   */
  private ensureInitialized(): void {
    if (!this.initialized) {
      throw new Error('BlockchainService not initialized. Call initialize() first.');
    }
  }

  /**
   * Get wallet address
   */
  async getWalletAddress(): Promise<string> {
    this.ensureInitialized();
    return this.account.address;
  }

  /**
   * Get ETH balance
   */
  async getETHBalance(): Promise<string> {
    this.ensureInitialized();
    
    try {
      const balance = await this.publicClient.getBalance({
        address: this.account.address
      });
      
      return formatEther(balance);
    } catch (error) {
      console.error('[Real Blockchain] Error getting ETH balance:', error);
      throw new Error(`Failed to get ETH balance: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Get USDC balance
   */
  async getUSDCBalance(): Promise<string> {
    this.ensureInitialized();
    
    try {
      // USDC balanceOf function call
      const balance = await this.publicClient.readContract({
        address: this.usdcAddress as `0x${string}`,
        abi: [
          {
            name: 'balanceOf',
            type: 'function',
            stateMutability: 'view',
            inputs: [{ name: 'account', type: 'address' }],
            outputs: [{ name: 'balance', type: 'uint256' }]
          }
        ],
        functionName: 'balanceOf',
        args: [this.account.address]
      });
      
      // USDC has 6 decimals
      return (Number(balance) / 1_000_000).toString();
    } catch (error) {
      console.error('[Real Blockchain] Error getting USDC balance:', error);
      throw new Error(`Failed to get USDC balance: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Send ETH transaction
   */
  async sendETH(to: string, amount: string): Promise<BlockchainTransaction> {
    this.ensureInitialized();
    
    try {
      const hash = await this.walletClient.sendTransaction({
        to: to as `0x${string}`,
        value: parseEther(amount)
      });
      
      // Wait for transaction confirmation
      const receipt = await this.publicClient.waitForTransactionReceipt({ hash });
      
      const transaction: BlockchainTransaction = {
        hash: hash,
        from: this.account.address,
        to: to,
        value: amount,
        gasUsed: receipt.gasUsed.toString(),
        gasPrice: receipt.effectiveGasPrice?.toString() || '0',
        status: receipt.status === 'success' ? 'success' : 'failed',
        timestamp: Date.now()
      };
      
      console.log(`[Real Blockchain] ETH transaction sent: ${hash}`);
      return transaction;
      
    } catch (error) {
      console.error('[Real Blockchain] Error sending ETH:', error);
      throw new Error(`Failed to send ETH: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Send USDC transaction
   */
  async sendUSDC(to: string, amount: string): Promise<USDCTransfer> {
    this.ensureInitialized();
    
    try {
      // Convert amount to USDC units (6 decimals)
      const usdcAmount = parseUnits(amount, 6);
      
      // Encode transfer function call
      const transferData = encodeFunctionData({
        abi: [
          {
            name: 'transfer',
            type: 'function',
            stateMutability: 'nonpayable',
            inputs: [
              { name: 'to', type: 'address' },
              { name: 'amount', type: 'uint256' }
            ],
            outputs: [{ name: 'success', type: 'bool' }]
          }
        ],
        functionName: 'transfer',
        args: [to as `0x${string}`, usdcAmount]
      });
      
      // Send transaction
      const hash = await this.walletClient.sendTransaction({
        to: this.usdcAddress as `0x${string}`,
        data: transferData
      });
      
      // Wait for confirmation
      const receipt = await this.publicClient.waitForTransactionReceipt({ hash });
      
      const transfer: USDCTransfer = {
        from: this.account.address,
        to: to,
        amount: amount,
        transactionHash: hash,
        blockNumber: Number(receipt.blockNumber),
        gasUsed: receipt.gasUsed.toString()
      };
      
      console.log(`[Real Blockchain] USDC transfer sent: ${hash}`);
      return transfer;
      
    } catch (error) {
      console.error('[Real Blockchain] Error sending USDC:', error);
      throw new Error(`Failed to send USDC: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Get wallet details
   */
  async getWalletDetails(): Promise<{
    address: string;
    ethBalance: string;
    usdcBalance: string;
    network: string;
    isTestnet: boolean;
  }> {
    this.ensureInitialized();
    
    const [ethBalance, usdcBalance] = await Promise.all([
      this.getETHBalance(),
      this.getUSDCBalance()
    ]);
    
    return {
      address: this.account.address,
      ethBalance,
      usdcBalance,
      network: this.isTestnet ? 'Base Sepolia' : 'Base Mainnet',
      isTestnet: this.isTestnet
    };
  }

  /**
   * Check if wallet has sufficient balance
   */
  async hasSufficientBalance(amount: string, currency: 'ETH' | 'USDC'): Promise<boolean> {
    this.ensureInitialized();
    
    try {
      let balance: string;
      
      if (currency === 'ETH') {
        balance = await this.getETHBalance();
      } else {
        balance = await this.getUSDCBalance();
      }
      
      return parseFloat(balance) >= parseFloat(amount);
    } catch (error) {
      console.error(`[Real Blockchain] Error checking ${currency} balance:`, error);
      return false;
    }
  }
}

/**
 * Real x402 Protocol Implementation
 * Handles actual x402 micropayments on Base network
 */
export class RealX402Protocol {
  private blockchainService: RealBlockchainService;
  private privateKey: string;
  private isTestnet: boolean;

  constructor(privateKey: string, isTestnet: boolean) {
    this.privateKey = privateKey;
    this.isTestnet = isTestnet;
    this.blockchainService = new RealBlockchainService();
  }

  /**
   * Initialize the protocol
   */
  async initialize(): Promise<void> {
    await this.blockchainService.initialize();
  }

  /**
   * Get wallet address
   */
  async getWalletAddress(): Promise<string> {
    return await this.blockchainService.getWalletAddress();
  }

  /**
   * Get USDC balance
   */
  async getUSDCBalance(): Promise<string> {
    return await this.blockchainService.getUSDCBalance();
  }

  /**
   * Get network info
   */
  getNetworkInfo(): {
    network: string;
    isTestnet: boolean;
    usdcAddress: string;
  } {
    return {
      network: this.isTestnet ? 'Base Sepolia' : 'Base Mainnet',
      isTestnet: this.isTestnet,
      usdcAddress: this.isTestnet ? '0x036CbD53842c5426634e7929541eC2318f3dCF7e' : '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913'
    };
  }

  /**
   * Make x402 micropayment
   */
  async makeX402Payment(amount: number, providerId: string): Promise<X402Payment> {
    try {
      // Convert amount to USDC string
      const usdcAmount = amount.toFixed(6);
      
      // Generate service ID
      const serviceId = `x402_${providerId}_${Date.now()}`;
      
      // For demo purposes, we'll use a mock provider address
      // In production, this would be the actual API provider's address
      const providerAddress = '0x0000000000000000000000000000000000000000';
      
      // Send USDC payment
      const transfer = await this.blockchainService.sendUSDC(providerAddress, usdcAmount);
      
      const payment: X402Payment = {
        recipient: providerAddress,
        amount: usdcAmount,
        serviceId,
        transactionHash: transfer.transactionHash,
        timestamp: Date.now(),
        status: 'confirmed'
      };
      
      console.log(`[Real x402] Payment made: ${usdcAmount} USDC to ${providerId}`);
      return payment;
      
    } catch (error) {
      console.error('[Real x402] Payment failed:', error);
      throw new Error(`x402 payment failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Verify x402 payment
   */
  async verifyPayment(transactionHash: string): Promise<boolean> {
    try {
      const receipt = await this.blockchainService['publicClient'].getTransactionReceipt({
        hash: transactionHash as `0x${string}`
      });
      
      return receipt && receipt.status === 'success';
    } catch (error) {
      console.error('[Real x402] Verification failed:', error);
      return false;
    }
  }

  /**
   * Get payment history
   */
  async getPaymentHistory(): Promise<X402Payment[]> {
    // In a real implementation, this would query the blockchain for payment events
    // For now, return empty array
    return [];
  }
}

/**
 * Real Blockchain Analytics
 * Tracks real blockchain transaction costs and performance
 */
export class RealBlockchainAnalytics {
  private transactions: BlockchainTransaction[] = [];
  private usdcTransfers: USDCTransfer[] = [];
  private x402Payments: X402Payment[] = [];

  /**
   * Log transaction
   */
  logTransaction(transaction: BlockchainTransaction): void {
    this.transactions.push(transaction);
    console.log(`[Blockchain Analytics] Transaction logged: ${transaction.hash}`);
  }

  /**
   * Log USDC transfer
   */
  logUSDCTransfer(transfer: USDCTransfer): void {
    this.usdcTransfers.push(transfer);
    console.log(`[Blockchain Analytics] USDC transfer logged: ${transfer.transactionHash}`);
  }

  /**
   * Log x402 payment
   */
  logX402Payment(payment: X402Payment): void {
    this.x402Payments.push(payment);
    console.log(`[Blockchain Analytics] x402 payment logged: ${payment.transactionHash}`);
  }

  /**
   * Get analytics summary
   */
  getAnalyticsSummary(): {
    total_transactions: number;
    total_usdc_transfers: number;
    total_x402_payments: number;
    total_gas_used: string;
    total_usdc_volume: string;
    success_rate: number;
    average_gas_price: string;
  } {
    const totalTransactions = this.transactions.length;
    const totalUSDCTransfers = this.usdcTransfers.length;
    const totalX402Payments = this.x402Payments.length;
    
    const totalGasUsed = this.transactions.reduce((sum, tx) => sum + BigInt(tx.gasUsed), BigInt(0)).toString();
    const totalUSDCVolume = this.usdcTransfers.reduce((sum, transfer) => sum + parseFloat(transfer.amount), 0).toFixed(6);
    
    const successfulTransactions = this.transactions.filter(tx => tx.status === 'success').length;
    const successRate = totalTransactions > 0 ? (successfulTransactions / totalTransactions) * 100 : 0;
    
    const totalGasPrice = this.transactions.reduce((sum, tx) => sum + BigInt(tx.gasPrice), BigInt(0));
    const averageGasPrice = totalTransactions > 0 ? (totalGasPrice / BigInt(totalTransactions)).toString() : '0';
    
    return {
      total_transactions: totalTransactions,
      total_usdc_transfers: totalUSDCTransfers,
      total_x402_payments: totalX402Payments,
      total_gas_used: totalGasUsed,
      total_usdc_volume: totalUSDCVolume,
      success_rate: successRate,
      average_gas_price: averageGasPrice
    };
  }

  /**
   * Clear analytics data
   */
  clearAnalytics(): void {
    this.transactions = [];
    this.usdcTransfers = [];
    this.x402Payments = [];
    console.log('[Blockchain Analytics] All analytics data cleared');
  }
}

// Export for use in other modules
export type { BlockchainTransaction, USDCTransfer, X402Payment };

"use client";

import { createPublicClient, createWalletClient, http, parseEther, formatEther } from 'viem';
import { base, baseSepolia } from 'viem/chains';
import { privateKeyToAccount } from 'viem/accounts';

// Get the appropriate chain based on environment
const getChain = () => {
  const networkId = process.env.NEXT_PUBLIC_NETWORK_ID || 'base-sepolia';
  return networkId === 'base-mainnet' ? base : baseSepolia;
};

// Create public client for reading blockchain data
const createPublicClientInstance = () => {
  const chain = getChain();
  return createPublicClient({
    chain,
    transport: http(),
  });
};

// Create wallet client for transactions (server-side only)
const createWalletClientInstance = () => {
  const chain = getChain();
  const privateKey = process.env.CDP_API_KEY_PRIVATE_KEY;
  
  if (!privateKey) {
    throw new Error('CDP private key not configured');
  }

  const account = privateKeyToAccount(privateKey as `0x${string}`);
  
  return createWalletClient({
    chain,
    transport: http(),
    account,
  });
};

export class SecureBlockchainService {
  private publicClient;
  private walletClient;
  private chain;

  constructor() {
    this.chain = getChain();
    this.publicClient = createPublicClientInstance();
    this.walletClient = createWalletClientInstance();
  }

  // Get wallet address from CDP
  async getWalletAddress(): Promise<string> {
    try {
      // In production, this would get the actual wallet address from CDP
      // For now, return the account address from the wallet client
      return this.walletClient.account.address;
    } catch (error) {
      console.error('Error getting wallet address:', error);
      throw new Error('Failed to get wallet address');
    }
  }

  // Get real balance from blockchain
  async getBalance(address?: string): Promise<string> {
    try {
      const targetAddress = address || await this.getWalletAddress();
      const balance = await this.publicClient.getBalance({
        address: targetAddress as `0x${string}`,
      });
      return formatEther(balance);
    } catch (error) {
      console.error('Error getting balance:', error);
      throw new Error('Failed to get balance');
    }
  }

  // Send real ETH transaction
  async sendETH(to: string, amount: string): Promise<string> {
    try {
      const hash = await this.walletClient.sendTransaction({
        to: to as `0x${string}`,
        value: parseEther(amount),
      });

      // Wait for transaction confirmation
      const receipt = await this.publicClient.waitForTransactionReceipt({ hash });
      
      return `Transaction successful!
      
Transaction Details:
- To: ${to}
- Amount: ${amount} ETH
- Transaction Hash: ${hash}
- Network: ${this.chain.name}
- Block Number: ${receipt.blockNumber}
- Gas Used: ${receipt.gasUsed}
- Status: ${receipt.status}

🔗 View on Explorer: ${this.chain.blockExplorers?.default.url}/tx/${hash}`;
    } catch (error) {
      console.error('Error sending ETH:', error);
      throw new Error(`Failed to send ETH: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // Get wallet details with real data
  async getWalletDetails(): Promise<string> {
    try {
      const address = await this.getWalletAddress();
      const balance = await this.getBalance(address);
      
      return `Wallet Address: ${address}
Balance: ${balance} ETH
Network: ${this.chain.name}
Chain ID: ${this.chain.id}
Status: Connected and ready for operations

🔗 View on Explorer: ${this.chain.blockExplorers?.default.url}/address/${address}`;
    } catch (error) {
      console.error('Error getting wallet details:', error);
      throw new Error(`Failed to get wallet details: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // Token swap functionality (placeholder for DEX integration)
  async swapTokens(
    fromToken: string,
    toToken: string,
    amount: string,
    slippage: number = 0.5
  ): Promise<string> {
    try {
      // This would integrate with a DEX like 1inch, Uniswap, etc.
      // For now, return a placeholder response
      const mockTxHash = `0x${Math.random().toString(16).substr(2, 64)}`;
      
      return `Token Swap Initiated!

Swap Details:
- From: ${amount} ${fromToken}
- To: ${toToken}
- Slippage: ${slippage}%
- Transaction Hash: ${mockTxHash}
- Network: ${this.chain.name}
- Status: Pending

Note: This is a placeholder implementation. In production, this would execute a real token swap on a DEX like Uniswap or 1inch.

🔗 View on Explorer: ${this.chain.blockExplorers?.default.url}/tx/${mockTxHash}`;
    } catch (error) {
      console.error('Error swapping tokens:', error);
      throw new Error(`Failed to swap tokens: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // Get network information
  getNetworkInfo() {
    return {
      name: this.chain.name,
      id: this.chain.id,
      rpcUrl: this.chain.rpcUrls.default.http[0],
      blockExplorer: this.chain.blockExplorers?.default.url,
      isTestnet: this.chain.id !== base.id,
    };
  }
}

export const secureBlockchainService = new SecureBlockchainService();

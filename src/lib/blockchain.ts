// Real blockchain implementation with viem
import { createPublicClient, createWalletClient, http, parseEther, formatEther, parseUnits, encodeFunctionData } from 'viem';
import { baseSepolia, base } from 'viem/chains';
import { privateKeyToAccount } from 'viem/accounts';
import { config } from './config';
import { RealBlockchainService, RealX402Protocol, RealBlockchainAnalytics } from './realBlockchainIntegration';

// USDC contract addresses
const USDC_CONTRACT_ADDRESS = '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913'; // Base mainnet
const USDC_CONTRACT_ADDRESS_TESTNET = '0x036CbD53842c5426634e7929541eC2318f3dCF7e'; // Base Sepolia

// ERC20 ABI for USDC
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

// Real blockchain service with actual Base network integration
export class BlockchainService {
  private publicClient: any;
  private walletClient: any;
  private account: any;
  private isTestnet: boolean;
  private usdcAddress: string;

  constructor() {
    // Initialize with default values - will be properly initialized when needed
    this.isTestnet = true;
    this.usdcAddress = USDC_CONTRACT_ADDRESS_TESTNET;
    this.publicClient = null;
    this.walletClient = null;
    this.account = null;
  }

  /**
   * Initialize blockchain service with proper credentials
   * Call this method when you have the required environment variables
   */
  async initialize(): Promise<void> {
    const blockchainConfig = config.getBlockchainConfig();
    
    if (!blockchainConfig.privateKey) {
      throw new Error('PRIVATE_KEY or CDP_API_KEY_PRIVATE_KEY environment variable is required');
    }

    // Use configuration values
    this.isTestnet = blockchainConfig.isTestnet;
    this.usdcAddress = blockchainConfig.usdcAddress;
    
    // Create account from private key
    this.account = privateKeyToAccount(blockchainConfig.privateKey as `0x${string}`);
    
    // Create clients
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
  }

  /**
   * Check if the service is properly initialized
   */
  private ensureInitialized(): void {
    if (!this.account || !this.publicClient || !this.walletClient) {
      throw new Error('BlockchainService not initialized. Call initialize() first.');
    }
  }

  // Get real wallet address
  async getWalletAddress(): Promise<string> {
    try {
      this.ensureInitialized();
      return this.account.address;
    } catch (error) {
      console.error('Error getting wallet address:', error);
      throw new Error(`Failed to get wallet address: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // Get real ETH balance from blockchain
  async getBalance(address?: string): Promise<string> {
    try {
      this.ensureInitialized();
      const targetAddress = address || this.account.address;
      const balance = await this.publicClient.getBalance({
        address: targetAddress as `0x${string}`
      });
      
      return formatEther(balance);
    } catch (error) {
      console.error('Error getting balance:', error);
      throw new Error(`Failed to get balance: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // Get real USDC balance
  async getUSDCBalance(address?: string): Promise<string> {
    try {
      this.ensureInitialized();
      const targetAddress = address || this.account.address;
      const balance = await this.publicClient.readContract({
        address: this.usdcAddress,
        abi: ERC20_ABI,
        functionName: 'balanceOf',
        args: [targetAddress as `0x${string}`]
      });

      return (Number(balance) / 1e6).toFixed(6); // USDC has 6 decimals
    } catch (error) {
      console.error('Error getting USDC balance:', error);
      throw new Error(`Failed to get USDC balance: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // Send real ETH transaction
  async sendETH(to: string, amount: string): Promise<string> {
    try {
      this.ensureInitialized();
      const hash = await this.walletClient.sendTransaction({
        to: to as `0x${string}`,
        value: parseEther(amount)
      });

      // Wait for transaction confirmation
      const receipt = await this.publicClient.waitForTransactionReceipt({ hash });
      
      return `Transaction submitted successfully!
      
Transaction Details:
- To: ${to}
- Amount: ${amount} ETH
- Transaction Hash: ${hash}
- Network: ${this.isTestnet ? 'Base Sepolia' : 'Base'}
- Status: Confirmed
- Gas Used: ${receipt.gasUsed}
- Block Number: ${receipt.blockNumber}

View on Explorer: https://${this.isTestnet ? 'sepolia.basescan.org' : 'basescan.org'}/tx/${hash}`;
    } catch (error) {
      console.error('Error sending ETH:', error);
      throw new Error(`Failed to send ETH: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // Send real USDC transaction
  async sendUSDC(to: string, amount: string): Promise<string> {
    try {
      this.ensureInitialized();
      const amountWei = parseUnits(amount, 6); // USDC has 6 decimals
      
      const hash = await this.walletClient.writeContract({
        address: this.usdcAddress,
        abi: ERC20_ABI,
        functionName: 'transfer',
        args: [to as `0x${string}`, amountWei]
      });

      // Wait for transaction confirmation
      const receipt = await this.publicClient.waitForTransactionReceipt({ hash });
      
      return `USDC Transaction submitted successfully!
      
Transaction Details:
- To: ${to}
- Amount: ${amount} USDC
- Transaction Hash: ${hash}
- Network: ${this.isTestnet ? 'Base Sepolia' : 'Base'}
- Status: Confirmed
- Gas Used: ${receipt.gasUsed}
- Block Number: ${receipt.blockNumber}

View on Explorer: https://${this.isTestnet ? 'sepolia.basescan.org' : 'basescan.org'}/tx/${hash}`;
    } catch (error) {
      console.error('Error sending USDC:', error);
      throw new Error(`Failed to send USDC: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // Get wallet details with real data
  async getWalletDetails(): Promise<string> {
    try {
      this.ensureInitialized();
      const address = await this.getWalletAddress();
      const ethBalance = await this.getBalance(address);
      const usdcBalance = await this.getUSDCBalance(address);
      const networkName = this.isTestnet ? 'Base Sepolia' : 'Base';
      
      return `Wallet Address: ${address}
ETH Balance: ${ethBalance} ETH
USDC Balance: ${usdcBalance} USDC
Network: ${networkName}
Status: Connected and ready for operations

🔗 View on Explorer: https://${this.isTestnet ? 'sepolia.basescan.org' : 'basescan.org'}/address/${address}`;
    } catch (error) {
      console.error('Error getting wallet details:', error);
      throw new Error(`Failed to get wallet details: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // Get network information
  getNetworkInfo(): { chainId: number; name: string; testnet: boolean; rpcUrl: string } {
    return {
      chainId: this.isTestnet ? baseSepolia.id : base.id,
      name: this.isTestnet ? 'Base Sepolia' : 'Base',
      testnet: this.isTestnet,
      rpcUrl: this.isTestnet ? 'https://sepolia.base.org' : 'https://mainnet.base.org'
    };
  }

  // Check if wallet has sufficient balance for transaction
  async hasSufficientBalance(amount: string, currency: 'ETH' | 'USDC'): Promise<boolean> {
    try {
      this.ensureInitialized();
      if (currency === 'ETH') {
        const balance = await this.getBalance();
        return parseFloat(balance) >= parseFloat(amount);
      } else {
        const balance = await this.getUSDCBalance();
        return parseFloat(balance) >= parseFloat(amount);
      }
    } catch (error) {
      console.error('Error checking balance:', error);
      return false;
    }
  }
}

export const blockchainService = new BlockchainService();

/**
 * Environment Configuration System
 * Handles all environment variables with proper validation and defaults
 */

interface Config {
  // Blockchain Configuration
  blockchain: {
    privateKey?: string;
    networkId: string;
    isTestnet: boolean;
    rpcUrl: string;
    usdcAddress: string;
  };
  
  // AI Provider Configuration
  ai: {
    openai?: {
      apiKey?: string;
      enabled: boolean;
    };
    anthropic?: {
      apiKey?: string;
      enabled: boolean;
    };
    perplexity?: {
      apiKey?: string;
      enabled: boolean;
    };
  };
  
  // Application Configuration
  app: {
    nodeEnv: string;
    isDevelopment: boolean;
    isProduction: boolean;
    port: number;
  };
  
  // Security Configuration
  security: {
    enableBlockchain: boolean;
    enableRealAPI: boolean;
    maxCostPerCall: number;
  };
}

class ConfigManager {
  private config: Config;
  private initialized = false;

  constructor() {
    this.config = this.loadConfig();
  }

  private loadConfig(): Config {
    const nodeEnv = process.env.NODE_ENV || 'development';
    const isDevelopment = nodeEnv === 'development';
    const isProduction = nodeEnv === 'production';

    // Blockchain configuration
    const networkId = process.env.NETWORK_ID || 'base-sepolia';
    const isTestnet = networkId !== 'base-mainnet';
    
    const blockchainConfig = {
      privateKey: process.env.PRIVATE_KEY || process.env.CDP_API_KEY_PRIVATE_KEY,
      networkId,
      isTestnet,
      rpcUrl: isTestnet ? 'https://sepolia.base.org' : 'https://mainnet.base.org',
      usdcAddress: isTestnet 
        ? '0x036CbD53842c5426634e7929541eC2318f3dCF7e' // Base Sepolia
        : '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913' // Base Mainnet
    };

    // AI provider configuration
    const aiConfig = {
      openai: {
        apiKey: process.env.OPENAI_API_KEY,
        enabled: !!process.env.OPENAI_API_KEY
      },
      anthropic: {
        apiKey: process.env.ANTHROPIC_API_KEY,
        enabled: !!process.env.ANTHROPIC_API_KEY
      },
      perplexity: {
        apiKey: process.env.PERPLEXITY_API_KEY,
        enabled: !!process.env.PERPLEXITY_API_KEY
      }
    };

    // Security configuration
    const securityConfig = {
      enableBlockchain: !!blockchainConfig.privateKey,
      enableRealAPI: Object.values(aiConfig).some(provider => provider.enabled),
      maxCostPerCall: parseFloat(process.env.MAX_COST_PER_CALL || '1.0')
    };

    return {
      blockchain: blockchainConfig,
      ai: aiConfig,
      app: {
        nodeEnv,
        isDevelopment,
        isProduction,
        port: parseInt(process.env.PORT || '3000', 10)
      },
      security: securityConfig
    };
  }

  /**
   * Get the complete configuration
   */
  getConfig(): Config {
    return this.config;
  }

  /**
   * Get blockchain configuration
   */
  getBlockchainConfig() {
    return this.config.blockchain;
  }

  /**
   * Get AI provider configuration
   */
  getAIConfig() {
    return this.config.ai;
  }

  /**
   * Get application configuration
   */
  getAppConfig() {
    return this.config.app;
  }

  /**
   * Get security configuration
   */
  getSecurityConfig() {
    return this.config.security;
  }

  /**
   * Check if blockchain is enabled and properly configured
   */
  isBlockchainEnabled(): boolean {
    return this.config.security.enableBlockchain;
  }

  /**
   * Check if real AI APIs are enabled
   */
  isRealAPIEnabled(): boolean {
    return this.config.security.enableRealAPI;
  }

  /**
   * Validate configuration for production
   */
  validateForProduction(): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    // Check required environment variables for production
    if (this.config.app.isProduction) {
      if (!this.config.blockchain.privateKey) {
        errors.push('PRIVATE_KEY is required for production');
      }
      
      if (!this.config.security.enableRealAPI) {
        errors.push('At least one AI provider API key is required for production');
      }
    }

    // Validate blockchain configuration
    if (this.config.security.enableBlockchain) {
      if (!this.config.blockchain.privateKey) {
        errors.push('PRIVATE_KEY is required when blockchain is enabled');
      }
    }

    // Validate AI configuration
    const enabledProviders = Object.entries(this.config.ai)
      .filter(([_, config]) => config.enabled)
      .map(([name, _]) => name);
    
    if (this.config.security.enableRealAPI && enabledProviders.length === 0) {
      errors.push('At least one AI provider must be configured');
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }

  /**
   * Get configuration summary for debugging
   */
  getConfigSummary(): Record<string, unknown> {
    return {
      app: {
        nodeEnv: this.config.app.nodeEnv,
        isDevelopment: this.config.app.isDevelopment,
        isProduction: this.config.app.isProduction
      },
      blockchain: {
        networkId: this.config.blockchain.networkId,
        isTestnet: this.config.blockchain.isTestnet,
        enabled: this.config.security.enableBlockchain,
        hasPrivateKey: !!this.config.blockchain.privateKey
      },
      ai: {
        openai: this.config.ai.openai?.enabled || false,
        anthropic: this.config.ai.anthropic?.enabled || false,
        perplexity: this.config.ai.perplexity?.enabled || false,
        realAPIEnabled: this.config.security.enableRealAPI
      },
      security: {
        enableBlockchain: this.config.security.enableBlockchain,
        enableRealAPI: this.config.security.enableRealAPI,
        maxCostPerCall: this.config.security.maxCostPerCall
      }
    };
  }
}

// Export singleton instance
export const config = new ConfigManager();

// Export types
export type { Config };

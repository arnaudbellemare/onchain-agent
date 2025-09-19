/**
 * OnChain Agent SDK - JavaScript/TypeScript
 * Easy integration for AI agent cost optimization
 * 
 * Usage:
 * npm install @onchain-agent/sdk
 * 
 * or include this file directly in your project
 */

class AIAgentClient {
  constructor(config) {
    this.apiKey = config.apiKey;
    this.baseUrl = config.baseUrl || 'https://your-domain.com/api/v1';
    this.timeout = config.timeout || 30000;
  }

  /**
   * Make authenticated API request
   */
  async request(endpoint, options = {}) {
    const url = endpoint.startsWith('http') ? endpoint : `${this.baseUrl}${endpoint}`;
    
    const defaultOptions = {
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key': this.apiKey
      },
      timeout: this.timeout
    };

    const requestOptions = {
      ...defaultOptions,
      ...options,
      headers: {
        ...defaultOptions.headers,
        ...options.headers
      }
    };

    try {
      const response = await fetch(url, requestOptions);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || `HTTP ${response.status}: ${response.statusText}`);
      }

      return data;
    } catch (error) {
      if (error.name === 'TypeError' && error.message.includes('fetch')) {
        throw new Error('Network error: Unable to connect to API');
      }
      throw error;
    }
  }

  /**
   * Optimize AI agent costs using x402 protocol
   */
  async optimize(params) {
    const { prompt, provider, maxCost, walletAddress } = params;

    if (!prompt || !walletAddress) {
      throw new Error('prompt and walletAddress are required');
    }

    return this.request('', {
      method: 'POST',
      body: JSON.stringify({
        action: 'optimize',
        prompt,
        provider,
        maxCost,
        walletAddress
      })
    });
  }

  /**
   * Chat with AI through cost-optimized routing
   */
  async chat(params) {
    const { message, walletAddress } = params;

    if (!message || !walletAddress) {
      throw new Error('message and walletAddress are required');
    }

    return this.request('', {
      method: 'POST',
      body: JSON.stringify({
        action: 'chat',
        message,
        walletAddress
      })
    });
  }

  /**
   * Connect wallet for micropayments
   */
  async connectWallet(params) {
    const { walletAddress, signature } = params;

    if (!walletAddress) {
      throw new Error('walletAddress is required');
    }

    return this.request('', {
      method: 'POST',
      body: JSON.stringify({
        action: 'wallet',
        walletAddress,
        signature
      })
    });
  }

  /**
   * Get cost analytics and savings reports
   */
  async getAnalytics(walletAddress) {
    if (!walletAddress) {
      throw new Error('walletAddress is required');
    }

    return this.request(`?action=analytics&walletAddress=${encodeURIComponent(walletAddress)}`);
  }

  /**
   * Get available AI providers and pricing
   */
  async getProviders() {
    return this.request('?action=providers');
  }

  /**
   * Get API information and available endpoints
   */
  async getInfo() {
    return this.request('?action=info');
  }
}

/**
 * Simple wrapper for direct usage without classes
 */
function createClient(config) {
  return new AIAgentClient(config);
}

/**
 * Quick optimization function
 */
async function optimizeCosts(apiKey, prompt, walletAddress, options = {}) {
  const client = new AIAgentClient({ apiKey, ...options });
  return client.optimize({ prompt, walletAddress, ...options });
}

/**
 * Quick chat function
 */
async function chatWithAI(apiKey, message, walletAddress, options = {}) {
  const client = new AIAgentClient({ apiKey, ...options });
  return client.chat({ message, walletAddress, ...options });
}

// Export for different module systems
if (typeof module !== 'undefined' && module.exports) {
  // Node.js
  module.exports = {
    AIAgentClient,
    createClient,
    optimizeCosts,
    chatWithAI
  };
} else if (typeof window !== 'undefined') {
  // Browser
  window.OnChainAgent = {
    AIAgentClient,
    createClient,
    optimizeCosts,
    chatWithAI
  };
}

// Example usage:
/*
// Using the class
const client = new AIAgentClient({
  apiKey: 'your-api-key',
  baseUrl: 'https://your-domain.com/api/v1'
});

// Optimize costs
const result = await client.optimize({
  prompt: 'Explain quantum computing',
  provider: 'openai',
  maxCost: 0.10,
  walletAddress: '0x...'
});

console.log('Savings:', result.data.savingsPercentage + '%');

// Chat with AI
const response = await client.chat({
  message: 'Hello!',
  walletAddress: '0x...'
});

console.log('Response:', response.data.message);

// Using quick functions
const quickResult = await optimizeCosts(
  'your-api-key',
  'Explain AI',
  '0x...',
  { provider: 'anthropic', maxCost: 0.05 }
);
*/

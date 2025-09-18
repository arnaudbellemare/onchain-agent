// Security configuration and utilities

export const SECURITY_CONFIG = {
  // Environment-based security settings
  isProduction: process.env.NODE_ENV === 'production',
  isTestnet: process.env.NEXT_PUBLIC_NETWORK_ID !== 'base-mainnet',
  
  // Rate limiting
  rateLimits: {
    apiCalls: {
      windowMs: 15 * 60 * 1000, // 15 minutes
      max: 100, // limit each IP to 100 requests per windowMs
    },
    transactions: {
      windowMs: 60 * 1000, // 1 minute
      max: 5, // limit each user to 5 transactions per minute
    },
  },
  
  // Transaction limits
  transactionLimits: {
    maxEthPerTransaction: '10', // Max 10 ETH per transaction
    maxDailyVolume: '100', // Max 100 ETH per day
    minTransactionAmount: '0.001', // Min 0.001 ETH
  },
  
  // Security headers
  securityHeaders: {
    'X-Frame-Options': 'DENY',
    'X-Content-Type-Options': 'nosniff',
    'Referrer-Policy': 'strict-origin-when-cross-origin',
    'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
  },
};

// Input validation utilities
export const validateAddress = (address: string): boolean => {
  return /^0x[a-fA-F0-9]{40}$/.test(address);
};

export const validateAmount = (amount: string): boolean => {
  const num = parseFloat(amount);
  return !isNaN(num) && num > 0 && num <= parseFloat(SECURITY_CONFIG.transactionLimits.maxEthPerTransaction);
};

export const sanitizeInput = (input: string): string => {
  return input.trim().replace(/[<>]/g, '');
};

// Security middleware for API routes
export const createSecurityHeaders = () => {
  return {
    ...SECURITY_CONFIG.securityHeaders,
    'Content-Security-Policy': SECURITY_CONFIG.isProduction 
      ? "default-src 'self'; script-src 'self' 'unsafe-eval' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; connect-src 'self' https://api.cdp.coinbase.com https://sepolia.base.org https://mainnet.base.org;"
      : "default-src 'self' 'unsafe-eval' 'unsafe-inline';",
  };
};

// Environment validation
export const validateEnvironment = () => {
  const requiredEnvVars = [
    'CDP_API_KEY_NAME',
    'CDP_API_KEY_PRIVATE_KEY',
  ];

  const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);
  
  if (missingVars.length > 0) {
    throw new Error(`Missing required environment variables: ${missingVars.join(', ')}`);
  }

  // Validate network configuration
  const networkId = process.env.NEXT_PUBLIC_NETWORK_ID || 'base-sepolia';
  const validNetworks = ['base-sepolia', 'base-mainnet'];
  
  if (!validNetworks.includes(networkId)) {
    throw new Error(`Invalid network ID: ${networkId}. Must be one of: ${validNetworks.join(', ')}`);
  }

  return true;
};

// Transaction security checks
export const validateTransaction = (to: string, amount: string): { valid: boolean; error?: string } => {
  if (!validateAddress(to)) {
    return { valid: false, error: 'Invalid recipient address' };
  }

  if (!validateAmount(amount)) {
    return { 
      valid: false, 
      error: `Invalid amount. Must be between ${SECURITY_CONFIG.transactionLimits.minTransactionAmount} and ${SECURITY_CONFIG.transactionLimits.maxEthPerTransaction} ETH` 
    };
  }

  return { valid: true };
};

// Logging for security events
export const logSecurityEvent = (event: string, details: Record<string, unknown>) => {
  if (SECURITY_CONFIG.isProduction) {
    // In production, send to security monitoring service
    console.log(`[SECURITY] ${event}:`, details);
  } else {
    // In development, just log to console
    console.log(`[SECURITY] ${event}:`, details);
  }
};

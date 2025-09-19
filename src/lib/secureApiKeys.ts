import crypto from 'crypto';

// In production, this should use a proper database like PostgreSQL
// For now, we'll use an in-memory store with encryption
interface APIKeyData {
  id: string;
  keyHash: string;
  name: string;
  createdAt: string;
  lastUsed: string | null;
  usage: {
    calls: number;
    totalCost: number;
    totalSaved: number;
    requests: Array<{
      timestamp: string;
      endpoint: string;
      cost: number;
      saved: number;
      provider: string;
    }>;
  };
  permissions: string[];
  isActive: boolean;
  rateLimit: {
    requestsPerHour: number;
    requestsPerDay: number;
  };
  metadata: {
    ipAddresses: string[];
    userAgent: string | null;
  };
}

// In-memory storage (replace with database in production)
const apiKeys = new Map<string, APIKeyData>();

// Encryption key (in production, use environment variable)
const ENCRYPTION_KEY = process.env.API_KEY_ENCRYPTION_KEY || 'your-32-char-encryption-key-here!';
const ALGORITHM = 'aes-256-gcm';

// Generate a secure API key
export function generateSecureAPIKey(): string {
  const randomBytes = crypto.randomBytes(24);
  const key = 'oa_' + randomBytes.toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=/g, '');
  return key;
}

// Hash API key for secure storage
export function hashAPIKey(key: string): string {
  return crypto.createHash('sha256').update(key).digest('hex');
}

// Validate API key format
export function validateAPIKeyFormat(key: string): boolean {
  return key.startsWith('oa_') && key.length >= 32 && key.length <= 64;
}

// Encrypt sensitive data
export function encryptData(data: string): string {
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipher(ALGORITHM, ENCRYPTION_KEY);
  let encrypted = cipher.update(data, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  return iv.toString('hex') + ':' + encrypted;
}

// Decrypt sensitive data
export function decryptData(encryptedData: string): string {
  const parts = encryptedData.split(':');
  const iv = Buffer.from(parts.shift()!, 'hex');
  const encrypted = parts.join(':');
  const decipher = crypto.createDecipher(ALGORITHM, ENCRYPTION_KEY);
  let decrypted = decipher.update(encrypted, 'hex', 'utf8');
  decrypted += decipher.final('utf8');
  return decrypted;
}

// Create a new API key with secure storage
export function createAPIKey(name: string, permissions: string[] = ['read', 'write']): { id: string; key: string; data: Omit<APIKeyData, 'keyHash'> } {
  const key = generateSecureAPIKey();
  const keyHash = hashAPIKey(key);
  const id = crypto.randomUUID();
  
  const data: Omit<APIKeyData, 'keyHash'> = {
    id,
    name,
    createdAt: new Date().toISOString(),
    lastUsed: null,
    usage: {
      calls: 0,
      totalCost: 0,
      totalSaved: 0,
      requests: []
    },
    permissions,
    isActive: true,
    rateLimit: {
      requestsPerHour: 1000,
      requestsPerDay: 10000
    },
    metadata: {
      ipAddresses: [],
      userAgent: null
    }
  };

  // Store with hashed key
  apiKeys.set(id, { ...data, keyHash });

  return { id, key, data };
}

// Validate API key and return associated data
export function validateAndGetAPIKey(key: string, clientIP?: string, userAgent?: string): APIKeyData | null {
  if (!validateAPIKeyFormat(key)) {
    return null;
  }

  const keyHash = hashAPIKey(key);
  
  // Find API key by hash
  for (const [id, data] of apiKeys) {
    if (data.keyHash === keyHash && data.isActive) {
      // Update last used timestamp
      data.lastUsed = new Date().toISOString();
      
      // Update metadata
      if (clientIP && !data.metadata.ipAddresses.includes(clientIP)) {
        data.metadata.ipAddresses.push(clientIP);
      }
      if (userAgent) {
        data.metadata.userAgent = userAgent;
      }
      
      return data;
    }
  }
  
  return null;
}

// Update API key usage statistics
export function updateAPIKeyUsage(
  keyId: string, 
  endpoint: string, 
  cost: number, 
  saved: number, 
  provider: string
): boolean {
  const data = apiKeys.get(keyId);
  if (!data) {
    return false;
  }

  // Update usage statistics
  data.usage.calls++;
  data.usage.totalCost += cost;
  data.usage.totalSaved += saved;
  data.lastUsed = new Date().toISOString();

  // Add request record (keep last 1000 requests)
  data.usage.requests.push({
    timestamp: new Date().toISOString(),
    endpoint,
    cost,
    saved,
    provider
  });

  // Keep only last 1000 requests
  if (data.usage.requests.length > 1000) {
    data.usage.requests = data.usage.requests.slice(-1000);
  }

  return true;
}

// Get API key data by ID (without the actual key)
export function getAPIKeyData(keyId: string): Omit<APIKeyData, 'keyHash'> | null {
  const data = apiKeys.get(keyId);
  if (!data) {
    return null;
  }

  const { keyHash, ...publicData } = data;
  return publicData;
}

// List all API keys (without hashes)
export function listAPIKeys(): Array<{ id: string; data: Omit<APIKeyData, 'keyHash'>; keyPreview: string }> {
  const keys = Array.from(apiKeys.entries()).map(([id, data]) => ({
    id,
    data: (() => {
      const { keyHash, ...publicData } = data;
      return publicData;
    })(),
    keyPreview: `oa_${'*'.repeat(24)}${id.slice(-4)}`
  }));

  return keys;
}

// Delete API key
export function deleteAPIKey(keyId: string): boolean {
  return apiKeys.delete(keyId);
}

// Check rate limits
export function checkRateLimit(keyId: string): { allowed: boolean; remaining: number; resetTime: string } {
  const data = apiKeys.get(keyId);
  if (!data) {
    return { allowed: false, remaining: 0, resetTime: new Date().toISOString() };
  }

  const now = new Date();
  const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);
  const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);

  // Count requests in last hour
  const recentRequests = data.usage.requests.filter(
    req => new Date(req.timestamp) > oneHourAgo
  );

  // Count requests in last day
  const dailyRequests = data.usage.requests.filter(
    req => new Date(req.timestamp) > oneDayAgo
  );

  const hourlyLimit = data.rateLimit.requestsPerHour;
  const dailyLimit = data.rateLimit.requestsPerDay;

  if (recentRequests.length >= hourlyLimit || dailyRequests.length >= dailyLimit) {
    return {
      allowed: false,
      remaining: 0,
      resetTime: new Date(now.getTime() + 60 * 60 * 1000).toISOString()
    };
  }

  const remaining = Math.min(
    hourlyLimit - recentRequests.length,
    dailyLimit - dailyRequests.length
  );

  return {
    allowed: true,
    remaining,
    resetTime: new Date(now.getTime() + 60 * 60 * 1000).toISOString()
  };
}

// Get analytics for a specific API key
export function getAPIKeyAnalytics(keyId: string, timeframe: 'hour' | 'day' | 'week' | 'month' = 'day') {
  const data = apiKeys.get(keyId);
  if (!data) {
    return null;
  }

  const now = new Date();
  let startTime: Date;

  switch (timeframe) {
    case 'hour':
      startTime = new Date(now.getTime() - 60 * 60 * 1000);
      break;
    case 'day':
      startTime = new Date(now.getTime() - 24 * 60 * 60 * 1000);
      break;
    case 'week':
      startTime = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      break;
    case 'month':
      startTime = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      break;
  }

  const filteredRequests = data.usage.requests.filter(
    req => new Date(req.timestamp) > startTime
  );

  // Calculate statistics
  const totalCalls = filteredRequests.length;
  const totalCost = filteredRequests.reduce((sum, req) => sum + req.cost, 0);
  const totalSaved = filteredRequests.reduce((sum, req) => sum + req.saved, 0);
  const averageCost = totalCalls > 0 ? totalCost / totalCalls : 0;
  const averageSavings = totalCalls > 0 ? totalSaved / totalCalls : 0;
  const savingsPercentage = totalCost > 0 ? (totalSaved / (totalCost + totalSaved)) * 100 : 0;

  // Provider breakdown
  const providerStats = filteredRequests.reduce((acc, req) => {
    if (!acc[req.provider]) {
      acc[req.provider] = { calls: 0, cost: 0, saved: 0 };
    }
    acc[req.provider].calls++;
    acc[req.provider].cost += req.cost;
    acc[req.provider].saved += req.saved;
    return acc;
  }, {} as Record<string, { calls: number; cost: number; saved: number }>);

  // Hourly breakdown for the last 24 hours
  const hourlyBreakdown = Array.from({ length: 24 }, (_, i) => {
    const hourStart = new Date(now.getTime() - (23 - i) * 60 * 60 * 1000);
    const hourEnd = new Date(hourStart.getTime() + 60 * 60 * 1000);
    
    const hourRequests = filteredRequests.filter(req => {
      const reqTime = new Date(req.timestamp);
      return reqTime >= hourStart && reqTime < hourEnd;
    });

    return {
      hour: hourStart.getHours(),
      calls: hourRequests.length,
      cost: hourRequests.reduce((sum, req) => sum + req.cost, 0),
      saved: hourRequests.reduce((sum, req) => sum + req.saved, 0)
    };
  });

  return {
    timeframe,
    period: {
      start: startTime.toISOString(),
      end: now.toISOString()
    },
    summary: {
      totalCalls,
      totalCost,
      totalSaved,
      averageCost,
      averageSavings,
      savingsPercentage
    },
    providerBreakdown: providerStats,
    hourlyBreakdown,
    rateLimit: checkRateLimit(keyId)
  };
}

// Security audit function
export function auditAPIKeySecurity(keyId: string) {
  const data = apiKeys.get(keyId);
  if (!data) {
    return null;
  }

  const issues: string[] = [];
  const recommendations: string[] = [];

  // Check for suspicious activity
  const recentRequests = data.usage.requests.slice(-100);
  const uniqueIPs = new Set(data.metadata.ipAddresses);
  
  if (uniqueIPs.size > 5) {
    issues.push('Multiple IP addresses detected');
    recommendations.push('Consider IP whitelisting for production use');
  }

  // Check request patterns
  const highVolumeHours = data.usage.requests.reduce((acc, req) => {
    const hour = new Date(req.timestamp).getHours();
    acc[hour] = (acc[hour] || 0) + 1;
    return acc;
  }, {} as Record<number, number>);

  const maxHourlyRequests = Math.max(...Object.values(highVolumeHours));
  if (maxHourlyRequests > 500) {
    issues.push('High volume requests detected');
    recommendations.push('Consider implementing request queuing');
  }

  // Check cost patterns
  const recentCosts = recentRequests.map(req => req.cost);
  const avgCost = recentCosts.reduce((sum, cost) => sum + cost, 0) / recentCosts.length;
  const highCostRequests = recentCosts.filter(cost => cost > avgCost * 5);
  
  if (highCostRequests.length > 10) {
    issues.push('High-cost requests detected');
    recommendations.push('Review request optimization strategies');
  }

  return {
    keyId,
    issues,
    recommendations,
    riskScore: Math.min(100, issues.length * 25),
    lastAudit: new Date().toISOString()
  };
}

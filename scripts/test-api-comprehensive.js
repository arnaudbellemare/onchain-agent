#!/usr/bin/env node

/**
 * Comprehensive API Testing Suite
 * Tests all endpoints, authentication, and production readiness
 */

const https = require('https');
const http = require('http');
const fs = require('fs');
const path = require('path');

// Configuration
const CONFIG = {
  baseUrl: process.env.API_BASE_URL || 'http://localhost:3000',
  testApiKey: null, // Will be generated during tests
  verbose: process.argv.includes('--verbose') || process.argv.includes('-v'),
  timeout: 10000, // 10 seconds
  retries: 3,
};

// Test results tracking
const testResults = {
  passed: 0,
  failed: 0,
  skipped: 0,
  errors: [],
  startTime: Date.now(),
  tests: []
};

// Utility functions
function log(message, type = 'info') {
  const timestamp = new Date().toISOString();
  const colors = {
    info: '\x1b[36m',    // cyan
    success: '\x1b[32m', // green
    warning: '\x1b[33m', // yellow
    error: '\x1b[31m',   // red
    reset: '\x1b[0m'
  };
  
  if (CONFIG.verbose || type === 'error' || type === 'warning') {
    console.log(`${colors[type]}[${timestamp}] ${message}${colors.reset}`);
  }
}

function makeRequest(method, endpoint, data = null, headers = {}) {
  return new Promise((resolve, reject) => {
    const url = new URL(endpoint, CONFIG.baseUrl);
    const isHttps = url.protocol === 'https:';
    const client = isHttps ? https : http;
    
    const options = {
      hostname: url.hostname,
      port: url.port || (isHttps ? 443 : 80),
      path: url.pathname + url.search,
      method,
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'API-Test-Suite/1.0',
        ...headers
      },
      timeout: CONFIG.timeout
    };

    const req = client.request(options, (res) => {
      let responseData = '';
      
      res.on('data', (chunk) => {
        responseData += chunk;
      });
      
      res.on('end', () => {
        try {
          const jsonData = responseData ? JSON.parse(responseData) : null;
          resolve({
            status: res.statusCode,
            headers: res.headers,
            data: jsonData,
            raw: responseData
          });
        } catch (e) {
          resolve({
            status: res.statusCode,
            headers: res.headers,
            data: null,
            raw: responseData
          });
        }
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    req.on('timeout', () => {
      req.destroy();
      reject(new Error('Request timeout'));
    });

    if (data) {
      req.write(JSON.stringify(data));
    }
    
    req.end();
  });
}

async function runTest(testName, testFunction) {
  log(`Running test: ${testName}`, 'info');
  
  try {
    await testFunction();
    testResults.passed++;
    testResults.tests.push({ name: testName, status: 'passed', duration: Date.now() - testResults.startTime });
    log(`✓ ${testName}`, 'success');
  } catch (error) {
    testResults.failed++;
    testResults.errors.push({ test: testName, error: error.message });
    testResults.tests.push({ name: testName, status: 'failed', error: error.message, duration: Date.now() - testResults.startTime });
    log(`✗ ${testName}: ${error.message}`, 'error');
  }
}

async function retryRequest(method, endpoint, data = null, headers = {}) {
  let lastError;
  
  for (let i = 0; i < CONFIG.retries; i++) {
    try {
      return await makeRequest(method, endpoint, data, headers);
    } catch (error) {
      lastError = error;
      if (i < CONFIG.retries - 1) {
        log(`Request failed, retrying (${i + 1}/${CONFIG.retries}): ${error.message}`, 'warning');
        await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1))); // Exponential backoff
      }
    }
  }
  
  throw lastError;
}

// Test functions
async function testHealthEndpoint() {
  const response = await retryRequest('GET', '/api/health');
  
  if (response.status !== 200) {
    throw new Error(`Health endpoint returned status ${response.status}`);
  }
  
  if (!response.data || !response.data.status) {
    throw new Error('Health endpoint response missing status field');
  }
  
  log(`Health status: ${response.data.status}`, 'info');
  
  // Check critical services
  if (response.data.services) {
    if (response.data.services.database && !response.data.services.database.connected) {
      log('Warning: Database not connected', 'warning');
    }
    
    if (response.data.services.cache === null) {
      log('Warning: Cache service not available', 'warning');
    }
  }
}

async function testAPIKeyGeneration() {
  const response = await retryRequest('POST', '/api/v1/keys/initial', {
    name: 'Test API Key',
    permissions: ['read', 'write']
  });
  
  if (response.status !== 200) {
    throw new Error(`API key generation failed with status ${response.status}: ${response.data?.error || 'Unknown error'}`);
  }
  
  if (!response.data || !response.data.success || !response.data.key || !response.data.key.key) {
    throw new Error('API key generation response missing key data');
  }
  
  CONFIG.testApiKey = response.data.key.key;
  log(`Generated API key: ${CONFIG.testApiKey.substring(0, 20)}...`, 'success');
}

async function testAPIKeyValidation() {
  if (!CONFIG.testApiKey) {
    throw new Error('No API key available for validation test');
  }
  
  // Test valid API key
  const response = await retryRequest('GET', '/api/v1', null, {
    'Authorization': `Bearer ${CONFIG.testApiKey}`
  });
  
  if (response.status !== 200) {
    throw new Error(`API key validation failed with status ${response.status}: ${response.data?.error || 'Unknown error'}`);
  }
  
  // Test invalid API key
  const invalidResponse = await retryRequest('GET', '/api/v1', null, {
    'Authorization': 'Bearer invalid_key_123'
  });
  
  if (invalidResponse.status !== 401) {
    throw new Error(`Invalid API key should return 401, got ${invalidResponse.status}`);
  }
  
  log('API key validation working correctly', 'success');
}

async function testV1Endpoints() {
  if (!CONFIG.testApiKey) {
    throw new Error('No API key available for v1 endpoint tests');
  }
  
  const headers = { 'Authorization': `Bearer ${CONFIG.testApiKey}` };
  
  // Test GET /api/v1 (info endpoint)
  const infoResponse = await retryRequest('GET', '/api/v1?action=info', null, headers);
  if (infoResponse.status !== 200) {
    throw new Error(`V1 info endpoint failed with status ${infoResponse.status}`);
  }
  
  // Test POST /api/v1 (optimization endpoint)
  const optimizeResponse = await retryRequest('POST', '/api/v1', {
    action: 'optimize',
    prompt: 'Test prompt for optimization',
    provider: 'openai',
    maxCost: 0.01
  }, headers);
  
  if (optimizeResponse.status !== 200 && optimizeResponse.status !== 400) {
    throw new Error(`V1 optimization endpoint failed with status ${optimizeResponse.status}`);
  }
  
  log('V1 endpoints responding correctly', 'success');
}

async function testCostOptimizationEndpoints() {
  const endpoints = [
    '/api/cost-aware-optimization',
    '/api/comprehensive-optimizer',
    '/api/capo-x402-demo',
    '/api/real-x402-demo'
  ];
  
  for (const endpoint of endpoints) {
    try {
      const response = await retryRequest('GET', endpoint);
      if (response.status !== 200) {
        throw new Error(`Endpoint ${endpoint} returned status ${response.status}`);
      }
      
      if (!response.data || !response.data.success) {
        throw new Error(`Endpoint ${endpoint} response missing success field`);
      }
      
      log(`✓ ${endpoint}`, 'success');
    } catch (error) {
      throw new Error(`Failed to test ${endpoint}: ${error.message}`);
    }
  }
}

async function testIntegrationEndpoints() {
  const endpoints = [
    '/api/integration',
    '/api/gepa-x402-integration',
    '/api/real-integrations-demo',
    '/api/x402-wrapper'
  ];
  
  for (const endpoint of endpoints) {
    try {
      const response = await retryRequest('GET', endpoint);
      // Some endpoints might return 405 for GET, which is acceptable
      if (response.status !== 200 && response.status !== 405) {
        throw new Error(`Endpoint ${endpoint} returned unexpected status ${response.status}`);
      }
      
      log(`✓ ${endpoint}`, 'success');
    } catch (error) {
      throw new Error(`Failed to test ${endpoint}: ${error.message}`);
    }
  }
}

async function testSecurityFeatures() {
  if (!CONFIG.testApiKey) {
    throw new Error('No API key available for security tests');
  }
  
  const headers = { 'Authorization': `Bearer ${CONFIG.testApiKey}` };
  
  // Test rate limiting (make multiple rapid requests)
  log('Testing rate limiting...', 'info');
  const rapidRequests = Array(5).fill().map(() => 
    retryRequest('GET', '/api/v1?action=info', null, headers)
  );
  
  try {
    await Promise.all(rapidRequests);
    log('Rate limiting test completed (no limits hit)', 'info');
  } catch (error) {
    if (error.message.includes('429')) {
      log('Rate limiting working correctly', 'success');
    } else {
      throw error;
    }
  }
  
  // Test security headers
  const response = await retryRequest('GET', '/api/health');
  const securityHeaders = [
    'x-frame-options',
    'x-content-type-options',
    'x-xss-protection',
    'strict-transport-security'
  ];
  
  const missingHeaders = securityHeaders.filter(header => !response.headers[header]);
  if (missingHeaders.length > 0) {
    log(`Warning: Missing security headers: ${missingHeaders.join(', ')}`, 'warning');
  } else {
    log('Security headers present', 'success');
  }
}

async function testErrorHandling() {
  // Test invalid endpoints
  const invalidResponse = await retryRequest('GET', '/api/nonexistent');
  if (invalidResponse.status !== 404) {
    throw new Error(`Invalid endpoint should return 404, got ${invalidResponse.status}`);
  }
  
  // Test malformed requests
  const malformedResponse = await retryRequest('POST', '/api/v1', 'invalid json', {
    'Content-Type': 'application/json'
  });
  
  if (malformedResponse.status !== 400 && malformedResponse.status !== 422) {
    throw new Error(`Malformed request should return 4xx, got ${malformedResponse.status}`);
  }
  
  log('Error handling working correctly', 'success');
}

async function testPerformanceMetrics() {
  const startTime = Date.now();
  const response = await retryRequest('GET', '/api/health');
  const responseTime = Date.now() - startTime;
  
  if (responseTime > 5000) {
    throw new Error(`Health endpoint too slow: ${responseTime}ms`);
  }
  
  log(`Health endpoint response time: ${responseTime}ms`, 'info');
  
  // Check if health response includes performance metrics
  if (response.data && response.data.responseTime) {
    log(`Server-reported response time: ${response.data.responseTime}ms`, 'info');
  }
}

// Main test runner
async function runAllTests() {
  log('Starting comprehensive API test suite...', 'info');
  log(`Testing against: ${CONFIG.baseUrl}`, 'info');
  log(`Verbose mode: ${CONFIG.verbose}`, 'info');
  
  const tests = [
    { name: 'Health Endpoint', fn: testHealthEndpoint },
    { name: 'API Key Generation', fn: testAPIKeyGeneration },
    { name: 'API Key Validation', fn: testAPIKeyValidation },
    { name: 'V1 Endpoints', fn: testV1Endpoints },
    { name: 'Cost Optimization Endpoints', fn: testCostOptimizationEndpoints },
    { name: 'Integration Endpoints', fn: testIntegrationEndpoints },
    { name: 'Security Features', fn: testSecurityFeatures },
    { name: 'Error Handling', fn: testErrorHandling },
    { name: 'Performance Metrics', fn: testPerformanceMetrics }
  ];
  
  for (const test of tests) {
    await runTest(test.name, test.fn);
  }
  
  // Generate report
  const totalTime = Date.now() - testResults.startTime;
  const report = {
    summary: {
      total: testResults.passed + testResults.failed,
      passed: testResults.passed,
      failed: testResults.failed,
      duration: totalTime,
      timestamp: new Date().toISOString()
    },
    tests: testResults.tests,
    errors: testResults.errors,
    config: CONFIG
  };
  
  // Save detailed report
  const reportPath = path.join(__dirname, '..', 'test-results.json');
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
  
  // Print summary
  console.log('\n' + '='.repeat(60));
  console.log('API TEST SUITE RESULTS');
  console.log('='.repeat(60));
  console.log(`Total Tests: ${report.summary.total}`);
  console.log(`Passed: ${report.summary.passed}`);
  console.log(`Failed: ${report.summary.failed}`);
  console.log(`Duration: ${report.summary.duration}ms`);
  console.log(`Report saved to: ${reportPath}`);
  
  if (testResults.errors.length > 0) {
    console.log('\nErrors:');
    testResults.errors.forEach(error => {
      console.log(`  - ${error.test}: ${error.error}`);
    });
  }
  
  console.log('='.repeat(60));
  
  // Exit with appropriate code
  process.exit(testResults.failed > 0 ? 1 : 0);
}

// Handle process termination
process.on('SIGINT', () => {
  log('Test suite interrupted by user', 'warning');
  process.exit(1);
});

process.on('uncaughtException', (error) => {
  log(`Uncaught exception: ${error.message}`, 'error');
  process.exit(1);
});

// Run the tests
if (require.main === module) {
  runAllTests().catch(error => {
    log(`Test suite failed: ${error.message}`, 'error');
    process.exit(1);
  });
}

module.exports = { runAllTests, CONFIG };

#!/usr/bin/env node

const https = require('https');
const http = require('http');

// Test configuration
const BASE_URL = 'http://localhost:3000';
let API_KEY = null;

// Helper function to make HTTP requests
function makeRequest(url, options = {}) {
  return new Promise((resolve, reject) => {
    const urlObj = new URL(url);
    const isHttps = urlObj.protocol === 'https:';
    const client = isHttps ? https : http;
    
    const requestOptions = {
      hostname: urlObj.hostname,
      port: urlObj.port || (isHttps ? 443 : 80),
      path: urlObj.pathname + urlObj.search,
      method: options.method || 'GET',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'OnChain-Agent-Test-Client/1.0',
        ...options.headers
      }
    };

    const req = client.request(requestOptions, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        try {
          const jsonData = JSON.parse(data);
          resolve({ status: res.statusCode, data: jsonData });
        } catch (e) {
          resolve({ status: res.statusCode, data: data });
        }
      });
    });

    req.on('error', reject);
    
    if (options.body) {
      req.write(JSON.stringify(options.body));
    }
    
    req.end();
  });
}

// Test functions
async function testHealthEndpoint() {
  console.log('🔍 Testing Health Endpoint...');
  try {
    const response = await makeRequest(`${BASE_URL}/api/health`);
    console.log(`✅ Health: ${response.status} - ${response.data.status || 'OK'}`);
    return true;
  } catch (error) {
    console.log(`❌ Health failed: ${error.message}`);
    return false;
  }
}

async function testAPIKeyGeneration() {
  console.log('🔑 Testing API Key Generation...');
  try {
    const response = await makeRequest(`${BASE_URL}/api/v1/keys/initial`, {
      method: 'POST',
      body: {
        name: 'Test API Key',
        permissions: ['read', 'write']
      }
    });
    
    if (response.status === 200 && response.data.success) {
      API_KEY = response.data.key.key;
      console.log(`✅ API Key generated: ${API_KEY.substring(0, 20)}...`);
      return true;
    } else {
      console.log(`❌ API Key generation failed: ${response.status} - ${JSON.stringify(response.data)}`);
      return false;
    }
  } catch (error) {
    console.log(`❌ API Key generation error: ${error.message}`);
    return false;
  }
}

async function testOptimizationEndpoint() {
  console.log('⚡ Testing Optimization Endpoint...');
  if (!API_KEY) {
    console.log('❌ No API key available for optimization test');
    return false;
  }
  
  try {
    const response = await makeRequest(`${BASE_URL}/api/v1/optimize`, {
      method: 'POST',
      headers: {
        'X-API-Key': API_KEY
      },
      body: {
        prompt: 'Test optimization prompt',
        maxCost: 1.0,
        provider: 'openai',
        walletAddress: '0x123456789'
      }
    });
    
    if (response.status === 200 && response.data.success) {
      console.log(`✅ Optimization: ${response.data.result.optimization_metrics.cost_reduction} cost reduction`);
      return true;
    } else {
      console.log(`❌ Optimization failed: ${response.status} - ${JSON.stringify(response.data)}`);
      return false;
    }
  } catch (error) {
    console.log(`❌ Optimization error: ${error.message}`);
    return false;
  }
}

async function testChatEndpoint() {
  console.log('💬 Testing Chat Endpoint...');
  if (!API_KEY) {
    console.log('❌ No API key available for chat test');
    return false;
  }
  
  try {
    const response = await makeRequest(`${BASE_URL}/api/v1/chat`, {
      method: 'POST',
      headers: {
        'X-API-Key': API_KEY
      },
      body: {
        message: 'Hello, test chat message',
        walletAddress: '0x123456789'
      }
    });
    
    if (response.status === 200 && response.data.success) {
      console.log(`✅ Chat: ${response.data.result.optimization_metrics.cost_reduction} cost reduction`);
      return true;
    } else {
      console.log(`❌ Chat failed: ${response.status} - ${JSON.stringify(response.data)}`);
      return false;
    }
  } catch (error) {
    console.log(`❌ Chat error: ${error.message}`);
    return false;
  }
}

async function testAPIKeyManagement() {
  console.log('🔧 Testing API Key Management...');
  if (!API_KEY) {
    console.log('❌ No API key available for management test');
    return false;
  }
  
  try {
    const response = await makeRequest(`${BASE_URL}/api/v1/keys`, {
      method: 'GET',
      headers: {
        'X-API-Key': API_KEY
      }
    });
    
    if (response.status === 200 && response.data.success) {
      console.log(`✅ API Key Management: Found ${response.data.data.keys.length} keys`);
      return true;
    } else {
      console.log(`❌ API Key Management failed: ${response.status} - ${JSON.stringify(response.data)}`);
      return false;
    }
  } catch (error) {
    console.log(`❌ API Key Management error: ${error.message}`);
    return false;
  }
}

// Main test runner
async function runTests() {
  console.log('🚀 Starting API Endpoint Tests...\n');
  
  const tests = [
    { name: 'Health Check', fn: testHealthEndpoint },
    { name: 'API Key Generation', fn: testAPIKeyGeneration },
    { name: 'Optimization', fn: testOptimizationEndpoint },
    { name: 'Chat', fn: testChatEndpoint },
    { name: 'API Key Management', fn: testAPIKeyManagement }
  ];
  
  const results = [];
  
  for (const test of tests) {
    console.log(`\n--- ${test.name} ---`);
    const success = await test.fn();
    results.push({ name: test.name, success });
    await new Promise(resolve => setTimeout(resolve, 1000)); // Wait 1 second between tests
  }
  
  // Summary
  console.log('\n' + '='.repeat(50));
  console.log('📊 TEST RESULTS SUMMARY');
  console.log('='.repeat(50));
  
  const passed = results.filter(r => r.success).length;
  const total = results.length;
  
  results.forEach(result => {
    const status = result.success ? '✅ PASS' : '❌ FAIL';
    console.log(`${status} ${result.name}`);
  });
  
  console.log(`\nOverall: ${passed}/${total} tests passed`);
  
  if (API_KEY) {
    console.log(`\n🔑 Generated API Key: ${API_KEY}`);
    console.log('💡 Use this key to test the dashboard and other features');
  }
  
  process.exit(passed === total ? 0 : 1);
}

// Run the tests
runTests().catch(console.error);

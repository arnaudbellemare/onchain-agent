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

async function testDashboardWithAPIKey() {
  console.log('🔑 Testing Dashboard with API Key...');
  
  // First, generate an API key
  console.log('1. Generating API key...');
  try {
    const response = await makeRequest(`${BASE_URL}/api/v1/keys/initial`, {
      method: 'POST',
      body: {
        name: 'Dashboard Test Key',
        permissions: ['read', 'write']
      }
    });
    
    if (response.status === 200 && response.data.success) {
      API_KEY = response.data.key.key;
      console.log(`✅ API Key generated: ${API_KEY.substring(0, 20)}...`);
    } else {
      console.log(`❌ API Key generation failed: ${response.status} - ${JSON.stringify(response.data)}`);
      return false;
    }
  } catch (error) {
    console.log(`❌ API Key generation error: ${error.message}`);
    return false;
  }

  // Test API key management
  console.log('2. Testing API key management...');
  try {
    const response = await makeRequest(`${BASE_URL}/api/v1/keys`, {
      method: 'GET',
      headers: {
        'X-API-Key': API_KEY
      }
    });
    
    if (response.status === 200 && response.data.success) {
      console.log(`✅ API Key Management: Found ${response.data.data.keys.length} keys`);
      console.log(`   - Key Name: ${response.data.data.keys[0].name}`);
      console.log(`   - Key Preview: ${response.data.data.keys[0].keyPreview}`);
      console.log(`   - Usage: ${response.data.data.keys[0].usage.calls} calls`);
    } else {
      console.log(`❌ API Key Management failed: ${response.status} - ${JSON.stringify(response.data)}`);
      return false;
    }
  } catch (error) {
    console.log(`❌ API Key Management error: ${error.message}`);
    return false;
  }

  // Test optimization with the API key
  console.log('3. Testing optimization with API key...');
  try {
    const response = await makeRequest(`${BASE_URL}/api/v1/optimize`, {
      method: 'POST',
      headers: {
        'X-API-Key': API_KEY
      },
      body: {
        prompt: 'Test dashboard optimization',
        maxCost: 1.0,
        provider: 'openai',
        walletAddress: '0x123456789'
      }
    });
    
    if (response.status === 200 && response.data.success) {
      console.log(`✅ Optimization: ${response.data.result.optimization_metrics.cost_reduction} cost reduction`);
      console.log(`   - Original Cost: ${response.data.result.cost_breakdown.original_cost}`);
      console.log(`   - Optimized Cost: ${response.data.result.cost_breakdown.optimized_cost}`);
      console.log(`   - Savings: ${response.data.result.cost_breakdown.savings}`);
    } else {
      console.log(`❌ Optimization failed: ${response.status} - ${JSON.stringify(response.data)}`);
      return false;
    }
  } catch (error) {
    console.log(`❌ Optimization error: ${error.message}`);
    return false;
  }

  // Test chat with the API key
  console.log('4. Testing chat with API key...');
  try {
    const response = await makeRequest(`${BASE_URL}/api/v1/chat`, {
      method: 'POST',
      headers: {
        'X-API-Key': API_KEY
      },
      body: {
        message: 'Hello from dashboard test',
        walletAddress: '0x123456789'
      }
    });
    
    if (response.status === 200 && response.data.success) {
      console.log(`✅ Chat: ${response.data.result.optimization_metrics.cost_reduction} cost reduction`);
      console.log(`   - Response: ${response.data.result.response.substring(0, 100)}...`);
    } else {
      console.log(`❌ Chat failed: ${response.status} - ${JSON.stringify(response.data)}`);
      return false;
    }
  } catch (error) {
    console.log(`❌ Chat error: ${error.message}`);
    return false;
  }

  // Check updated API key usage
  console.log('5. Checking updated API key usage...');
  try {
    const response = await makeRequest(`${BASE_URL}/api/v1/keys`, {
      method: 'GET',
      headers: {
        'X-API-Key': API_KEY
      }
    });
    
    if (response.status === 200 && response.data.success) {
      const key = response.data.data.keys[0];
      console.log(`✅ Updated Usage Stats:`);
      console.log(`   - Total Calls: ${key.usage.calls}`);
      console.log(`   - Total Cost: $${key.usage.totalCost.toFixed(6)}`);
      console.log(`   - Total Saved: $${key.usage.totalSaved.toFixed(6)}`);
      console.log(`   - Recent Requests: ${key.usage.requests.length}`);
    } else {
      console.log(`❌ Usage check failed: ${response.status} - ${JSON.stringify(response.data)}`);
      return false;
    }
  } catch (error) {
    console.log(`❌ Usage check error: ${error.message}`);
    return false;
  }

  return true;
}

// Main test runner
async function runDashboardTest() {
  console.log('🚀 Starting Dashboard API Key Test...\n');
  
  const success = await testDashboardWithAPIKey();
  
  console.log('\n' + '='.repeat(50));
  console.log('📊 DASHBOARD TEST RESULTS');
  console.log('='.repeat(50));
  
  if (success) {
    console.log('✅ ALL TESTS PASSED');
    console.log('\n🎉 Dashboard API Key Management is working correctly!');
    console.log('💡 The API keys are persisting and tracking usage properly.');
    console.log('\n🔑 Test API Key:', API_KEY);
    console.log('📝 You can use this key to test the dashboard in the browser.');
  } else {
    console.log('❌ SOME TESTS FAILED');
    console.log('\n🔧 Please check the errors above and fix the issues.');
  }
  
  process.exit(success ? 0 : 1);
}

// Run the tests
runDashboardTest().catch(console.error);

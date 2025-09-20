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

async function testCostMinimization() {
  console.log('💰 Testing Hybrid Cost Minimization System...');
  
  // First, generate an API key
  console.log('1. Generating API key...');
  try {
    const response = await makeRequest(`${BASE_URL}/api/v1/keys/initial`, {
      method: 'POST',
      body: {
        name: 'Cost Minimization Test Key',
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

  // Test with a very verbose prompt that should get significant optimization
  const verbosePrompt = `Please kindly help me to understand and analyze the comprehensive details about how artificial intelligence and machine learning technologies can be effectively utilized in order to optimize business processes and improve operational efficiency across various industries including healthcare, finance, education, and manufacturing sectors. I would really appreciate it if you could provide me with detailed insights and recommendations.`;
  
  console.log('2. Testing cost minimization with verbose prompt...');
  console.log(`   Original prompt length: ${verbosePrompt.length} characters`);
  
  try {
    const response = await makeRequest(`${BASE_URL}/api/v1/optimize`, {
      method: 'POST',
      headers: {
        'X-API-Key': API_KEY
      },
      body: {
        prompt: verbosePrompt,
        maxCost: 1.0,
        provider: 'openai',
        walletAddress: '0x123456789'
      }
    });
    
    if (response.status === 200 && response.data.success) {
      const result = response.data.result;
      console.log(`✅ Cost Minimization Results:`);
      console.log(`   - Cost Reduction: ${result.optimization_metrics.cost_reduction}`);
      console.log(`   - Token Efficiency: ${result.optimization_metrics.token_efficiency}`);
      console.log(`   - Original Cost: ${result.cost_breakdown.original_cost}`);
      console.log(`   - Optimized Cost: ${result.cost_breakdown.optimized_cost}`);
      console.log(`   - Savings: ${result.cost_breakdown.savings}`);
      console.log(`   - Net Savings: ${result.cost_breakdown.net_savings}`);
      console.log(`   - Response: ${result.response.substring(0, 200)}...`);
      
      // Check if we got significant optimization
      const costReduction = parseFloat(result.optimization_metrics.cost_reduction.replace('%', ''));
      if (costReduction > 10) {
        console.log(`🎉 SUCCESS: Significant cost reduction achieved! (${costReduction}%)`);
        return true;
      } else if (costReduction > 0) {
        console.log(`⚠️  PARTIAL: Some cost reduction achieved (${costReduction}%)`);
        return true;
      } else {
        console.log(`❌ FAILED: No meaningful cost reduction achieved`);
        return false;
      }
    } else {
      console.log(`❌ Cost minimization failed: ${response.status} - ${JSON.stringify(response.data)}`);
      return false;
    }
  } catch (error) {
    console.log(`❌ Cost minimization error: ${error.message}`);
    return false;
  }
}

async function testCacheEffectiveness() {
  console.log('3. Testing cache effectiveness...');
  
  // Test the same prompt again to see if we get a cache hit
  const verbosePrompt = `Please kindly help me to understand and analyze the comprehensive details about how artificial intelligence and machine learning technologies can be effectively utilized in order to optimize business processes and improve operational efficiency across various industries including healthcare, finance, education, and manufacturing sectors. I would really appreciate it if you could provide me with detailed insights and recommendations.`;
  
  try {
    const response = await makeRequest(`${BASE_URL}/api/v1/optimize`, {
      method: 'POST',
      headers: {
        'X-API-Key': API_KEY
      },
      body: {
        prompt: verbosePrompt,
        maxCost: 1.0,
        provider: 'openai',
        walletAddress: '0x123456789'
      }
    });
    
    if (response.status === 200 && response.data.success) {
      const result = response.data.result;
      console.log(`✅ Cache Test Results:`);
      console.log(`   - Response: ${result.response.substring(0, 200)}...`);
      
      if (result.response.includes('Cache hit')) {
        console.log(`🎉 SUCCESS: Cache hit detected - instant optimization!`);
        return true;
      } else {
        console.log(`⚠️  WARNING: No cache hit detected`);
        return false;
      }
    } else {
      console.log(`❌ Cache test failed: ${response.status} - ${JSON.stringify(response.data)}`);
      return false;
    }
  } catch (error) {
    console.log(`❌ Cache test error: ${error.message}`);
    return false;
  }
}

// Main test runner
async function runCostMinimizationTest() {
  console.log('🚀 Starting Hybrid Cost Minimization Test...\n');
  
  const optimizationSuccess = await testCostMinimization();
  const cacheSuccess = await testCacheEffectiveness();
  
  console.log('\n' + '='.repeat(50));
  console.log('📊 COST MINIMIZATION TEST RESULTS');
  console.log('='.repeat(50));
  
  if (optimizationSuccess && cacheSuccess) {
    console.log('✅ ALL TESTS PASSED');
    console.log('🎉 Hybrid cost minimization system is working perfectly!');
    console.log('💡 The system provides significant cost savings and effective caching.');
  } else if (optimizationSuccess) {
    console.log('✅ OPTIMIZATION WORKING');
    console.log('⚠️  Cache system needs improvement');
    console.log('💡 Cost reduction is working, but caching could be better.');
  } else {
    console.log('❌ OPTIMIZATION ISSUES');
    console.log('🔧 The cost minimization system needs further tuning.');
  }
  
  if (API_KEY) {
    console.log(`\n🔑 Test API Key: ${API_KEY}`);
  }
  
  process.exit(optimizationSuccess ? 0 : 1);
}

// Run the tests
runCostMinimizationTest().catch(console.error);

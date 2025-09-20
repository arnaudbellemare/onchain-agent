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

async function testOptimizationWithLongPrompt() {
  console.log('🔑 Testing Optimization with Long Prompt...');
  
  // First, generate an API key
  console.log('1. Generating API key...');
  try {
    const response = await makeRequest(`${BASE_URL}/api/v1/keys/initial`, {
      method: 'POST',
      body: {
        name: 'Optimization Test Key',
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

  // Test with a long prompt that should be optimizable
  const longPrompt = `Please kindly help me to understand and analyze the comprehensive details about how artificial intelligence and machine learning technologies can be effectively utilized in order to optimize business processes and improve operational efficiency across various industries including healthcare, finance, education, and manufacturing sectors. I would really appreciate it if you could provide me with detailed insights and recommendations.`;
  
  console.log('2. Testing optimization with long prompt...');
  console.log(`   Original prompt length: ${longPrompt.length} characters`);
  
  try {
    const response = await makeRequest(`${BASE_URL}/api/v1/optimize`, {
      method: 'POST',
      headers: {
        'X-API-Key': API_KEY
      },
      body: {
        prompt: longPrompt,
        maxCost: 1.0,
        provider: 'openai',
        walletAddress: '0x123456789'
      }
    });
    
    if (response.status === 200 && response.data.success) {
      const result = response.data.result;
      console.log(`✅ Optimization completed:`);
      console.log(`   - Cost Reduction: ${result.optimization_metrics.cost_reduction}`);
      console.log(`   - Token Efficiency: ${result.optimization_metrics.token_efficiency}`);
      console.log(`   - Original Cost: ${result.cost_breakdown.original_cost}`);
      console.log(`   - Optimized Cost: ${result.cost_breakdown.optimized_cost}`);
      console.log(`   - Savings: ${result.cost_breakdown.savings}`);
      console.log(`   - Net Savings: ${result.cost_breakdown.net_savings}`);
      
      // Check if we got real optimization
      const costReduction = parseFloat(result.optimization_metrics.cost_reduction.replace('%', ''));
      if (costReduction > 0) {
        console.log(`🎉 SUCCESS: Real cost reduction achieved!`);
        return true;
      } else {
        console.log(`⚠️  WARNING: No cost reduction achieved`);
        return false;
      }
    } else {
      console.log(`❌ Optimization failed: ${response.status} - ${JSON.stringify(response.data)}`);
      return false;
    }
  } catch (error) {
    console.log(`❌ Optimization error: ${error.message}`);
    return false;
  }
}

// Main test runner
async function runOptimizationTest() {
  console.log('🚀 Starting Optimization Test with Long Prompt...\n');
  
  const success = await testOptimizationWithLongPrompt();
  
  console.log('\n' + '='.repeat(50));
  console.log('📊 OPTIMIZATION TEST RESULTS');
  console.log('='.repeat(50));
  
  if (success) {
    console.log('✅ OPTIMIZATION WORKING: Real cost reduction achieved!');
    console.log('💡 The CAPO and hybrid optimization systems are functioning correctly.');
  } else {
    console.log('❌ OPTIMIZATION ISSUE: No cost reduction achieved');
    console.log('🔧 The optimization system needs further tuning.');
  }
  
  if (API_KEY) {
    console.log(`\n🔑 Test API Key: ${API_KEY}`);
  }
  
  process.exit(success ? 0 : 1);
}

// Run the tests
runOptimizationTest().catch(console.error);

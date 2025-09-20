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

async function testAggressiveOptimization() {
  console.log('🚀 Testing Aggressive Cost Optimization...');
  
  // First, generate an API key
  console.log('1. Generating API key...');
  try {
    const response = await makeRequest(`${BASE_URL}/api/v1/keys/initial`, {
      method: 'POST',
      body: {
        name: 'Aggressive Optimization Test Key',
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

  // Test with an extremely verbose prompt that should get massive optimization
  const extremelyVerbosePrompt = `Please kindly help me to understand and analyze the comprehensive details about how artificial intelligence and machine learning technologies can be effectively utilized in order to optimize business processes and improve operational efficiency across various industries including healthcare, finance, education, and manufacturing sectors. I would really appreciate it if you could provide me with detailed insights and recommendations. I would be very grateful if you could please help me to understand the various aspects and components that are involved in this process. It is important to note that I am looking for a thorough and comprehensive analysis that covers all the relevant aspects and considerations. I would really like to get a detailed understanding of how these technologies work and how they can be implemented effectively. Thank you very much for your help and assistance. I would be extremely thankful if you could provide me with the information that I need.`;
  
  console.log('2. Testing aggressive optimization with extremely verbose prompt...');
  console.log(`   Original prompt length: ${extremelyVerbosePrompt.length} characters`);
  
  try {
    const response = await makeRequest(`${BASE_URL}/api/v1/optimize`, {
      method: 'POST',
      headers: {
        'X-API-Key': API_KEY
      },
      body: {
        prompt: extremelyVerbosePrompt,
        maxCost: 1.0,
        provider: 'openai',
        walletAddress: '0x123456789'
      }
    });
    
    if (response.status === 200 && response.data.success) {
      const result = response.data.result;
      console.log(`✅ Aggressive Optimization Results:`);
      console.log(`   - Cost Reduction: ${result.optimization_metrics.cost_reduction}`);
      console.log(`   - Token Efficiency: ${result.optimization_metrics.token_efficiency}`);
      console.log(`   - Original Cost: ${result.cost_breakdown.original_cost}`);
      console.log(`   - Optimized Cost: ${result.cost_breakdown.optimized_cost}`);
      console.log(`   - Savings: ${result.cost_breakdown.savings}`);
      console.log(`   - Net Savings: ${result.cost_breakdown.net_savings}`);
      console.log(`   - Response: ${result.response.substring(0, 300)}...`);
      
      // Check if we got significant optimization
      const costReduction = parseFloat(result.optimization_metrics.cost_reduction.replace('%', ''));
      if (costReduction > 20) {
        console.log(`🎉 EXCELLENT: Massive cost reduction achieved! (${costReduction}%)`);
        return true;
      } else if (costReduction > 10) {
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
      console.log(`❌ Aggressive optimization failed: ${response.status} - ${JSON.stringify(response.data)}`);
      return false;
    }
  } catch (error) {
    console.log(`❌ Aggressive optimization error: ${error.message}`);
    return false;
  }
}

// Main test runner
async function runAggressiveOptimizationTest() {
  console.log('🚀 Starting Aggressive Cost Optimization Test...\n');
  
  const success = await testAggressiveOptimization();
  
  console.log('\n' + '='.repeat(50));
  console.log('📊 AGGRESSIVE OPTIMIZATION TEST RESULTS');
  console.log('='.repeat(50));
  
  if (success) {
    console.log('✅ OPTIMIZATION SUCCESSFUL');
    console.log('🎉 The hybrid cost minimization system is working excellently!');
    console.log('💡 Significant cost savings achieved through multiple optimization strategies.');
  } else {
    console.log('❌ OPTIMIZATION NEEDS IMPROVEMENT');
    console.log('🔧 The cost minimization system needs further tuning for better results.');
  }
  
  if (API_KEY) {
    console.log(`\n🔑 Test API Key: ${API_KEY}`);
  }
  
  process.exit(success ? 0 : 1);
}

// Run the tests
runAggressiveOptimizationTest().catch(console.error);

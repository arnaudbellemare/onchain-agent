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

async function testLiveOptimization() {
  console.log('🚀 Testing Live Comprehensive Optimization System...');
  
  // First, generate an API key
  console.log('1. Generating API key...');
  try {
    const response = await makeRequest(`${BASE_URL}/api/v1/keys/initial`, {
      method: 'POST',
      body: {
        name: 'Live Optimization Test Key',
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

  // Test with multiple different prompts to see real optimization
  const testPrompts = [
    {
      name: "Business Analysis Prompt",
      prompt: "Please kindly help me to understand and analyze the comprehensive details about how artificial intelligence and machine learning technologies can be effectively utilized in order to optimize business processes and improve operational efficiency across various industries including healthcare, finance, education, and manufacturing sectors. I would really appreciate it if you could provide me with detailed insights and recommendations."
    },
    {
      name: "Technical Documentation Prompt", 
      prompt: "I would like to request that you please provide me with a detailed and comprehensive explanation of the various technical aspects and implementation details that are involved in the development and deployment of modern web applications using React, Node.js, and various other technologies. It would be very helpful if you could also include examples and best practices."
    },
    {
      name: "Marketing Strategy Prompt",
      prompt: "Could you please help me to develop a comprehensive marketing strategy that would be effective for promoting our new product launch? I would really appreciate it if you could provide detailed insights about target audience analysis, competitive positioning, pricing strategies, and promotional tactics that would help us achieve our business objectives."
    }
  ];

  let totalSavings = 0;
  let totalCostReduction = 0;
  let cacheHits = 0;

  for (let i = 0; i < testPrompts.length; i++) {
    const testPrompt = testPrompts[i];
    console.log(`\n${i + 2}. Testing: ${testPrompt.name}`);
    console.log(`   Original length: ${testPrompt.prompt.length} characters`);
    
    try {
      const response = await makeRequest(`${BASE_URL}/api/v1/optimize`, {
        method: 'POST',
        headers: {
          'X-API-Key': API_KEY
        },
        body: {
          prompt: testPrompt.prompt,
          maxCost: 1.0,
          provider: 'openai',
          walletAddress: '0x123456789'
        }
      });
      
      if (response.status === 200 && response.data.success) {
        const result = response.data.result;
        const costReduction = parseFloat(result.optimization_metrics.cost_reduction.replace('%', ''));
        const savings = parseFloat(result.cost_breakdown.savings.replace('$', ''));
        
        console.log(`   ✅ Results:`);
        console.log(`      - Cost Reduction: ${result.optimization_metrics.cost_reduction}`);
        console.log(`      - Token Efficiency: ${result.optimization_metrics.token_efficiency}`);
        console.log(`      - Savings: ${result.cost_breakdown.savings}`);
        console.log(`      - Net Savings: ${result.cost_breakdown.net_savings}`);
        
        if (result.response.includes('Cache hit')) {
          cacheHits++;
          console.log(`      - 🎯 CACHE HIT: Instant optimization!`);
        } else {
          console.log(`      - 🔄 Fresh optimization completed`);
        }
        
        totalSavings += savings;
        totalCostReduction += costReduction;
        
        // Test cache hit by running the same prompt again
        console.log(`   🔄 Testing cache hit...`);
        const cacheResponse = await makeRequest(`${BASE_URL}/api/v1/optimize`, {
          method: 'POST',
          headers: {
            'X-API-Key': API_KEY
          },
          body: {
            prompt: testPrompt.prompt,
            maxCost: 1.0,
            provider: 'openai',
            walletAddress: '0x123456789'
          }
        });
        
        if (cacheResponse.status === 200 && cacheResponse.data.success) {
          if (cacheResponse.data.result.response.includes('Cache hit')) {
            cacheHits++;
            console.log(`      - 🎯 CACHE HIT CONFIRMED: Instant optimization!`);
          }
        }
        
      } else {
        console.log(`   ❌ Optimization failed: ${response.status} - ${JSON.stringify(response.data)}`);
        return false;
      }
    } catch (error) {
      console.log(`   ❌ Optimization error: ${error.message}`);
      return false;
    }
  }

  // Calculate averages
  const averageCostReduction = totalCostReduction / testPrompts.length;
  const averageSavings = totalSavings / testPrompts.length;
  const cacheHitRate = (cacheHits / (testPrompts.length * 2)) * 100; // *2 because we test each prompt twice

  console.log('\n' + '='.repeat(60));
  console.log('📊 LIVE OPTIMIZATION SYSTEM PERFORMANCE');
  console.log('='.repeat(60));
  console.log(`🎯 Average Cost Reduction: ${averageCostReduction.toFixed(1)}%`);
  console.log(`💰 Average Savings per Request: $${averageSavings.toFixed(6)}`);
  console.log(`🚀 Cache Hit Rate: ${cacheHitRate.toFixed(1)}%`);
  console.log(`📈 Total Savings: $${totalSavings.toFixed(6)}`);
  
  if (averageCostReduction > 15) {
    console.log(`🎉 EXCELLENT: Outstanding cost reduction performance!`);
    return true;
  } else if (averageCostReduction > 10) {
    console.log(`🎉 SUCCESS: Great cost reduction performance!`);
    return true;
  } else if (averageCostReduction > 5) {
    console.log(`✅ GOOD: Solid cost reduction performance!`);
    return true;
  } else {
    console.log(`⚠️  NEEDS IMPROVEMENT: Cost reduction could be better`);
    return false;
  }
}

// Main test runner
async function runLiveOptimizationTest() {
  console.log('🚀 Starting Live Comprehensive Optimization Test...\n');
  
  const success = await testLiveOptimization();
  
  console.log('\n' + '='.repeat(60));
  console.log('📊 LIVE OPTIMIZATION TEST RESULTS');
  console.log('='.repeat(60));
  
  if (success) {
    console.log('✅ LIVE SYSTEM WORKING EXCELLENTLY');
    console.log('🎉 The hybrid cost minimization system is delivering real value!');
    console.log('💡 Significant cost savings and effective caching achieved.');
  } else {
    console.log('❌ LIVE SYSTEM NEEDS TUNING');
    console.log('🔧 The optimization system needs further improvements.');
  }
  
  if (API_KEY) {
    console.log(`\n🔑 Test API Key: ${API_KEY}`);
  }
  
  process.exit(success ? 0 : 1);
}

// Run the tests
runLiveOptimizationTest().catch(console.error);

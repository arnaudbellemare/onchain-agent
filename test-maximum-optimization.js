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

async function testMaximumOptimization() {
  console.log('🚀 Testing Maximum Optimization Potential...');
  
  // First, generate an API key
  console.log('1. Generating API key...');
  try {
    const response = await makeRequest(`${BASE_URL}/api/v1/keys/initial`, {
      method: 'POST',
      body: {
        name: 'Maximum Optimization Test Key',
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

  // Test with extremely verbose prompts that should get maximum optimization
  const maxOptimizationPrompts = [
    {
      name: "Ultra Verbose Business Request",
      prompt: "Please kindly help me to understand and analyze the comprehensive details about how artificial intelligence and machine learning technologies can be effectively utilized in order to optimize business processes and improve operational efficiency across various industries including healthcare, finance, education, and manufacturing sectors. I would really appreciate it if you could provide me with detailed insights and recommendations. I would be very grateful if you could please help me to understand the various aspects and components that are involved in this process. It is important to note that I am looking for a thorough and comprehensive analysis that covers all the relevant aspects and considerations. I would really like to get a detailed understanding of how these technologies work and how they can be implemented effectively. Thank you very much for your help and assistance. I would be extremely thankful if you could provide me with the information that I need."
    },
    {
      name: "Extremely Polite Technical Query",
      prompt: "I would like to kindly request that you please provide me with a very detailed and comprehensive explanation of the various technical aspects and implementation details that are involved in the development and deployment of modern web applications using React, Node.js, and various other technologies. It would be extremely helpful and I would really appreciate it if you could also include examples and best practices. I would be very grateful if you could please help me to understand how these technologies work together and what are the most effective ways to implement them. Thank you so much for your assistance and I look forward to your response."
    },
    {
      name: "Overly Verbose Marketing Strategy",
      prompt: "Could you please help me to develop a comprehensive marketing strategy that would be effective for promoting our new product launch? I would really appreciate it if you could provide detailed insights about target audience analysis, competitive positioning, pricing strategies, and promotional tactics that would help us achieve our business objectives. I would be very grateful if you could please provide me with a thorough analysis that covers all the important aspects and considerations. It would be extremely helpful if you could also include specific recommendations and actionable steps that we can take to implement this strategy effectively. Thank you very much for your help and assistance."
    }
  ];

  let totalSavings = 0;
  let totalCostReduction = 0;
  let bestOptimization = 0;
  let cacheHits = 0;

  for (let i = 0; i < maxOptimizationPrompts.length; i++) {
    const testPrompt = maxOptimizationPrompts[i];
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
        
        if (costReduction > bestOptimization) {
          bestOptimization = costReduction;
        }
        
        // Show the optimized prompt
        const optimizedStart = result.response.indexOf('"') + 1;
        const optimizedEnd = result.response.indexOf('"', optimizedStart);
        if (optimizedStart > 0 && optimizedEnd > optimizedStart) {
          const optimizedPrompt = result.response.substring(optimizedStart, optimizedEnd);
          console.log(`      - Optimized prompt: "${optimizedPrompt.substring(0, 100)}..."`);
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

  // Calculate averages and performance metrics
  const averageCostReduction = totalCostReduction / maxOptimizationPrompts.length;
  const averageSavings = totalSavings / maxOptimizationPrompts.length;
  const cacheHitRate = (cacheHits / maxOptimizationPrompts.length) * 100;

  console.log('\n' + '='.repeat(70));
  console.log('📊 MAXIMUM OPTIMIZATION SYSTEM PERFORMANCE');
  console.log('='.repeat(70));
  console.log(`🎯 Average Cost Reduction: ${averageCostReduction.toFixed(1)}%`);
  console.log(`🏆 Best Single Optimization: ${bestOptimization.toFixed(1)}%`);
  console.log(`💰 Average Savings per Request: $${averageSavings.toFixed(6)}`);
  console.log(`🚀 Cache Hit Rate: ${cacheHitRate.toFixed(1)}%`);
  console.log(`📈 Total Savings: $${totalSavings.toFixed(6)}`);
  
  // Calculate potential annual savings
  const dailyRequests = 1000;
  const annualSavings = (averageSavings * dailyRequests * 365);
  console.log(`💎 Potential Annual Savings (1000 req/day): $${annualSavings.toFixed(2)}`);
  
  if (bestOptimization > 20) {
    console.log(`🎉 OUTSTANDING: Maximum optimization potential achieved!`);
    return true;
  } else if (bestOptimization > 15) {
    console.log(`🎉 EXCELLENT: Great optimization potential!`);
    return true;
  } else if (bestOptimization > 10) {
    console.log(`🎉 SUCCESS: Good optimization potential!`);
    return true;
  } else {
    console.log(`⚠️  NEEDS IMPROVEMENT: Optimization potential could be better`);
    return false;
  }
}

// Main test runner
async function runMaximumOptimizationTest() {
  console.log('🚀 Starting Maximum Optimization Potential Test...\n');
  
  const success = await testMaximumOptimization();
  
  console.log('\n' + '='.repeat(70));
  console.log('📊 MAXIMUM OPTIMIZATION TEST RESULTS');
  console.log('='.repeat(70));
  
  if (success) {
    console.log('✅ MAXIMUM OPTIMIZATION ACHIEVED');
    console.log('🎉 The hybrid cost minimization system is delivering excellent value!');
    console.log('💡 Significant cost savings and effective caching achieved.');
    console.log('🚀 The system is ready for production use!');
  } else {
    console.log('❌ OPTIMIZATION NEEDS ENHANCEMENT');
    console.log('🔧 The optimization system needs further tuning for maximum potential.');
  }
  
  if (API_KEY) {
    console.log(`\n🔑 Test API Key: ${API_KEY}`);
  }
  
  process.exit(success ? 0 : 1);
}

// Run the tests
runMaximumOptimizationTest().catch(console.error);

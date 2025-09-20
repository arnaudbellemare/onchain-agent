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

async function testFeeStructure() {
  console.log('💰 Testing Fixed Fee Structure...');
  
  // First, generate an API key
  console.log('1. Generating API key...');
  try {
    const response = await makeRequest(`${BASE_URL}/api/v1/keys/initial`, {
      method: 'POST',
      body: {
        name: 'Fee Structure Test Key',
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

  // Test with a verbose prompt to see the fee structure
  const testPrompt = "Please kindly help me to understand and analyze the comprehensive details about how artificial intelligence and machine learning technologies can be effectively utilized in order to optimize business processes and improve operational efficiency across various industries including healthcare, finance, education, and manufacturing sectors. I would really appreciate it if you could provide me with detailed insights and recommendations.";
  
  console.log('2. Testing fee structure with verbose prompt...');
  console.log(`   Original prompt length: ${testPrompt.length} characters`);
  
  try {
    const response = await makeRequest(`${BASE_URL}/api/v1/optimize`, {
      method: 'POST',
      headers: {
        'X-API-Key': API_KEY
      },
      body: {
        prompt: testPrompt,
        maxCost: 1.0,
        provider: 'openai',
        walletAddress: '0x123456789'
      }
    });
    
    if (response.status === 200 && response.data.success) {
      const result = response.data.result;
      const costBreakdown = result.cost_breakdown;
      
      console.log(`✅ Fee Structure Analysis:`);
      console.log(`   - Original Cost: ${costBreakdown.original_cost}`);
      console.log(`   - Optimized Cost: ${costBreakdown.optimized_cost}`);
      console.log(`   - Savings: ${costBreakdown.savings}`);
      console.log(`   - Our Fee: ${costBreakdown.our_fee}`);
      console.log(`   - Total Charged: ${costBreakdown.total_charged}`);
      console.log(`   - Net Savings: ${costBreakdown.net_savings}`);
      
      // Parse the values to check if net savings is positive
      const netSavings = parseFloat(costBreakdown.net_savings.replace('$', ''));
      const savings = parseFloat(costBreakdown.savings.replace('$', ''));
      const ourFee = parseFloat(costBreakdown.our_fee.replace('$', ''));
      
      console.log(`\n📊 Fee Structure Validation:`);
      console.log(`   - Savings: $${savings.toFixed(6)}`);
      console.log(`   - Our Fee: $${ourFee.toFixed(6)}`);
      console.log(`   - Net Savings: $${netSavings.toFixed(6)}`);
      
      if (netSavings > 0) {
        console.log(`   ✅ SUCCESS: Net savings is positive!`);
        console.log(`   🎉 Users are actually saving money!`);
        return true;
      } else if (netSavings === 0) {
        console.log(`   ⚠️  NEUTRAL: Net savings is zero (break-even)`);
        return true;
      } else {
        console.log(`   ❌ PROBLEM: Net savings is still negative`);
        console.log(`   🔧 Fee structure needs further adjustment`);
        return false;
      }
      
    } else {
      console.log(`❌ Fee structure test failed: ${response.status} - ${JSON.stringify(response.data)}`);
      return false;
    }
  } catch (error) {
    console.log(`❌ Fee structure test error: ${error.message}`);
    return false;
  }
}

// Main test runner
async function runFeeStructureTest() {
  console.log('🚀 Starting Fee Structure Test...\n');
  
  const success = await testFeeStructure();
  
  console.log('\n' + '='.repeat(60));
  console.log('📊 FEE STRUCTURE TEST RESULTS');
  console.log('='.repeat(60));
  
  if (success) {
    console.log('✅ FEE STRUCTURE FIXED');
    console.log('🎉 Net savings are now positive or neutral!');
    console.log('💡 Users are actually benefiting from the optimization.');
  } else {
    console.log('❌ FEE STRUCTURE STILL NEEDS WORK');
    console.log('🔧 The fee calculation needs further refinement.');
  }
  
  if (API_KEY) {
    console.log(`\n🔑 Test API Key: ${API_KEY}`);
  }
  
  process.exit(success ? 0 : 1);
}

// Run the tests
runFeeStructureTest().catch(console.error);

#!/usr/bin/env node

/**
 * Quick API Test Script
 * Fast validation that API is working before full testing
 */

const http = require('http');
const https = require('https');

const CONFIG = {
  baseUrl: process.env.API_BASE_URL || 'http://localhost:3000',
  timeout: 5000,
};

function log(message, type = 'info') {
  const colors = {
    info: '\x1b[36m', success: '\x1b[32m', warning: '\x1b[33m', error: '\x1b[31m', reset: '\x1b[0m'
  };
  console.log(`${colors[type]}${message}${colors.reset}`);
}

function makeRequest(endpoint) {
  return new Promise((resolve, reject) => {
    const url = new URL(endpoint, CONFIG.baseUrl);
    const client = url.protocol === 'https:' ? https : http;
    
    const req = client.request({
      hostname: url.hostname,
      port: url.port || (url.protocol === 'https:' ? 443 : 80),
      path: url.pathname,
      method: 'GET',
      timeout: CONFIG.timeout
    }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const json = JSON.parse(data);
          resolve({ status: res.statusCode, data: json });
        } catch {
          resolve({ status: res.statusCode, data: null });
        }
      });
    });
    
    req.on('error', reject);
    req.on('timeout', () => {
      req.destroy();
      reject(new Error('Timeout'));
    });
    
    req.end();
  });
}

async function quickTest() {
  log('🚀 Quick API Test Starting...', 'info');
  
  try {
    // Test health endpoint
    log('Testing health endpoint...', 'info');
    const health = await makeRequest('/api/health');
    
    if (health.status !== 200) {
      throw new Error(`Health endpoint failed: ${health.status}`);
    }
    
    log(`✓ Health: ${health.data?.status || 'OK'}`, 'success');
    
    // Test API key generation
    log('Testing API key generation...', 'info');
    const keyResponse = await new Promise((resolve, reject) => {
      const url = new URL('/api/v1/keys/initial', CONFIG.baseUrl);
      const client = url.protocol === 'https:' ? https : http;
      
      const postData = JSON.stringify({
        name: 'Quick Test Key',
        permissions: ['read', 'write']
      });
      
      const req = client.request({
        hostname: url.hostname,
        port: url.port || (url.protocol === 'https:' ? 443 : 80),
        path: url.pathname,
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        timeout: CONFIG.timeout
      }, (res) => {
        let data = '';
        res.on('data', chunk => data += chunk);
        res.on('end', () => {
          try {
            resolve({ status: res.statusCode, data: JSON.parse(data) });
          } catch {
            resolve({ status: res.statusCode, data: null });
          }
        });
      });
      
      req.on('error', reject);
      req.on('timeout', () => {
        req.destroy();
        reject(new Error('Timeout'));
      });
      
      req.write(postData);
      req.end();
    });
    
    if (keyResponse.status !== 200) {
      throw new Error(`API key generation failed: ${keyResponse.status}`);
    }
    
    if (!keyResponse.data?.success || !keyResponse.data?.key?.key) {
      throw new Error('API key generation response invalid');
    }
    
    const apiKey = keyResponse.data.key.key;
    log(`✓ API Key generated: ${apiKey.substring(0, 20)}...`, 'success');
    
    // Test API key validation
    log('Testing API key validation...', 'info');
    const validationResponse = await new Promise((resolve, reject) => {
      const url = new URL('/api/v1?action=info', CONFIG.baseUrl);
      const client = url.protocol === 'https:' ? https : http;
      
      const req = client.request({
        hostname: url.hostname,
        port: url.port || (url.protocol === 'https:' ? 443 : 80),
        path: url.pathname,
        method: 'GET',
        headers: { 'X-API-Key': apiKey },
        timeout: CONFIG.timeout
      }, (res) => {
        let data = '';
        res.on('data', chunk => data += chunk);
        res.on('end', () => {
          try {
            resolve({ status: res.statusCode, data: JSON.parse(data) });
          } catch {
            resolve({ status: res.statusCode, data: null });
          }
        });
      });
      
      req.on('error', reject);
      req.on('timeout', () => {
        req.destroy();
        reject(new Error('Timeout'));
      });
      
      req.end();
    });
    
    if (validationResponse.status !== 200) {
      throw new Error(`API key validation failed: ${validationResponse.status}`);
    }
    
    log('✓ API key validation successful', 'success');
    
    log('\n🎉 Quick test completed successfully!', 'success');
    log('API is ready for production deployment.', 'success');
    log('\nRun full test suite: node scripts/test-api-comprehensive.js', 'info');
    log('Run production check: node scripts/production-readiness-check.js', 'info');
    
  } catch (error) {
    log(`\n❌ Quick test failed: ${error.message}`, 'error');
    log('Check that the server is running and accessible.', 'warning');
    process.exit(1);
  }
}

if (require.main === module) {
  quickTest();
}

module.exports = { quickTest };

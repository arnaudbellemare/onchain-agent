#!/usr/bin/env node

/**
 * Simple Supabase Connection Test
 * Tests basic connectivity without RLS complications
 */

const { createClient } = require('@supabase/supabase-js');

// Load environment variables
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;

console.log('🔌 Simple Supabase Connection Test...\n');

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Missing Supabase credentials!');
  console.log('Please add these to your .env.local file:');
  console.log('SUPABASE_URL=https://your-project.supabase.co');
  console.log('SUPABASE_ANON_KEY=your-anon-key');
  process.exit(1);
}

console.log(`📡 Connecting to: ${supabaseUrl}`);

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testConnection() {
  try {
    // Test 1: Basic connection
    console.log('1️⃣ Testing basic connection...');
    const { data, error } = await supabase.from('users').select('count').limit(1);
    
    if (error) {
      console.error('❌ Connection failed:', error.message);
      return;
    }
    
    console.log('✅ Basic connection successful!');
    
    // Test 2: Check if tables exist
    console.log('\n2️⃣ Checking database schema...');
    
    const tables = ['users', 'api_keys', 'api_usage', 'rate_limits'];
    
    for (const table of tables) {
      try {
        const { error } = await supabase.from(table).select('*').limit(1);
        if (error) {
          console.log(`❌ Table '${table}' not found or not accessible`);
        } else {
          console.log(`✅ Table '${table}' exists and accessible`);
        }
      } catch (err) {
        console.log(`❌ Table '${table}' error: ${err.message}`);
      }
    }
    
    // Test 3: Check RLS status
    console.log('\n3️⃣ Checking Row Level Security...');
    try {
      // Try to insert without authentication (should fail if RLS is working)
      const { error } = await supabase
        .from('users')
        .insert({ email: 'test@example.com', name: 'Test User' });
      
      if (error && error.message.includes('row-level security')) {
        console.log('✅ Row Level Security is enabled (good for production)');
      } else if (error) {
        console.log(`⚠️  RLS may not be configured properly: ${error.message}`);
      } else {
        console.log('⚠️  RLS appears to be disabled (not secure for production)');
      }
    } catch (err) {
      console.log(`⚠️  Could not test RLS: ${err.message}`);
    }
    
    console.log('\n🎉 Supabase connection test completed!');
    console.log('\nNext steps:');
    console.log('1. Run the database schema in Supabase SQL Editor');
    console.log('2. Test API endpoints: npm run test:quick');
    console.log('3. Check health endpoint: curl http://localhost:3001/api/health');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    process.exit(1);
  }
}

testConnection();

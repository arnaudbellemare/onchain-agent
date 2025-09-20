#!/usr/bin/env node

/**
 * Test Supabase Connection
 * Quick test to verify Supabase is working
 */

const { createClient } = require('@supabase/supabase-js');

// Load environment variables
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;

console.log('🔌 Testing Supabase Connection...\n');

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
    
    // Test 2: Create a test user
    console.log('\n2️⃣ Creating test user...');
    const testUser = {
      email: `test-user-${Date.now()}@example.com`,
      name: 'Test User',
      is_active: true
    };
    
    const { data: userData, error: userError } = await supabase
      .from('users')
      .insert(testUser)
      .select()
      .single();
    
    if (userError) {
      console.error('❌ User creation failed:', userError.message);
      return;
    }
    
    console.log('✅ Test user created:', userData.email);
    
    // Test 3: Create a test API key
    console.log('\n3️⃣ Creating test API key...');
    const testApiKey = {
      user_id: userData.id,
      name: 'Test API Key',
      key_hash: 'test-hash-' + Date.now(),
      permissions: ['read', 'write'],
      is_active: true
    };
    
    const { data: keyData, error: keyError } = await supabase
      .from('api_keys')
      .insert(testApiKey)
      .select()
      .single();
    
    if (keyError) {
      console.error('❌ API key creation failed:', keyError.message);
      return;
    }
    
    console.log('✅ Test API key created:', keyData.name);
    
    // Test 4: Query the data back
    console.log('\n4️⃣ Testing data retrieval...');
    const { data: retrievedKeys, error: retrieveError } = await supabase
      .from('api_keys')
      .select(`
        id,
        name,
        is_active,
        users!inner(email, name)
      `)
      .eq('user_id', userData.id);
    
    if (retrieveError) {
      console.error('❌ Data retrieval failed:', retrieveError.message);
      return;
    }
    
    console.log('✅ Data retrieved successfully!');
    console.log('📊 Retrieved keys:', retrievedKeys.length);
    
    // Clean up test data
    console.log('\n🧹 Cleaning up test data...');
    await supabase.from('api_keys').delete().eq('user_id', userData.id);
    await supabase.from('users').delete().eq('id', userData.id);
    console.log('✅ Test data cleaned up');
    
    console.log('\n🎉 Supabase connection test PASSED!');
    console.log('Your database is ready for production!');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    process.exit(1);
  }
}

testConnection();

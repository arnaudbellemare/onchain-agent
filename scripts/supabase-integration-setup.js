#!/usr/bin/env node

/**
 * Supabase Integration Setup Script
 * Prepares the application for Supabase self-hosted database integration
 */

const fs = require('fs');
const path = require('path');

const CONFIG = {
  verbose: process.argv.includes('--verbose') || process.argv.includes('-v'),
  force: process.argv.includes('--force'),
};

function log(message, type = 'info') {
  const colors = {
    info: '\x1b[36m', success: '\x1b[32m', warning: '\x1b[33m', error: '\x1b[31m', reset: '\x1b[0m'
  };
  console.log(`${colors[type]}${message}${colors.reset}`);
}

function createSupabaseConfig() {
  const configContent = `import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase configuration. Please set SUPABASE_URL and SUPABASE_ANON_KEY environment variables.');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false
  },
  db: {
    schema: 'public'
  }
});

export default supabase;
`;

  const configPath = path.join(process.cwd(), 'src/lib/supabase.ts');
  
  if (fs.existsSync(configPath) && !CONFIG.force) {
    log('Supabase config already exists. Use --force to overwrite.', 'warning');
    return;
  }
  
  fs.writeFileSync(configPath, configContent);
  log('✓ Created Supabase configuration', 'success');
}

function createDatabaseSchema() {
  const schemaContent = `-- Supabase Database Schema for Onchain Agent
-- Run this in your Supabase SQL editor

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Users table
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    name VARCHAR(255),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- API Keys table
CREATE TABLE IF NOT EXISTS api_keys (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    key_hash VARCHAR(255) NOT NULL UNIQUE,
    permissions JSONB DEFAULT '[]',
    expires_at TIMESTAMP WITH TIME ZONE,
    last_used TIMESTAMP WITH TIME ZONE,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- API Usage tracking
CREATE TABLE IF NOT EXISTS api_usage (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    api_key_id UUID NOT NULL REFERENCES api_keys(id) ON DELETE CASCADE,
    endpoint VARCHAR(255) NOT NULL,
    method VARCHAR(10) NOT NULL,
    cost DECIMAL(10,6) DEFAULT 0,
    saved DECIMAL(10,6) DEFAULT 0,
    provider VARCHAR(100),
    response_time INTEGER,
    status_code INTEGER,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Rate limiting
CREATE TABLE IF NOT EXISTS rate_limits (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    identifier VARCHAR(255) NOT NULL, -- IP or API key
    endpoint VARCHAR(255) NOT NULL,
    request_count INTEGER DEFAULT 1,
    window_start TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_api_keys_key_hash ON api_keys(key_hash);
CREATE INDEX IF NOT EXISTS idx_api_keys_user_id ON api_keys(user_id);
CREATE INDEX IF NOT EXISTS idx_api_keys_expires_at ON api_keys(expires_at);
CREATE INDEX IF NOT EXISTS idx_api_usage_api_key_id ON api_usage(api_key_id);
CREATE INDEX IF NOT EXISTS idx_api_usage_created_at ON api_usage(created_at);
CREATE INDEX IF NOT EXISTS idx_rate_limits_identifier ON rate_limits(identifier);
CREATE INDEX IF NOT EXISTS idx_rate_limits_window_start ON rate_limits(window_start);

-- Row Level Security (RLS) policies
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE api_keys ENABLE ROW LEVEL SECURITY;
ALTER TABLE api_usage ENABLE ROW LEVEL SECURITY;

-- Users can only see their own data
CREATE POLICY "Users can view own data" ON users
    FOR SELECT USING (auth.uid() = id);

-- API keys policies
CREATE POLICY "Users can view own api keys" ON api_keys
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own api keys" ON api_keys
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own api keys" ON api_keys
    FOR UPDATE USING (auth.uid() = user_id);

-- API usage policies
CREATE POLICY "Users can view own api usage" ON api_usage
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM api_keys 
            WHERE api_keys.id = api_usage.api_key_id 
            AND api_keys.user_id = auth.uid()
        )
    );

-- Functions for automatic timestamp updates
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers for automatic timestamp updates
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_api_keys_updated_at BEFORE UPDATE ON api_keys
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to clean up expired API keys
CREATE OR REPLACE FUNCTION cleanup_expired_api_keys()
RETURNS INTEGER AS $$
DECLARE
    deleted_count INTEGER;
BEGIN
    UPDATE api_keys 
    SET is_active = false, updated_at = NOW()
    WHERE expires_at < NOW() AND is_active = true;
    
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    RETURN deleted_count;
END;
$$ LANGUAGE plpgsql;

-- Function to clean up old rate limit records
CREATE OR REPLACE FUNCTION cleanup_old_rate_limits()
RETURNS INTEGER AS $$
DECLARE
    deleted_count INTEGER;
BEGIN
    DELETE FROM rate_limits 
    WHERE window_start < NOW() - INTERVAL '1 hour';
    
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    RETURN deleted_count;
END;
$$ LANGUAGE plpgsql;
`;

  const schemaPath = path.join(process.cwd(), 'supabase-schema.sql');
  fs.writeFileSync(schemaPath, schemaContent);
  log('✓ Created database schema file: supabase-schema.sql', 'success');
  log('Run this SQL in your Supabase SQL editor', 'info');
}

function updateEnvironmentExample() {
  const envExample = `# Supabase Configuration
SUPABASE_URL=your_supabase_project_url
SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# Database Configuration
DATABASE_URL=postgresql://postgres:password@localhost:5432/onchain_agent
DATABASE_ENABLED=true

# Redis Configuration (optional)
REDIS_URL=redis://localhost:6379

# API Key Encryption
API_KEY_ENCRYPTION_KEY=your_32_character_encryption_key_here

# AI Provider API Keys
OPENAI_API_KEY=your_openai_api_key
ANTHROPIC_API_KEY=your_anthropic_api_key
PERPLEXITY_API_KEY=your_perplexity_api_key

# Next.js Configuration
NEXTAUTH_SECRET=your_nextauth_secret
NEXTAUTH_URL=http://localhost:3000

# Blockchain Configuration
NETWORK_ID=base-sepolia
PRIVATE_KEY=your_private_key_for_transactions

# Production Settings
NODE_ENV=production
`;

  const envPath = path.join(process.cwd(), '.env.example');
  fs.writeFileSync(envPath, envExample);
  log('✓ Updated .env.example with Supabase configuration', 'success');
}

function createMigrationScript() {
  const migrationContent = `#!/usr/bin/env node

/**
 * Database Migration Script
 * Migrates from in-memory storage to Supabase
 */

const { supabase } = require('../src/lib/supabase');
const { listAPIKeys } = require('../src/lib/secureApiKeys');

async function migrateAPIKeys() {
  console.log('Starting API key migration...');
  
  try {
    // Get all in-memory API keys
    const inMemoryKeys = listAPIKeys();
    console.log(\`Found \${inMemoryKeys.length} API keys to migrate\`);
    
    for (const keyData of inMemoryKeys) {
      const { data, error } = await supabase
        .from('api_keys')
        .insert({
          id: keyData.data.id,
          user_id: 'migrated-user-' + Date.now(), // Create a default user for migrated keys
          name: keyData.data.name,
          key_hash: 'migrated-hash', // This will need to be updated with actual hash
          permissions: keyData.data.permissions,
          expires_at: null, // Set appropriate expiration
          is_active: keyData.data.isActive,
          created_at: keyData.data.createdAt,
          updated_at: new Date().toISOString()
        });
      
      if (error) {
        console.error(\`Error migrating key \${keyData.data.id}:\`, error);
      } else {
        console.log(\`✓ Migrated key: \${keyData.data.name}\`);
      }
    }
    
    console.log('Migration completed!');
  } catch (error) {
    console.error('Migration failed:', error);
  }
}

if (require.main === module) {
  migrateAPIKeys();
}

module.exports = { migrateAPIKeys };
`;

  const migrationPath = path.join(process.cwd(), 'scripts/migrate-to-supabase.js');
  fs.writeFileSync(migrationPath, migrationContent);
  fs.chmodSync(migrationPath, '755');
  log('✓ Created migration script: scripts/migrate-to-supabase.js', 'success');
}

function updatePackageJson() {
  const packagePath = path.join(process.cwd(), 'package.json');
  
  if (!fs.existsSync(packagePath)) {
    log('package.json not found', 'error');
    return;
  }
  
  const packageJson = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
  
  // Add Supabase dependency if not present
  if (!packageJson.dependencies['@supabase/supabase-js']) {
    packageJson.dependencies['@supabase/supabase-js'] = '^2.39.0';
    log('✓ Added @supabase/supabase-js dependency', 'success');
  }
  
  // Add migration script
  if (!packageJson.scripts.migrate) {
    packageJson.scripts.migrate = 'node scripts/migrate-to-supabase.js';
    log('✓ Added migration script', 'success');
  }
  
  fs.writeFileSync(packagePath, JSON.stringify(packageJson, null, 2));
}

async function runSetup() {
  log('Setting up Supabase integration...', 'info');
  
  createSupabaseConfig();
  createDatabaseSchema();
  updateEnvironmentExample();
  createMigrationScript();
  updatePackageJson();
  
  log('\n🎉 Supabase integration setup complete!', 'success');
  log('\nNext steps:', 'info');
  log('1. Install dependencies: npm install', 'info');
  log('2. Set up your Supabase project', 'info');
  log('3. Run the SQL schema in your Supabase SQL editor', 'info');
  log('4. Update your .env file with Supabase credentials', 'info');
  log('5. Run migration: npm run migrate', 'info');
  log('6. Test with: node scripts/test-api-comprehensive.js', 'info');
}

if (require.main === module) {
  runSetup().catch(error => {
    log(`Setup failed: ${error.message}`, 'error');
    process.exit(1);
  });
}

module.exports = { runSetup };

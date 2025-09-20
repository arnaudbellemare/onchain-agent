#!/usr/bin/env node

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
    console.log(`Found ${inMemoryKeys.length} API keys to migrate`);
    
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
        console.error(`Error migrating key ${keyData.data.id}:`, error);
      } else {
        console.log(`✓ Migrated key: ${keyData.data.name}`);
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

/**
 * Production Database Service
 * Provides PostgreSQL and Redis integration for production data storage
 */

import { Pool, PoolClient, QueryResult, QueryResultRow } from 'pg';
import Redis from 'ioredis';

// Database service class
export class ProductionDatabaseService {
  private pool: Pool | null = null;
  private redis: Redis | null = null;
  private isConnected = false;
  private initializationPromise: Promise<void> | null = null;

  constructor() {
    // Don't initialize connections immediately - wait until first use
  }

  /**
   * Ensure database connections are initialized (lazy initialization)
   */
  private async ensureConnections(): Promise<void> {
    if (this.isConnected) {
      return;
    }

    if (this.initializationPromise) {
      return this.initializationPromise;
    }

    this.initializationPromise = this.initializeConnections();
    return this.initializationPromise;
  }

  /**
   * Initialize database connections
   */
  private async initializeConnections(): Promise<void> {
    try {
      await this.initializePostgreSQL();
      await this.initializeRedis();
      await this.runMigrations();
      this.isConnected = true;
      console.log('Production database connections initialized successfully');
    } catch (error) {
      console.error('Failed to initialize production database connections:', error);
      this.isConnected = false;
      throw error; // Re-throw to allow callers to handle the error
    }
  }

  /**
   * Initialize PostgreSQL connection
   */
  private async initializePostgreSQL(): Promise<void> {
    const dbConfig = {
      host: process.env.POSTGRES_HOST || 'localhost',
      port: parseInt(process.env.POSTGRES_PORT || '5432'),
      database: process.env.POSTGRES_DB || 'onchain_agent',
      user: process.env.POSTGRES_USER || 'postgres',
      password: process.env.POSTGRES_PASSWORD || '',
      ssl: process.env.NODE_ENV === 'production',
      max: 20,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 2000,
    };

    this.pool = new Pool(dbConfig);

    // Test connection
    const client = await this.pool.connect();
    await client.query('SELECT NOW()');
    client.release();
  }

  /**
   * Initialize Redis connection
   */
  private async initializeRedis(): Promise<void> {
    const redisConfig = {
      host: process.env.REDIS_HOST || 'localhost',
      port: parseInt(process.env.REDIS_PORT || '6379'),
      password: process.env.REDIS_PASSWORD,
      db: parseInt(process.env.REDIS_DB || '0'),
      retryDelayOnFailover: 100,
      maxRetriesPerRequest: 3,
    };

    this.redis = new Redis(redisConfig);

    // Test connection
    await this.redis.ping();
  }

  /**
   * Run database migrations
   */
  private async runMigrations(): Promise<void> {
    if (!this.pool) throw new Error('PostgreSQL not initialized');

    const migrations = [
      // Users table
      `
        CREATE TABLE IF NOT EXISTS users (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          email VARCHAR(255) UNIQUE NOT NULL,
          name VARCHAR(255) NOT NULL,
          company VARCHAR(255),
          wallet_address VARCHAR(42),
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          is_active BOOLEAN DEFAULT true
        )
      `,

      // API keys table
      `
        CREATE TABLE IF NOT EXISTS api_keys (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          user_id UUID REFERENCES users(id) ON DELETE CASCADE,
          name VARCHAR(255) NOT NULL,
          key_hash VARCHAR(255) UNIQUE NOT NULL,
          permissions JSONB DEFAULT '[]',
          last_used TIMESTAMP,
          expires_at TIMESTAMP,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          is_active BOOLEAN DEFAULT true
        )
      `,

      // Create indexes
      `
        CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
        CREATE INDEX IF NOT EXISTS idx_users_wallet_address ON users(wallet_address);
        CREATE INDEX IF NOT EXISTS idx_api_keys_user_id ON api_keys(user_id);
      `,
    ];

    const client = await this.pool.connect();
    try {
      for (const migration of migrations) {
        await client.query(migration);
      }
    } finally {
      client.release();
    }
  }

  /**
   * Execute a query with automatic connection management
   */
  async query<T extends QueryResultRow = any>(text: string, params?: any[]): Promise<QueryResult<T>> {
    await this.ensureConnections();
    
    if (!this.pool) {
      throw new Error('Database not initialized');
    }

    const client = await this.pool.connect();
    try {
      return await client.query(text, params);
    } finally {
      client.release();
    }
  }

  /**
   * Get Redis connection
   */
  async getRedis(): Promise<Redis> {
    await this.ensureConnections();
    
    if (!this.redis) {
      throw new Error('Redis not initialized');
    }
    return this.redis;
  }

  /**
   * Check if database is connected
   */
  isHealthy(): boolean {
    return this.isConnected && this.pool !== null && this.redis !== null;
  }

  /**
   * Get database health status
   */
  async getHealthStatus(): Promise<{
    postgres: boolean;
    redis: boolean;
    connected: boolean;
  }> {
    let postgres = false;
    let redis = false;

    try {
      await this.ensureConnections();
      
      if (this.pool) {
        await this.query('SELECT 1');
        postgres = true;
      }
    } catch (error) {
      console.error('PostgreSQL health check failed:', error);
    }

    try {
      if (this.redis) {
        await this.redis.ping();
        redis = true;
      }
    } catch (error) {
      console.error('Redis health check failed:', error);
    }

    return {
      postgres,
      redis,
      connected: postgres && redis,
    };
  }

  /**
   * Close all connections
   */
  async close(): Promise<void> {
    if (this.pool) {
      await this.pool.end();
      this.pool = null;
    }

    if (this.redis) {
      await this.redis.quit();
      this.redis = null;
    }

    this.isConnected = false;
  }
}

// Global production database service instance
export const database = new ProductionDatabaseService();

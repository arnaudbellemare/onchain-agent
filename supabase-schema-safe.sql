-- Safe Idempotent Supabase Database Schema for Onchain Agent
-- This script can be run multiple times without errors

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
    identifier VARCHAR(255) NOT NULL,
    endpoint VARCHAR(255) NOT NULL,
    request_count INTEGER DEFAULT 1,
    window_start TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for performance (IF NOT EXISTS)
CREATE INDEX IF NOT EXISTS idx_api_keys_key_hash ON api_keys(key_hash);
CREATE INDEX IF NOT EXISTS idx_api_keys_user_id ON api_keys(user_id);
CREATE INDEX IF NOT EXISTS idx_api_keys_expires_at ON api_keys(expires_at);
CREATE INDEX IF NOT EXISTS idx_api_usage_api_key_id ON api_usage(api_key_id);
CREATE INDEX IF NOT EXISTS idx_api_usage_created_at ON api_usage(created_at);
CREATE INDEX IF NOT EXISTS idx_rate_limits_identifier ON rate_limits(identifier);
CREATE INDEX IF NOT EXISTS idx_rate_limits_window_start ON rate_limits(window_start);

-- Enable Row Level Security
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE api_keys ENABLE ROW LEVEL SECURITY;
ALTER TABLE api_usage ENABLE ROW LEVEL SECURITY;

-- Safe policy creation using DO blocks (idempotent)
-- Users policies
DO $$ 
BEGIN 
    IF NOT EXISTS (
        SELECT 1 FROM pg_catalog.pg_policies 
        WHERE schemaname = 'public' 
        AND tablename = 'users' 
        AND policyname = 'Users can view own data'
    ) THEN 
        EXECUTE $p$ 
            CREATE POLICY "Users can view own data" ON public.users 
            FOR SELECT TO authenticated 
            USING ((SELECT auth.uid()) = id);
        $p$; 
    END IF; 
END; $$;

DO $$ 
BEGIN 
    IF NOT EXISTS (
        SELECT 1 FROM pg_catalog.pg_policies 
        WHERE schemaname = 'public' 
        AND tablename = 'users' 
        AND policyname = 'Users can insert own data'
    ) THEN 
        EXECUTE $p$ 
            CREATE POLICY "Users can insert own data" ON public.users 
            FOR INSERT TO authenticated 
            WITH CHECK ((SELECT auth.uid()) = id);
        $p$; 
    END IF; 
END; $$;

DO $$ 
BEGIN 
    IF NOT EXISTS (
        SELECT 1 FROM pg_catalog.pg_policies 
        WHERE schemaname = 'public' 
        AND tablename = 'users' 
        AND policyname = 'Users can update own data'
    ) THEN 
        EXECUTE $p$ 
            CREATE POLICY "Users can update own data" ON public.users 
            FOR UPDATE TO authenticated 
            USING ((SELECT auth.uid()) = id) 
            WITH CHECK ((SELECT auth.uid()) = id);
        $p$; 
    END IF; 
END; $$;

-- API Keys policies
DO $$ 
BEGIN 
    IF NOT EXISTS (
        SELECT 1 FROM pg_catalog.pg_policies 
        WHERE schemaname = 'public' 
        AND tablename = 'api_keys' 
        AND policyname = 'Users can view own api keys'
    ) THEN 
        EXECUTE $p$ 
            CREATE POLICY "Users can view own api keys" ON public.api_keys 
            FOR SELECT TO authenticated 
            USING ((SELECT auth.uid()) = user_id);
        $p$; 
    END IF; 
END; $$;

DO $$ 
BEGIN 
    IF NOT EXISTS (
        SELECT 1 FROM pg_catalog.pg_policies 
        WHERE schemaname = 'public' 
        AND tablename = 'api_keys' 
        AND policyname = 'Users can insert own api keys'
    ) THEN 
        EXECUTE $p$ 
            CREATE POLICY "Users can insert own api keys" ON public.api_keys 
            FOR INSERT TO authenticated 
            WITH CHECK ((SELECT auth.uid()) = user_id);
        $p$; 
    END IF; 
END; $$;

DO $$ 
BEGIN 
    IF NOT EXISTS (
        SELECT 1 FROM pg_catalog.pg_policies 
        WHERE schemaname = 'public' 
        AND tablename = 'api_keys' 
        AND policyname = 'Users can update own api keys'
    ) THEN 
        EXECUTE $p$ 
            CREATE POLICY "Users can update own api keys" ON public.api_keys 
            FOR UPDATE TO authenticated 
            USING ((SELECT auth.uid()) = user_id) 
            WITH CHECK ((SELECT auth.uid()) = user_id);
        $p$; 
    END IF; 
END; $$;

-- API Usage policies
DO $$ 
BEGIN 
    IF NOT EXISTS (
        SELECT 1 FROM pg_catalog.pg_policies 
        WHERE schemaname = 'public' 
        AND tablename = 'api_usage' 
        AND policyname = 'Users can view own api usage'
    ) THEN 
        EXECUTE $p$ 
            CREATE POLICY "Users can view own api usage" ON public.api_usage 
            FOR SELECT TO authenticated 
            USING (
                EXISTS (
                    SELECT 1 FROM api_keys 
                    WHERE api_keys.id = api_usage.api_key_id 
                    AND api_keys.user_id = (SELECT auth.uid())
                )
            );
        $p$; 
    END IF; 
END; $$;

DO $$ 
BEGIN 
    IF NOT EXISTS (
        SELECT 1 FROM pg_catalog.pg_policies 
        WHERE schemaname = 'public' 
        AND tablename = 'api_usage' 
        AND policyname = 'Users can insert own api usage'
    ) THEN 
        EXECUTE $p$ 
            CREATE POLICY "Users can insert own api usage" ON public.api_usage 
            FOR INSERT TO authenticated 
            WITH CHECK (
                EXISTS (
                    SELECT 1 FROM api_keys 
                    WHERE api_keys.id = api_usage.api_key_id 
                    AND api_keys.user_id = (SELECT auth.uid())
                )
            );
        $p$; 
    END IF; 
END; $$;

-- Functions for automatic timestamp updates
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers for automatic timestamp updates
DROP TRIGGER IF EXISTS update_users_updated_at ON users;
CREATE TRIGGER update_users_updated_at 
    BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_api_keys_updated_at ON api_keys;
CREATE TRIGGER update_api_keys_updated_at 
    BEFORE UPDATE ON api_keys
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

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL FUNCTIONS IN SCHEMA public TO authenticated;

-- Create a default user for testing (optional)
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM users WHERE email = 'test@example.com') THEN
        INSERT INTO users (id, email, name, is_active) 
        VALUES (
            '00000000-0000-0000-0000-000000000001',
            'test@example.com',
            'Test User',
            true
        );
    END IF;
END; $$;

-- Success message
SELECT 'Database schema setup completed successfully!' as status;

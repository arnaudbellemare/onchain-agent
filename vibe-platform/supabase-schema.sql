-- Supabase schema for VibeSDK deployments
-- This creates the deployments table to store real deployment data

CREATE TABLE IF NOT EXISTS deployments (
  id TEXT PRIMARY KEY,
  project_id TEXT NOT NULL,
  files JSONB NOT NULL,
  framework TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'deployed',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  cost_optimization JSONB,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create an index for faster lookups
CREATE INDEX IF NOT EXISTS idx_deployments_project_id ON deployments(project_id);
CREATE INDEX IF NOT EXISTS idx_deployments_created_at ON deployments(created_at);

-- Enable Row Level Security (RLS)
ALTER TABLE deployments ENABLE ROW LEVEL SECURITY;

-- Create a policy that allows public read access (for demo purposes)
-- In production, you'd want more restrictive policies
CREATE POLICY "Allow public read access" ON deployments
  FOR SELECT USING (true);

-- Create a policy that allows public insert access (for demo purposes)
-- In production, you'd want authentication-based policies
CREATE POLICY "Allow public insert access" ON deployments
  FOR INSERT WITH CHECK (true);

-- Create a policy that allows public update access (for demo purposes)
CREATE POLICY "Allow public update access" ON deployments
  FOR UPDATE USING (true);

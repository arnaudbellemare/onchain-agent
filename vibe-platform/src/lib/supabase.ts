import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://your-project.supabase.co';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'your-anon-key';

export const supabase = createClient(supabaseUrl, supabaseKey);

export interface DeploymentData {
  id: string;
  projectId: string;
  files: Array<{
    path: string;
    content: string;
    type: string;
  }>;
  framework: string;
  status: 'deployed' | 'deploying' | 'failed';
  createdAt: string;
  costOptimization?: {
    originalCost: string;
    optimizedCost: string;
    savings: string;
    savingsPercentage: string;
  };
}

export class SupabaseDeploymentStore {
  async saveDeployment(data: Omit<DeploymentData, 'id'>): Promise<DeploymentData> {
    const { data: deployment, error } = await supabase
      .from('deployments')
      .insert([data])
      .select()
      .single();

    if (error) {
      console.error('Supabase save error:', error);
      throw new Error(`Failed to save deployment: ${error.message}`);
    }

    return deployment;
  }

  async getDeployment(deploymentId: string): Promise<DeploymentData | null> {
    const { data: deployment, error } = await supabase
      .from('deployments')
      .select('*')
      .eq('id', deploymentId)
      .single();

    if (error) {
      console.error('Supabase fetch error:', error);
      return null;
    }

    return deployment;
  }

  async updateDeploymentStatus(deploymentId: string, status: string): Promise<void> {
    const { error } = await supabase
      .from('deployments')
      .update({ status })
      .eq('id', deploymentId);

    if (error) {
      console.error('Supabase update error:', error);
      throw new Error(`Failed to update deployment: ${error.message}`);
    }
  }
}

export const deploymentStore = new SupabaseDeploymentStore();

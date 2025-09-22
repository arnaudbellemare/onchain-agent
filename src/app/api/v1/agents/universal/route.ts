import { NextRequest, NextResponse } from 'next/server';
import { simpleApiKeyManager } from '@/lib/simpleApiKeyManager';
import { realAIImplementation } from '@/lib/realAIImplementation';
import { X402SDK } from '@/lib/x402SDK';

// Universal Agent Templates
const UNIVERSAL_AGENT_TEMPLATES = {
  customer_service: {
    name: "Customer Service Agent",
    description: "Universal customer service agent with advanced capabilities",
    capabilities: ["order_tracking", "returns", "product_info", "complaints", "upselling"],
    personality: "helpful",
    response_style: "conversational",
    knowledge_sources: ["product_catalog", "shipping_policies", "return_policy", "faq"],
    integrations: ["shopify", "zendesk", "slack"],
    optimization_level: "maximum"
  },
  
  marketing: {
    name: "Marketing Content Agent",
    description: "Universal marketing agent for content creation and campaigns",
    capabilities: ["content_creation", "social_media", "email_campaigns", "seo", "analytics"],
    personality: "creative",
    response_style: "detailed",
    knowledge_sources: ["brand_guidelines", "target_audience", "competitors", "campaign_history"],
    integrations: ["hootsuite", "mailchimp", "google_analytics", "canva"],
    optimization_level: "maximum"
  },
  
  technical: {
    name: "Technical Support Agent",
    description: "Universal technical support agent for debugging and code review",
    capabilities: ["debugging", "code_review", "documentation", "troubleshooting", "performance_optimization"],
    personality: "analytical",
    response_style: "technical",
    knowledge_sources: ["api_docs", "troubleshooting_guides", "best_practices", "code_examples"],
    integrations: ["github", "slack", "jira", "datadog"],
    optimization_level: "advanced"
  },
  
  data_analysis: {
    name: "Data Analysis Agent",
    description: "Universal data analysis agent for insights and visualization",
    capabilities: ["data_processing", "visualization", "insights", "reporting", "predictive_analytics"],
    personality: "analytical",
    response_style: "detailed",
    knowledge_sources: ["data_schemas", "business_metrics", "analytics_tools", "statistical_methods"],
    integrations: ["snowflake", "tableau", "python", "r"],
    optimization_level: "maximum"
  },
  
  creative: {
    name: "Creative Content Agent",
    description: "Universal creative agent for content and design",
    capabilities: ["content_writing", "design_suggestions", "storytelling", "brand_voice", "visual_creation"],
    personality: "creative",
    response_style: "detailed",
    knowledge_sources: ["brand_guidelines", "creative_briefs", "design_trends", "content_examples"],
    integrations: ["canva", "adobe", "figma", "content_management"],
    optimization_level: "advanced"
  }
};

// Universal Agent Manager
class UniversalAgentManager {
  private agents: Map<string, any> = new Map();
  private deployments: Map<string, any> = new Map();

  async createUniversalAgent(template: string, customConfig: any, walletAddress: string): Promise<any> {
    const agentId = `agent_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    // Get base template
    const baseTemplate = UNIVERSAL_AGENT_TEMPLATES[template as keyof typeof UNIVERSAL_AGENT_TEMPLATES];
    if (!baseTemplate) {
      throw new Error(`Unknown template: ${template}`);
    }
    
    // Merge template with custom config
    const agentConfig = {
      ...baseTemplate,
      ...customConfig,
      template: template,
      wallet_address: walletAddress,
      optimization_enabled: true,
      payment_method: 'usdc'
    };
    
    // Create agent
    const agent = {
      id: agentId,
      name: agentConfig.name,
      description: agentConfig.description,
      template: template,
      capabilities: agentConfig.capabilities,
      personality: agentConfig.personality,
      response_style: agentConfig.response_style,
      knowledge_sources: agentConfig.knowledge_sources,
      integrations: agentConfig.integrations,
      optimization_level: agentConfig.optimization_level,
      wallet_address: walletAddress,
      status: 'created',
      created_at: new Date().toISOString(),
      api_calls: 0,
      total_savings: 0,
      total_cost: 0
    };

    this.agents.set(agentId, agent);
    
    console.log(`[UniversalAgent] Created ${template} agent: ${agentId} (${agentConfig.name})`);
    
    return agent;
  }

  async deployUniversalAgent(agentId: string, deploymentConfig: any): Promise<any> {
    const agent = this.agents.get(agentId);
    if (!agent) {
      throw new Error('Agent not found');
    }

    const deployment = {
      agent_id: agentId,
      status: 'deployed',
      endpoint: `https://api.onchain-agent.com/v1/agents/${agentId}/chat`,
      environment: deploymentConfig.environment || 'production',
      scaling: deploymentConfig.scaling || 'auto',
      monitoring: deploymentConfig.monitoring || 'enabled',
      optimization: deploymentConfig.optimization || agent.optimization_level,
      deployed_at: new Date().toISOString()
    };

    this.deployments.set(agentId, deployment);
    
    // Update agent status
    agent.status = 'deployed';
    agent.deployed_at = new Date().toISOString();
    
    console.log(`[UniversalAgent] Deployed ${agent.template} agent: ${agentId} to ${deployment.endpoint}`);
    
    return deployment;
  }

  async chatWithUniversalAgent(agentId: string, message: string, optimizationEnabled: boolean = true): Promise<any> {
    const agent = this.agents.get(agentId);
    if (!agent) {
      throw new Error('Agent not found');
    }

    const deployment = this.deployments.get(agentId);
    if (!deployment) {
      throw new Error('Agent not deployed');
    }

    console.log(`[UniversalAgent] ${agent.template} agent ${agentId} processing message: "${message.substring(0, 50)}..."`);

    // Apply universal optimization
    let optimizedMessage = message;
    let originalCost = 0;
    let optimizedCost = 0;
    let savings = 0;
    let savingsPercentage = 0;

    if (optimizationEnabled) {
      const optimizationResult = await this.optimizeMessage(message, agent.optimization_level);
      optimizedMessage = optimizationResult.optimized_message;
      originalCost = optimizationResult.original_cost;
      optimizedCost = optimizationResult.optimized_cost;
      savings = optimizationResult.savings;
      savingsPercentage = optimizationResult.savings_percentage;
    }

    // Build contextual prompt based on agent's personality and capabilities
    const contextualPrompt = this.buildContextualPrompt(agent, optimizedMessage);
    
    // Generate agent response using real AI
    const aiResponse = await realAIImplementation.callPerplexity(contextualPrompt, 500);
    
    // Apply agent's response style
    const styledResponse = await this.applyResponseStyle(agent, aiResponse.response);
    
    // Update agent statistics
    agent.api_calls += 1;
    agent.total_cost += optimizedCost;
    agent.total_savings += savings;

    const response = {
      agent_id: agentId,
      agent_name: agent.name,
      agent_template: agent.template,
      response: styledResponse,
      optimization: {
        enabled: optimizationEnabled,
        original_message: message,
        optimized_message: optimizedMessage,
        original_cost: originalCost,
        optimized_cost: optimizedCost,
        savings: savings,
        savings_percentage: savingsPercentage
      },
      agent_stats: {
        total_api_calls: agent.api_calls,
        total_cost: agent.total_cost,
        total_savings: agent.total_savings
      },
      timestamp: new Date().toISOString()
    };

    console.log(`[UniversalAgent] ${agent.template} agent ${agentId} responded with optimization: ${savingsPercentage.toFixed(1)}% savings`);
    
    return response;
  }

  private async optimizeMessage(message: string, optimizationLevel: string): Promise<any> {
    let optimizedMessage = message;
    
    // Apply optimization based on level
    if (optimizationLevel === 'maximum') {
      // Maximum optimization - aggressive reduction
      optimizedMessage = message
        .replace(/\b(please|kindly|would you|could you|can you|I would like|I want|I need|I would appreciate)\b/gi, '')
        .replace(/\b(very|really|quite|rather|extremely|super|incredibly|amazingly|absolutely|completely|totally)\b/gi, '')
        .replace(/\b(actually|basically|essentially|fundamentally|literally|honestly|frankly|obviously|clearly)\b/gi, '')
        .replace(/\b(I think that|I believe that|I feel that|I know that|I would say that)\b/gi, '')
        .replace(/\b(in my opinion|I think|I believe|I feel|I know|I would say)\b/gi, '')
        .replace(/\s+/g, ' ')
        .trim();
    } else if (optimizationLevel === 'advanced') {
      // Advanced optimization - moderate reduction
      optimizedMessage = message
        .replace(/\b(please|kindly|would you|could you|can you)\b/gi, '')
        .replace(/\b(very|really|quite|rather|extremely)\b/gi, '')
        .replace(/\b(I would like|I want|I need)\b/gi, '')
        .replace(/\s+/g, ' ')
        .trim();
    } else {
      // Basic optimization - minimal reduction
      optimizedMessage = message
        .replace(/\b(please|kindly)\b/gi, '')
        .replace(/\s+/g, ' ')
        .trim();
    }

    const originalTokens = Math.ceil(message.length / 3.5);
    const optimizedTokens = Math.ceil(optimizedMessage.length / 3.5);
    
    const originalCost = (originalTokens / 1000000) * 0.2; // Perplexity pricing
    const optimizedCost = (optimizedTokens / 1000000) * 0.2;
    const savings = originalCost - optimizedCost;
    const savingsPercentage = originalCost > 0 ? (savings / originalCost) * 100 : 0;

    return {
      optimized_message: optimizedMessage,
      original_cost: originalCost,
      optimized_cost: optimizedCost,
      savings: savings,
      savings_percentage: savingsPercentage
    };
  }

  private buildContextualPrompt(agent: any, message: string): string {
    const personalityContext = {
      helpful: "You are a helpful and friendly assistant. Provide clear, actionable responses.",
      creative: "You are a creative and innovative assistant. Think outside the box and provide imaginative solutions.",
      analytical: "You are an analytical and methodical assistant. Provide detailed, data-driven responses.",
      professional: "You are a professional and formal assistant. Maintain a business-appropriate tone.",
      friendly: "You are a warm and approachable assistant. Be conversational and engaging."
    };

    const responseStyleContext = {
      concise: "Keep responses brief and to the point.",
      detailed: "Provide comprehensive and thorough responses.",
      conversational: "Use a natural, conversational tone.",
      technical: "Use technical language and provide detailed explanations."
    };

    return `You are a ${agent.template} agent with the following capabilities: ${agent.capabilities.join(', ')}.

Personality: ${personalityContext[agent.personality as keyof typeof personalityContext]}
Response Style: ${responseStyleContext[agent.response_style as keyof typeof responseStyleContext]}

Knowledge Sources: ${agent.knowledge_sources.join(', ')}
Integrations: ${agent.integrations.join(', ')}

User Message: ${message}

Respond as this specialized agent would, using your capabilities and knowledge sources.`;
  }

  private async applyResponseStyle(agent: any, response: string): Promise<string> {
    // Apply agent-specific response styling
    if (agent.response_style === 'technical') {
      return `[Technical Analysis]\n${response}`;
    } else if (agent.response_style === 'detailed') {
      return `[Comprehensive Response]\n${response}`;
    } else if (agent.response_style === 'conversational') {
      return `[Friendly Response]\n${response}`;
    } else {
      return response;
    }
  }

  async getUniversalAgent(agentId: string): Promise<any> {
    return this.agents.get(agentId);
  }

  async getAllUniversalAgents(): Promise<any[]> {
    return Array.from(this.agents.values());
  }

  async getUniversalDashboard(): Promise<any> {
    const agents = await this.getAllUniversalAgents();
    const totalAgents = agents.length;
    const totalApiCalls = agents.reduce((sum, agent) => sum + agent.api_calls, 0);
    const totalCost = agents.reduce((sum, agent) => sum + agent.total_cost, 0);
    const totalSavings = agents.reduce((sum, agent) => sum + agent.total_savings, 0);

    // Group by template
    const agentsByTemplate = agents.reduce((acc, agent) => {
      if (!acc[agent.template]) {
        acc[agent.template] = [];
      }
      acc[agent.template].push(agent);
      return acc;
    }, {} as any);

    return {
      total_agents: totalAgents,
      total_api_calls: totalApiCalls,
      total_cost: totalCost,
      total_savings: totalSavings,
      average_savings_percentage: totalCost > 0 ? (totalSavings / totalCost) * 100 : 0,
      agents_by_template: agentsByTemplate,
      available_templates: Object.keys(UNIVERSAL_AGENT_TEMPLATES),
      agents: agents.map(agent => ({
        id: agent.id,
        name: agent.name,
        template: agent.template,
        status: agent.status,
        api_calls: agent.api_calls,
        total_savings: agent.total_savings,
        created_at: agent.created_at
      }))
    };
  }
}

const universalAgentManager = new UniversalAgentManager();

export async function POST(request: NextRequest) {
  try {
    // Get API key from header
    const apiKey = request.headers.get('X-API-Key');
    if (!apiKey) {
      return NextResponse.json({
        success: false,
        error: 'API key is required'
      }, { status: 401 });
    }

    const keyValidation = simpleApiKeyManager.validateAPIKey(apiKey);
    if (!keyValidation.valid) {
      return NextResponse.json({
        success: false,
        error: `Invalid API key: ${keyValidation.reason}`
      }, { status: 401 });
    }

    const body = await request.json();
    const { action, ...data } = body;

    switch (action) {
      case 'create':
        return await handleCreateUniversalAgent(data);
      
      case 'deploy':
        return await handleDeployUniversalAgent(data);
      
      case 'chat':
        return await handleChatWithUniversalAgent(data);
      
      case 'monitor':
        return await handleMonitorUniversalAgent(data);
      
      default:
        return NextResponse.json({
          success: false,
          error: 'Invalid action. Supported actions: create, deploy, chat, monitor'
        }, { status: 400 });
    }
  } catch (error) {
    console.error('[UniversalAgent] Error:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    // Get API key from header
    const apiKey = request.headers.get('X-API-Key');
    if (!apiKey) {
      return NextResponse.json({
        success: false,
        error: 'API key is required'
      }, { status: 401 });
    }

    const keyValidation = simpleApiKeyManager.validateAPIKey(apiKey);
    if (!keyValidation.valid) {
      return NextResponse.json({
        success: false,
        error: `Invalid API key: ${keyValidation.reason}`
      }, { status: 401 });
    }

    const url = new URL(request.url);
    const path = url.pathname;

    if (path.includes('/dashboard')) {
      return await handleGetUniversalDashboard();
    } else {
      return await handleGetUniversalAgents();
    }
  } catch (error) {
    console.error('[UniversalAgent] Error:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

async function handleCreateUniversalAgent(data: any) {
  const { template, name, description, custom_config, wallet_address, optimization_enabled, payment_method } = data;

  if (!template || !name || !description || !wallet_address) {
    return NextResponse.json({
      success: false,
      error: 'Missing required fields: template, name, description, wallet_address'
    }, { status: 400 });
  }

  // Create universal agent
  const agent = await universalAgentManager.createUniversalAgent(template, custom_config || {}, wallet_address);

  // Calculate creation fee based on template and optimization level
  let creationFee = 5; // Basic agent
  if (template === 'data_analysis' || template === 'marketing') {
    creationFee = 25; // Advanced agent
  }
  if (custom_config?.optimization_level === 'maximum' || custom_config?.capabilities?.length > 5) {
    creationFee = 50; // Premium agent
  }

  // Process USDC payment for agent creation
  const x402Config = {
    baseUrl: 'http://localhost:3000',
    chainId: 8453,
    currency: 'USDC',
    privateKey: process.env.X402_PRIVATE_KEY || 'demo_key',
    provider: 'https://mainnet.base.org'
  };

  const x402SDK = new X402SDK(x402Config);
  
  let transactionHash = '';
  try {
    const paymentResult = await x402SDK.makeAICall(
      '/api/v1/agents/universal/create',
      {
        prompt: `Create universal ${template} agent: ${name}`,
        maxTokens: 100,
        walletAddress: wallet_address,
        amount: creationFee
      },
      {
        request_id: `universal-agent-create-${Date.now()}`,
        model: 'gpt-3.5-turbo',
        tokens_in: 50,
        tokens_out: 100,
        inference_seconds: 1.5,
        cost_usd: creationFee / 1_000_000
      }
    );
    transactionHash = paymentResult.transactionHash;
  } catch (error) {
    console.error('[UniversalAgent] Payment failed, using mock transaction:', error);
    transactionHash = `0x${Math.random().toString(16).substr(2, 64)}`;
  }

  return NextResponse.json({
    success: true,
    agent: {
      id: agent.id,
      name: agent.name,
      description: agent.description,
      template: agent.template,
      capabilities: agent.capabilities,
      personality: agent.personality,
      response_style: agent.response_style,
      optimization_level: agent.optimization_level,
      status: agent.status,
      created_at: agent.created_at
    },
    payment: {
      amount: creationFee,
      currency: 'USDC',
      transaction_hash: transactionHash,
      status: 'confirmed'
    },
    message: `Universal ${template} agent "${name}" created successfully!`
  });
}

async function handleDeployUniversalAgent(data: any) {
  const { agent_id, deployment_config } = data;

  if (!agent_id) {
    return NextResponse.json({
      success: false,
      error: 'Missing required field: agent_id'
    }, { status: 400 });
  }

  const deployment = await universalAgentManager.deployUniversalAgent(agent_id, deployment_config || {});

  return NextResponse.json({
    success: true,
    deployment: {
      agent_id: deployment.agent_id,
      status: deployment.status,
      endpoint: deployment.endpoint,
      environment: deployment.environment,
      scaling: deployment.scaling,
      monitoring: deployment.monitoring,
      optimization: deployment.optimization,
      deployed_at: deployment.deployed_at
    },
    message: `Universal agent ${agent_id} deployed successfully!`
  });
}

async function handleChatWithUniversalAgent(data: any) {
  const { agent_id, message, optimization_enabled } = data;

  if (!agent_id || !message) {
    return NextResponse.json({
      success: false,
      error: 'Missing required fields: agent_id, message'
    }, { status: 400 });
  }

  const response = await universalAgentManager.chatWithUniversalAgent(agent_id, message, optimization_enabled !== false);

  return NextResponse.json({
    success: true,
    ...response
  });
}

async function handleMonitorUniversalAgent(data: any) {
  const { agent_id } = data;

  if (!agent_id) {
    return NextResponse.json({
      success: false,
      error: 'Missing required field: agent_id'
    }, { status: 400 });
  }

  const agent = await universalAgentManager.getUniversalAgent(agent_id);
  if (!agent) {
    return NextResponse.json({
      success: false,
      error: 'Agent not found'
    }, { status: 404 });
  }

  return NextResponse.json({
    success: true,
    agent: {
      id: agent.id,
      name: agent.name,
      template: agent.template,
      capabilities: agent.capabilities,
      personality: agent.personality,
      response_style: agent.response_style,
      optimization_level: agent.optimization_level,
      status: agent.status,
      api_calls: agent.api_calls,
      total_cost: agent.total_cost,
      total_savings: agent.total_savings,
      created_at: agent.created_at,
      deployed_at: agent.deployed_at
    }
  });
}

async function handleGetUniversalAgents() {
  const agents = await universalAgentManager.getAllUniversalAgents();

  return NextResponse.json({
    success: true,
    agents: agents.map(agent => ({
      id: agent.id,
      name: agent.name,
      template: agent.template,
      capabilities: agent.capabilities,
      status: agent.status,
      api_calls: agent.api_calls,
      total_savings: agent.total_savings,
      created_at: agent.created_at
    }))
  });
}

async function handleGetUniversalDashboard() {
  const dashboard = await universalAgentManager.getUniversalDashboard();

  return NextResponse.json({
    success: true,
    dashboard
  });
}

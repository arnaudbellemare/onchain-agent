import { NextRequest, NextResponse } from 'next/server';

// Business Integration API for x402 + AgentKit
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { action, data } = body;

    switch (action) {
      case 'assess_savings':
        return assessSavings(data);
      
      case 'get_integration_guide':
        return getIntegrationGuide(data);
      
      case 'calculate_roi':
        return calculateROI(data);
      
      case 'get_use_cases':
        return getUseCases(data);
      
      case 'start_trial':
        return startTrial(data);
      
      default:
        return NextResponse.json(
          { error: 'Invalid action. Available actions: assess_savings, get_integration_guide, calculate_roi, get_use_cases, start_trial' },
          { status: 400 }
        );
    }
  } catch (_error) {
    return NextResponse.json(
      { error: 'Invalid request format' },
      { status: 400 }
    );
  }
}

// Assess potential savings for a business
async function assessSavings(data: Record<string, unknown>) {
  const monthlyApiCalls = Number(data.monthlyApiCalls) || 0;
  const currentCostPerCall = Number(data.currentCostPerCall) || 0;
  const currentSubscriptionCost = Number(data.currentSubscriptionCost) || 0;
  
  // Calculate current costs
  const currentMonthlyCost = (monthlyApiCalls * currentCostPerCall) + currentSubscriptionCost;
  
  // Calculate x402 optimized costs (70% of current per-call cost)
  const x402CostPerCall = currentCostPerCall * 0.7;
  const x402MonthlyCost = monthlyApiCalls * x402CostPerCall;
  
  // Calculate savings
  const monthlySavings = currentMonthlyCost - x402MonthlyCost;
  const annualSavings = monthlySavings * 12;
  const savingsPercent = (monthlySavings / currentMonthlyCost) * 100;
  
  return NextResponse.json({
    assessment: {
      currentMonthlyCost: currentMonthlyCost,
      x402MonthlyCost: x402MonthlyCost,
      monthlySavings: monthlySavings,
      annualSavings: annualSavings,
      savingsPercent: savingsPercent,
      roi: (annualSavings / 50000) * 100, // Assuming $50K implementation cost
      paybackPeriod: Math.ceil(50000 / monthlySavings) // Months to payback
    },
    recommendations: [
      "Implement x402 protocol for pay-per-use API access",
      "Deploy AgentKit for autonomous cost optimization",
      "Enable real-time cost tracking and analytics",
      "Set up automated provider routing for optimal pricing"
    ],
    nextSteps: [
      "Schedule a free consultation call",
      "Run a 30-day pilot program",
      "Review integration requirements",
      "Plan implementation timeline"
    ]
  });
}

// Get integration guide based on business type
async function getIntegrationGuide(data: Record<string, unknown>) {
  const businessType = String(data.businessType) || 'saas';
  const apiVolume = Number(data.apiVolume) || 0;
  const currentProviders = data.currentProviders;
  
  const integrationGuides: Record<string, Record<string, unknown>> = {
    saas: {
      title: "SaaS Company Integration Guide",
      steps: [
        "Replace subscription-based API access with x402 micropayments",
        "Implement AgentKit for autonomous cost optimization",
        "Set up real-time cost tracking and analytics",
        "Configure automated provider routing"
      ],
      timeline: "2-4 weeks",
      cost: "$10,000-25,000 setup + 25% of savings",
      benefits: ["90% cost reduction", "Autonomous optimization", "Real-time analytics"]
    },
    ecommerce: {
      title: "E-commerce Platform Integration Guide", 
      steps: [
        "Integrate x402 for payment processing APIs",
        "Enable pay-per-transaction pricing",
        "Deploy AgentKit for fraud detection optimization",
        "Set up automated cost monitoring"
      ],
      timeline: "3-5 weeks",
      cost: "$15,000-30,000 setup + 20% of savings",
      benefits: ["84% payment processing savings", "Reduced fraud costs", "Automated optimization"]
    },
    ai_ml: {
      title: "AI/ML Company Integration Guide",
      steps: [
        "Replace OpenAI/Anthropic subscriptions with x402",
        "Implement pay-per-inference pricing",
        "Deploy AgentKit for model optimization",
        "Enable autonomous resource scaling"
      ],
      timeline: "4-6 weeks", 
      cost: "$20,000-40,000 setup + 30% of savings",
      benefits: ["85% API cost reduction", "Autonomous scaling", "Predictive optimization"]
    },
    fintech: {
      title: "Fintech Company Integration Guide",
      steps: [
        "Integrate x402 for KYC/AML API calls",
        "Enable pay-per-verification pricing",
        "Deploy AgentKit for compliance optimization",
        "Set up real-time cost tracking"
      ],
      timeline: "5-8 weeks",
      cost: "$25,000-50,000 setup + 25% of savings", 
      benefits: ["80% compliance cost reduction", "Automated optimization", "Real-time monitoring"]
    }
  };
  
  const guide = integrationGuides[businessType] || integrationGuides.saas;
  
  return NextResponse.json({
    guide: guide,
    customizations: {
      apiVolume: apiVolume,
      currentProviders: currentProviders,
      estimatedSavings: calculateEstimatedSavings(apiVolume, businessType)
    }
  });
}

// Calculate ROI for business integration
async function calculateROI(data: Record<string, unknown>) {
  const monthlyApiCalls = Number(data.monthlyApiCalls) || 0;
  const currentCostPerCall = Number(data.currentCostPerCall) || 0;
  const currentSubscriptionCost = Number(data.currentSubscriptionCost) || 0;
  const implementationCost = Number(data.implementationCost) || 50000;
  const ongoingFeePercent = Number(data.ongoingFeePercent) || 25;
  
  // Current costs
  const currentMonthlyCost = (monthlyApiCalls * currentCostPerCall) + currentSubscriptionCost;
  
  // x402 optimized costs
  const x402CostPerCall = currentCostPerCall * 0.7;
  const x402MonthlyCost = monthlyApiCalls * x402CostPerCall;
  
  // Savings calculation
  const monthlySavings = currentMonthlyCost - x402MonthlyCost;
  const annualSavings = monthlySavings * 12;
  
  // Your revenue
  const yourMonthlyRevenue = monthlySavings * (ongoingFeePercent / 100);
  const yourAnnualRevenue = yourMonthlyRevenue * 12;
  
  // Client ROI
  const clientNetSavings = annualSavings - (yourAnnualRevenue + implementationCost);
  const clientROI = (clientNetSavings / implementationCost) * 100;
  
  return NextResponse.json({
    roi: {
      implementationCost: implementationCost,
      clientAnnualSavings: annualSavings,
      yourAnnualRevenue: yourAnnualRevenue,
      clientNetSavings: clientNetSavings,
      clientROI: clientROI,
      paybackPeriod: Math.ceil(implementationCost / monthlySavings)
    },
    breakdown: {
      currentMonthlyCost: currentMonthlyCost,
      x402MonthlyCost: x402MonthlyCost,
      monthlySavings: monthlySavings,
      savingsPercent: (monthlySavings / currentMonthlyCost) * 100
    }
  });
}

// Get relevant use cases for business type
async function getUseCases(data: Record<string, unknown>) {
  const businessType = String(data.businessType) || 'saas';
  
  const useCases: Record<string, Record<string, unknown>[]> = {
    saas: [
      {
        title: "API Cost Optimization",
        description: "Replace subscription-based API access with x402 micropayments",
        savings: "90% cost reduction",
        example: "SaaS platform pays $0.02 per API call instead of $2,000/month subscription"
      },
      {
        title: "Autonomous Optimization", 
        description: "AgentKit automatically optimizes costs without human intervention",
        savings: "24/7 cost monitoring and optimization",
        example: "System automatically switches to cheapest API provider based on real-time pricing"
      }
    ],
    ecommerce: [
      {
        title: "Payment Processing Optimization",
        description: "Use x402 for payment processing APIs with pay-per-transaction pricing",
        savings: "84% payment processing savings",
        example: "E-commerce platform pays $0.01 per transaction instead of 2.9% + $0.30"
      },
      {
        title: "Fraud Detection Optimization",
        description: "AgentKit optimizes fraud detection API usage and costs",
        savings: "60% fraud detection cost reduction",
        example: "Automated fraud scoring with pay-per-check pricing"
      }
    ],
    ai_ml: [
      {
        title: "AI Model Inference",
        description: "Pay per AI model inference instead of subscription fees",
        savings: "85% AI API cost reduction", 
        example: "AI company pays $0.005 per image classification instead of $5,000/month"
      },
      {
        title: "Autonomous Resource Scaling",
        description: "AgentKit automatically scales compute resources based on demand",
        savings: "70% compute cost reduction",
        example: "GPU resources scale automatically with pay-per-minute pricing"
      }
    ],
    fintech: [
      {
        title: "KYC/AML Optimization",
        description: "Pay per identity verification instead of bulk subscriptions",
        savings: "80% compliance cost reduction",
        example: "Fintech pays $0.25 per KYC check instead of $10,000/month subscription"
      },
      {
        title: "Real-time Risk Assessment",
        description: "AgentKit provides real-time risk scoring with x402 payments",
        savings: "75% risk assessment cost reduction",
        example: "Automated risk scoring with pay-per-assessment pricing"
      }
    ]
  };
  
  return NextResponse.json({
    businessType: businessType,
    useCases: useCases[businessType] || useCases.saas,
    allUseCases: Object.values(useCases).flat()
  });
}

// Start a trial for potential clients
async function startTrial(data: Record<string, unknown>) {
  const companyName = String(data.companyName) || '';
  const contactEmail = String(data.contactEmail) || '';
  const businessType = String(data.businessType) || 'saas';
  const _monthlyApiCalls = Number(data.monthlyApiCalls) || 0;
  
  // Generate trial credentials
  const trialId = `trial_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  const trialEndDate = new Date();
  trialEndDate.setDate(trialEndDate.getDate() + 30); // 30-day trial
  
  return NextResponse.json({
    trial: {
      trialId: trialId,
      companyName: companyName,
      contactEmail: contactEmail,
      businessType: businessType,
      startDate: new Date().toISOString(),
      endDate: trialEndDate.toISOString(),
      status: "active"
    },
    access: {
      apiKey: `x402_trial_${trialId}`,
      dashboardUrl: `https://your-domain.com/dashboard?trial=${trialId}`,
      documentationUrl: "https://your-domain.com/docs",
      supportEmail: "support@your-domain.com"
    },
    features: [
      "Full x402 protocol access",
      "AgentKit autonomous optimization", 
      "Real-time cost analytics",
      "API integration support",
      "30-day free trial"
    ],
    nextSteps: [
      "Access your trial dashboard",
      "Review integration documentation", 
      "Schedule implementation call",
      "Start optimizing your API costs"
    ]
  });
}

// Helper function to calculate estimated savings
function calculateEstimatedSavings(apiVolume: number, businessType: string): number {
  const savingsMultipliers: Record<string, number> = {
    saas: 0.9,
    ecommerce: 0.84,
    ai_ml: 0.85,
    fintech: 0.8
  };
  
  const multiplier = savingsMultipliers[businessType] || 0.9;
  const estimatedCurrentCost = apiVolume * 0.03; // Assume $0.03 per call
  return estimatedCurrentCost * multiplier;
}

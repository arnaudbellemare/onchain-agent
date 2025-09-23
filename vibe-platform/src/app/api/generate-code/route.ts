import { NextRequest, NextResponse } from 'next/server';
import { VibeCodeGenerator } from '@/lib/vibeCodeGenerator';

interface GenerateCodeRequest {
  prompt: string;
  projectType?: string;
  framework?: string;
  features?: string[];
  optimizationEnabled?: boolean;
}

export async function POST(req: NextRequest) {
  try {
    const body: GenerateCodeRequest = await req.json();
    const { 
      prompt, 
      projectType = 'web-app',
      framework = 'react',
      features = [],
      optimizationEnabled = true
    } = body;

    if (!prompt) {
      return NextResponse.json({
        success: false,
        error: 'Prompt is required'
      }, { status: 400 });
    }

    console.log(`[VibeSDK] Generating code for: ${prompt}`);
    
    const codeGenerator = new VibeCodeGenerator();
    const result = await codeGenerator.generateCode({
      userPrompt: prompt,
      projectType,
      framework,
      features,
      optimizationEnabled
    });

    console.log(`[VibeSDK] Code generation completed with ${result.costOptimization.savingsPercentage} cost savings`);

    return NextResponse.json({
      success: true,
      result: {
        ...result,
        vibe_platform: {
          integration: 'OnChain Agent + VibeSDK',
          cost_optimization: 'Real-time AI cost reduction',
          blockchain_payments: 'x402 micropayments enabled',
          revenue_model: '13% fee on cost savings',
          deployment: 'Cloudflare Workers ready'
        },
        timestamp: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('VibeSDK code generation error:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    }, { status: 500 });
  }
}

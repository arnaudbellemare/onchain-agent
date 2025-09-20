import { NextRequest, NextResponse } from 'next/server';
import { realAIProvider } from '@/lib/realAIProvider';
import { realAIImplementation } from '@/lib/realAIImplementation';
import { simpleApiKeyManager } from '@/lib/simpleApiKeyManager';

export async function POST(req: NextRequest) {
  try {
    const { prompt, maxCost = 0.10, useRealAI = false } = await req.json();
    
    if (!prompt) {
      return NextResponse.json({
        success: false,
        error: 'prompt is required'
      }, { status: 400 });
    }

    // Check API key
    const apiKey = req.headers.get('X-API-Key');
    if (!apiKey) {
      return NextResponse.json({
        success: false,
        error: 'API key required'
      }, { status: 401 });
    }

    const keyValidation = simpleApiKeyManager.validateAPIKey(apiKey);
    if (!keyValidation.valid) {
      return NextResponse.json({
        success: false,
        error: `Invalid API key: ${keyValidation.reason}`
      }, { status: 401 });
    }

    if (useRealAI) {
      // Test real AI processing
      if (!realAIImplementation.isConfigured()) {
        return NextResponse.json({
          success: false,
          error: 'Real AI providers not configured. Add OPENAI_API_KEY or PERPLEXITY_API_KEY to environment variables.',
          configStatus: realAIImplementation.getConfigStatus()
        }, { status: 503 });
      }

      try {
        // Try OpenAI first (cheapest)
        if (realAIImplementation.getConfigStatus().openai) {
          const aiResponse = await realAIImplementation.callOpenAI(prompt);
          
          return NextResponse.json({
            success: true,
            data: {
              type: 'real_ai_openai',
              provider: 'openai',
              model: aiResponse.model,
              response: aiResponse.response,
              actualCost: aiResponse.actualCost,
              tokens: aiResponse.tokens,
              usage: aiResponse.usage,
              timestamp: new Date().toISOString()
            }
          });
        }
        
        // Fallback to Perplexity
        if (realAIImplementation.getConfigStatus().perplexity) {
          const aiResponse = await realAIImplementation.callPerplexity(prompt);
          
          return NextResponse.json({
            success: true,
            data: {
              type: 'real_ai_perplexity',
              provider: 'perplexity',
              model: aiResponse.model,
              response: aiResponse.response,
              actualCost: aiResponse.actualCost,
              tokens: aiResponse.tokens,
              usage: aiResponse.usage,
              timestamp: new Date().toISOString()
            }
          });
        }

        return NextResponse.json({
          success: false,
          error: 'No AI providers available'
        }, { status: 503 });

      } catch (error) {
        console.error('[Real AI] Error:', error);
        return NextResponse.json({
          success: false,
          error: `AI API call failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
          configStatus: realAIImplementation.getConfigStatus()
        }, { status: 500 });
      }

    } else {
      // Mock response for comparison
      const mockCost = Math.random() * 0.05 + 0.01;
      const mockSavings = mockCost * 0.3;
      
      return NextResponse.json({
        success: true,
        data: {
          type: 'mock_ai',
          response: `Mock response to: "${prompt}"\n\nThis is a simulated response showing what the system would return without real AI processing.`,
          mockCost,
          mockSavings,
          mockSavingsPercentage: 30,
          timestamp: new Date().toISOString()
        }
      });
    }

  } catch (error) {
    console.error('[Real Test] Error:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  // Return configuration status
  const configStatus = realAIImplementation.getConfigStatus();
  const isConfigured = realAIImplementation.isConfigured();
  const availableProviders = realAIImplementation.getAvailableProviders();
  
  return NextResponse.json({
    success: true,
    data: {
      realAIConfigured: isConfigured,
      providers: configStatus,
      availableProviders,
      instructions: {
        mock: 'Use ?useRealAI=false to test mock responses',
        real: 'Use ?useRealAI=true to test real AI (requires API keys)',
        setup: 'Add OPENAI_API_KEY or PERPLEXITY_API_KEY to environment variables'
      }
    }
  });
}

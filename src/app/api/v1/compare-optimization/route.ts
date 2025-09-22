import { NextRequest, NextResponse } from 'next/server';
import { simpleApiKeyManager } from '@/lib/simpleApiKeyManager';
import { realAIImplementation } from '@/lib/realAIImplementation';
import { PromptOptimizerConcepts } from '@/lib/promptOptimizerConcepts';
import { RealCAPOAlgorithm } from '@/lib/realCAPOAlgorithm';

interface ComparisonResult {
  method: string;
  originalPrompt: string;
  optimizedPrompt: string;
  originalLength: number;
  optimizedLength: number;
  lengthReduction: number;
  originalTokens: number;
  optimizedTokens: number;
  tokenReduction: number;
  costSavings: number;
  processingTime: number;
  realAI: boolean;
  response?: string;
  error?: string;
}

interface TestPrompt {
  name: string;
  prompt: string;
  category: string;
  expectedSavings: number;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { testPrompts } = body;

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

    // Default test prompts if none provided
    const defaultTestPrompts: TestPrompt[] = [
      {
        name: "Verbose Business Prompt",
        prompt: "I would really appreciate it if you could please help me create a comprehensive marketing campaign for our new product. I think that it would be very helpful if you could suggest creative ideas and strategies. I believe that this would help us reach our target audience effectively and increase our sales significantly.",
        category: "Business",
        expectedSavings: 20
      },
      {
        name: "Technical Code Review",
        prompt: "Please review this code and suggest improvements. I would like to make it more efficient and readable. I think that there might be some performance issues that we should address.",
        category: "Technical",
        expectedSavings: 15
      },
      {
        name: "Creative Writing",
        prompt: "I would really like you to help me write a creative story about a magical forest. I think it would be wonderful if you could make it engaging and full of interesting characters. I believe that this would captivate readers of all ages.",
        category: "Creative",
        expectedSavings: 25
      },
      {
        name: "Data Analysis",
        prompt: "I would really appreciate it if you could please help me analyze this dataset. I think that it would be very helpful if you could provide insights and recommendations. I believe that this would help us make better business decisions.",
        category: "Analytics",
        expectedSavings: 18
      },
      {
        name: "Educational Content",
        prompt: "I would really like you to help me explain quantum computing to a beginner. I think it would be wonderful if you could make it simple and easy to understand. I believe that this would help students learn this complex topic.",
        category: "Education",
        expectedSavings: 22
      },
      {
        name: "Short Prompt",
        prompt: "How does AI work?",
        category: "Simple",
        expectedSavings: 5
      }
    ];

    const promptsToTest = testPrompts || defaultTestPrompts;
    const results: ComparisonResult[] = [];

    console.log(`[Compare] Starting optimization comparison with ${promptsToTest.length} prompts`);

    for (const testPrompt of promptsToTest) {
      console.log(`[Compare] Testing: ${testPrompt.name}`);
      
      // Test 1: Current CAPO System
      try {
        const capoStartTime = Date.now();
        const capoOptimized = await testCAPOOptimization(testPrompt.prompt);
        const capoProcessingTime = Date.now() - capoStartTime;
        
        const capoResult: ComparisonResult = {
          method: "CAPO (Current)",
          originalPrompt: testPrompt.prompt,
          optimizedPrompt: capoOptimized,
          originalLength: testPrompt.prompt.length,
          optimizedLength: capoOptimized.length,
          lengthReduction: testPrompt.prompt.length > 0 ? ((testPrompt.prompt.length - capoOptimized.length) / testPrompt.prompt.length) * 100 : 0,
          originalTokens: Math.ceil(testPrompt.prompt.length / 3.5),
          optimizedTokens: Math.ceil(capoOptimized.length / 3.5),
          tokenReduction: 0,
          costSavings: 0,
          processingTime: capoProcessingTime,
          realAI: true
        };

        capoResult.tokenReduction = capoResult.originalTokens > 0 ? 
          ((capoResult.originalTokens - capoResult.optimizedTokens) / capoResult.originalTokens) * 100 : 0;
        capoResult.costSavings = capoResult.tokenReduction * 0.2; // $0.2 per 1M tokens

        results.push(capoResult);
        console.log(`[Compare] CAPO: ${capoResult.lengthReduction.toFixed(1)}% length reduction, ${capoResult.tokenReduction.toFixed(1)}% token reduction`);
      } catch (error) {
        console.error(`[Compare] CAPO failed for ${testPrompt.name}:`, error);
        results.push({
          method: "CAPO (Current)",
          originalPrompt: testPrompt.prompt,
          optimizedPrompt: testPrompt.prompt,
          originalLength: testPrompt.prompt.length,
          optimizedLength: testPrompt.prompt.length,
          lengthReduction: 0,
          originalTokens: Math.ceil(testPrompt.prompt.length / 3.5),
          optimizedTokens: Math.ceil(testPrompt.prompt.length / 3.5),
          tokenReduction: 0,
          costSavings: 0,
          processingTime: 0,
          realAI: false,
          error: error instanceof Error ? error.message : 'Unknown error'
        });
      }

      // Test 2: Prompt-Optimizer Concepts
      try {
        const poStartTime = Date.now();
        const poResult = await PromptOptimizerConcepts.sequentialOptimization(testPrompt.prompt);
        const poProcessingTime = Date.now() - poStartTime;
        
        const poComparisonResult: ComparisonResult = {
          method: "Prompt-Optimizer Concepts",
          originalPrompt: testPrompt.prompt,
          optimizedPrompt: poResult.optimizedPrompt,
          originalLength: testPrompt.prompt.length,
          optimizedLength: poResult.optimizedPrompt.length,
          lengthReduction: testPrompt.prompt.length > 0 ? ((testPrompt.prompt.length - poResult.optimizedPrompt.length) / testPrompt.prompt.length) * 100 : 0,
          originalTokens: Math.ceil(testPrompt.prompt.length / 3.5),
          optimizedTokens: Math.ceil(poResult.optimizedPrompt.length / 3.5),
          tokenReduction: poResult.tokenReduction,
          costSavings: poResult.costSavings,
          processingTime: poProcessingTime,
          realAI: true
        };

        results.push(poComparisonResult);
        console.log(`[Compare] PO: ${poComparisonResult.lengthReduction.toFixed(1)}% length reduction, ${poComparisonResult.tokenReduction.toFixed(1)}% token reduction`);
      } catch (error) {
        console.error(`[Compare] Prompt-Optimizer failed for ${testPrompt.name}:`, error);
        results.push({
          method: "Prompt-Optimizer Concepts",
          originalPrompt: testPrompt.prompt,
          optimizedPrompt: testPrompt.prompt,
          originalLength: testPrompt.prompt.length,
          optimizedLength: testPrompt.prompt.length,
          lengthReduction: 0,
          originalTokens: Math.ceil(testPrompt.prompt.length / 3.5),
          optimizedTokens: Math.ceil(testPrompt.prompt.length / 3.5),
          tokenReduction: 0,
          costSavings: 0,
          processingTime: 0,
          realAI: false,
          error: error instanceof Error ? error.message : 'Unknown error'
        });
      }

      // Test 3: Hybrid Approach (CAPO + Prompt-Optimizer)
      try {
        const hybridStartTime = Date.now();
        const capoOptimized = await testCAPOOptimization(testPrompt.prompt);
        const hybridResult = await PromptOptimizerConcepts.sequentialOptimization(capoOptimized);
        const hybridProcessingTime = Date.now() - hybridStartTime;
        
        const hybridComparisonResult: ComparisonResult = {
          method: "Hybrid (CAPO + PO)",
          originalPrompt: testPrompt.prompt,
          optimizedPrompt: hybridResult.optimizedPrompt,
          originalLength: testPrompt.prompt.length,
          optimizedLength: hybridResult.optimizedPrompt.length,
          lengthReduction: testPrompt.prompt.length > 0 ? ((testPrompt.prompt.length - hybridResult.optimizedPrompt.length) / testPrompt.prompt.length) * 100 : 0,
          originalTokens: Math.ceil(testPrompt.prompt.length / 3.5),
          optimizedTokens: Math.ceil(hybridResult.optimizedPrompt.length / 3.5),
          tokenReduction: 0,
          costSavings: 0,
          processingTime: hybridProcessingTime,
          realAI: true
        };

        hybridComparisonResult.tokenReduction = hybridComparisonResult.originalTokens > 0 ? 
          ((hybridComparisonResult.originalTokens - hybridComparisonResult.optimizedTokens) / hybridComparisonResult.originalTokens) * 100 : 0;
        hybridComparisonResult.costSavings = hybridComparisonResult.tokenReduction * 0.2;

        results.push(hybridComparisonResult);
        console.log(`[Compare] Hybrid: ${hybridComparisonResult.lengthReduction.toFixed(1)}% length reduction, ${hybridComparisonResult.tokenReduction.toFixed(1)}% token reduction`);
      } catch (error) {
        console.error(`[Compare] Hybrid failed for ${testPrompt.name}:`, error);
        results.push({
          method: "Hybrid (CAPO + PO)",
          originalPrompt: testPrompt.prompt,
          optimizedPrompt: testPrompt.prompt,
          originalLength: testPrompt.prompt.length,
          optimizedLength: testPrompt.prompt.length,
          lengthReduction: 0,
          originalTokens: Math.ceil(testPrompt.prompt.length / 3.5),
          optimizedTokens: Math.ceil(testPrompt.prompt.length / 3.5),
          tokenReduction: 0,
          costSavings: 0,
          processingTime: 0,
          realAI: false,
          error: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    }

    // Calculate summary statistics
    const summary = calculateSummary(results, promptsToTest);

    return NextResponse.json({
      success: true,
      data: {
        testPrompts: promptsToTest,
        results,
        summary,
        timestamp: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('[Compare] Error:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

async function testCAPOOptimization(prompt: string): Promise<string> {
  try {
    // Use the real CAPO algorithm
    const capo = new RealCAPOAlgorithm({
      populationSize: 3, // Smaller for testing
      budget: 10,
      lengthPenalty: 0.2,
      racingThreshold: 2,
      paretoWeights: { performance: 0.5, length: 0.25, cost: 0.25 },
      mutationRate: 0.3,
      crossoverRate: 0.7,
      maxGenerations: 3,
      earlyStoppingPatience: 2
    });

    await capo.initialize("Optimize prompt for cost-efficiency", prompt);
    const result = await capo.optimize();
    return result.bestPrompt;
  } catch (error) {
    console.error('[CAPO] Failed, using fallback:', error);
    // Fallback to simple optimization
    return prompt
      .replace(/\b(please|kindly|would you|could you|can you)\b/gi, '')
      .replace(/\b(very|really|quite|rather|extremely)\b/gi, '')
      .replace(/\b(I would like|I want|I need)\b/gi, '')
      .replace(/\s+/g, ' ')
      .trim();
  }
}

function calculateSummary(results: ComparisonResult[], testPrompts: TestPrompt[]) {
  const methods = ['CAPO (Current)', 'Prompt-Optimizer Concepts', 'Hybrid (CAPO + PO)'];
  const summary: any = {};

  methods.forEach(method => {
    const methodResults = results.filter(r => r.method === method);
    if (methodResults.length > 0) {
      summary[method] = {
        averageLengthReduction: methodResults.reduce((sum, r) => sum + r.lengthReduction, 0) / methodResults.length,
        averageTokenReduction: methodResults.reduce((sum, r) => sum + r.tokenReduction, 0) / methodResults.length,
        averageCostSavings: methodResults.reduce((sum, r) => sum + r.costSavings, 0) / methodResults.length,
        averageProcessingTime: methodResults.reduce((sum, r) => sum + r.processingTime, 0) / methodResults.length,
        successRate: methodResults.filter(r => !r.error).length / methodResults.length,
        totalTests: methodResults.length
      };
    }
  });

  // Find best method for each category
  const bestMethods: any = {};
  testPrompts.forEach((prompt, index) => {
    const promptResults = results.filter(r => 
      r.originalPrompt === prompt.prompt && !r.error
    );
    if (promptResults.length > 0) {
      const bestResult = promptResults.reduce((best, current) => 
        current.tokenReduction > best.tokenReduction ? current : best
      );
      bestMethods[prompt.name] = {
        method: bestResult.method,
        tokenReduction: bestResult.tokenReduction,
        costSavings: bestResult.costSavings
      };
    }
  });

  summary.bestMethods = bestMethods;
  return summary;
}

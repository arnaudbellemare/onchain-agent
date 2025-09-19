/**
 * Real CAPO Demo API Endpoint
 * Demonstrates the official CAPO algorithm with actual LLM evaluations
 */

import { NextRequest, NextResponse } from 'next/server';
import { capoOptimizer } from '@/lib/capoIntegration';
import { RealDatasets } from '@/lib/realDatasets';
import { withRateLimit } from '@/lib/rateLimiter';
import { rateLimitConfigs } from '@/lib/rateLimiter';

export async function POST(request: NextRequest) {
  try {
    const result = await withRateLimit(request, rateLimitConfigs.api, async (req: NextRequest) => {
      const body = await req.json();
      const { taskDescription, datasetName, config } = body;

      if (!taskDescription) {
        return new Response(
          JSON.stringify({
            error: 'Missing required field: taskDescription',
            message: 'Please provide a task description for CAPO optimization'
          }),
          {
            status: 400,
            headers: { 'Content-Type': 'application/json' }
          }
        );
      }

      console.log('Real CAPO Demo: Starting optimization');
      console.log('Task:', taskDescription);
      console.log('Dataset:', datasetName || 'financial_decisions');

      // Get available datasets
      const availableDatasets = capoOptimizer.getAvailableDatasets();
      
      // Use real CAPO implementation
      const optimizationResult = await capoOptimizer.optimizeWithRealCAPO(
        taskDescription,
        datasetName || 'financial_decisions',
        config
      );

      // Get racing statistics
      const racingStats = capoOptimizer.getRacingStats();

      const response = {
        success: true,
        message: 'Real CAPO optimization completed successfully',
        data: {
          optimization: {
            bestPrompt: optimizationResult.bestPrompt.prompt,
            instructions: optimizationResult.bestPrompt.instructions,
            examples: optimizationResult.bestPrompt.examples,
            accuracy: optimizationResult.finalAccuracy,
            costReduction: optimizationResult.costReduction,
            lengthReduction: optimizationResult.lengthReduction,
            totalEvaluations: optimizationResult.totalEvaluations,
            fitness: optimizationResult.bestPrompt.fitness
          },
          racing: {
            stats: racingStats,
            paretoFrontSize: optimizationResult.paretoFront.length,
            activeIndividuals: optimizationResult.paretoFront.filter((ind: any) => ind.isActive).length
          },
          datasets: {
            available: availableDatasets,
            used: datasetName || 'financial_decisions'
          },
          metadata: {
            algorithm: 'Real CAPO (Cost-Aware Prompt Optimization)',
            paper: 'CAPO: Cost-Aware Prompt Optimization (arXiv:2504.16005)',
            features: [
              'Real LLM evaluations',
              'Statistical significance testing',
              'Racing mechanism for early stopping',
              'Multi-objective optimization',
              'Pareto front optimization'
            ],
            timestamp: new Date().toISOString()
          }
        }
      };

      return new Response(JSON.stringify(response), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      });
    });

    return result;
  } catch (error) {
    console.error('Real CAPO Demo Error:', error);
    
    return new Response(
      JSON.stringify({
        error: 'Real CAPO optimization failed',
        message: error instanceof Error ? error.message : 'Unknown error occurred',
        details: 'Check server logs for more information'
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const result = await withRateLimit(request, rateLimitConfigs.public, async (req: NextRequest) => {
      // Get available datasets and configuration info
      const availableDatasets = capoOptimizer.getAvailableDatasets();
      const config = capoOptimizer.getConfig();

      const response = {
        success: true,
        message: 'Real CAPO API endpoint information',
        data: {
          availableDatasets,
          config: {
            populationSize: config.populationSize,
            budget: config.budget,
            lengthPenalty: config.lengthPenalty,
            racingThreshold: config.racingThreshold,
            paretoWeights: config.paretoWeights
          },
          algorithm: {
            name: 'Real CAPO (Cost-Aware Prompt Optimization)',
            paper: 'CAPO: Cost-Aware Prompt Optimization (arXiv:2504.16005)',
            features: [
              'Real LLM evaluations with actual API calls',
              'Statistical significance testing for racing',
              'Early stopping based on confidence intervals',
              'Multi-objective optimization (accuracy, cost, length)',
              'Pareto front optimization',
              'Real benchmark dataset integration'
            ],
            improvements: [
              'Replaces simulated evaluations with real LLM calls',
              'Implements proper statistical racing mechanism',
              'Uses actual benchmark datasets for evaluation',
              'Follows official CAPO algorithm from paper'
            ]
          },
          usage: {
            method: 'POST',
            endpoint: '/api/real-capo-demo',
            requiredFields: ['taskDescription'],
            optionalFields: ['datasetName', 'config'],
            example: {
              taskDescription: 'Optimize payment routing for cost efficiency',
              datasetName: 'financial_decisions',
              config: {
                populationSize: 20,
                budget: 100,
                lengthPenalty: 0.2
              }
            }
          }
        }
      };

      return new Response(JSON.stringify(response), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      });
    });

    return result;
  } catch (error) {
    console.error('Real CAPO Demo GET Error:', error);
    
    return new Response(
      JSON.stringify({
        error: 'Failed to get CAPO information',
        message: error instanceof Error ? error.message : 'Unknown error occurred'
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
}

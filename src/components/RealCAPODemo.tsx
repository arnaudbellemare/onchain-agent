/**
 * Real CAPO Demo Component
 * Demonstrates the official CAPO algorithm with actual LLM evaluations
 */

import React, { useState } from 'react';

interface OptimizationResult {
  bestPrompt: {
    prompt: string;
    instructions: string;
    examples: string[];
    accuracy: number;
    costReduction: number;
    lengthReduction: number;
    totalEvaluations: number;
    fitness: number;
  };
  racing: {
    stats: Record<string, any>;
    paretoFrontSize: number;
    activeIndividuals: number;
  };
  datasets: {
    available: string[];
    used: string;
  };
  metadata: {
    algorithm: string;
    paper: string;
    features: string[];
    timestamp: string;
  };
}

export default function RealCAPODemo() {
  const [taskDescription, setTaskDescription] = useState('Optimize payment routing for cost efficiency');
  const [datasetName, setDatasetName] = useState('financial_decisions');
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [result, setResult] = useState<OptimizationResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [availableDatasets, setAvailableDatasets] = useState<string[]>([]);

  // Load available datasets on component mount
  React.useEffect(() => {
    const loadDatasets = async () => {
      try {
        const response = await fetch('/api/real-capo-demo');
        const data = await response.json();
        if (data.success) {
          setAvailableDatasets(data.data.availableDatasets);
        }
      } catch (err) {
        console.error('Failed to load datasets:', err);
      }
    };
    loadDatasets();
  }, []);

  const handleOptimize = async () => {
    if (!taskDescription.trim()) {
      setError('Please enter a task description');
      return;
    }

    setIsOptimizing(true);
    setError(null);
    setResult(null);

    try {
      const response = await fetch('/api/real-capo-demo', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          taskDescription: taskDescription.trim(),
          datasetName,
          config: {
            populationSize: 20,
            budget: 100,
            lengthPenalty: 0.2,
            racingThreshold: 5
          }
        }),
      });

      const data = await response.json();

      if (data.success) {
        setResult(data.data);
      } else {
        setError(data.message || 'Optimization failed');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Network error occurred');
    } finally {
      setIsOptimizing(false);
    }
  };

  const formatPercentage = (value: number) => `${value.toFixed(1)}%`;
  const formatNumber = (value: number) => value.toFixed(3);

  return (
    <div className="max-w-6xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Real CAPO Demo
        </h1>
        <p className="text-gray-600 mb-4">
          Official Cost-Aware Prompt Optimization with actual LLM evaluations
        </p>
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="font-semibold text-blue-900 mb-2">Algorithm Features:</h3>
          <ul className="text-blue-800 text-sm space-y-1">
            <li>✅ Real LLM evaluations with actual API calls</li>
            <li>✅ Statistical significance testing for racing</li>
            <li>✅ Early stopping based on confidence intervals</li>
            <li>✅ Multi-objective optimization (accuracy, cost, length)</li>
            <li>✅ Pareto front optimization</li>
            <li>✅ Real benchmark dataset integration</li>
          </ul>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Input Section */}
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Task Description
            </label>
            <textarea
              value={taskDescription}
              onChange={(e) => setTaskDescription(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              rows={3}
              placeholder="Describe the optimization task..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Dataset
            </label>
            <select
              value={datasetName}
              onChange={(e) => setDatasetName(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              {availableDatasets.map((dataset) => (
                <option key={dataset} value={dataset}>
                  {dataset.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                </option>
              ))}
            </select>
          </div>

          <button
            onClick={handleOptimize}
            disabled={isOptimizing}
            className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isOptimizing ? (
              <span className="flex items-center justify-center">
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Optimizing with Real CAPO...
              </span>
            ) : (
              'Start Real CAPO Optimization'
            )}
          </button>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-red-800 text-sm">{error}</p>
            </div>
          )}
        </div>

        {/* Results Section */}
        <div className="space-y-4">
          {result && (
            <>
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <h3 className="font-semibold text-green-900 mb-3">Optimization Results</h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-green-700 font-medium">Accuracy:</span>
                    <span className="ml-2 text-green-800">{formatNumber(result.bestPrompt.accuracy)}</span>
                  </div>
                  <div>
                    <span className="text-green-700 font-medium">Cost Reduction:</span>
                    <span className="ml-2 text-green-800">{formatPercentage(result.bestPrompt.costReduction)}</span>
                  </div>
                  <div>
                    <span className="text-green-700 font-medium">Length Reduction:</span>
                    <span className="ml-2 text-green-800">{formatPercentage(result.bestPrompt.lengthReduction)}</span>
                  </div>
                  <div>
                    <span className="text-green-700 font-medium">Evaluations:</span>
                    <span className="ml-2 text-green-800">{result.bestPrompt.totalEvaluations}</span>
                  </div>
                  <div>
                    <span className="text-green-700 font-medium">Fitness Score:</span>
                    <span className="ml-2 text-green-800">{formatNumber(result.bestPrompt.fitness)}</span>
                  </div>
                  <div>
                    <span className="text-green-700 font-medium">Pareto Front:</span>
                    <span className="ml-2 text-green-800">{result.racing.paretoFrontSize}</span>
                  </div>
                </div>
              </div>

              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                <h3 className="font-semibold text-gray-900 mb-3">Optimized Prompt</h3>
                <div className="space-y-3">
                  <div>
                    <h4 className="font-medium text-gray-700 mb-1">Instructions:</h4>
                    <p className="text-sm text-gray-600 bg-white p-2 rounded border">
                      {result.bestPrompt.instructions}
                    </p>
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-700 mb-1">Examples:</h4>
                    <div className="space-y-2">
                      {result.bestPrompt.examples.map((example, index) => (
                        <p key={index} className="text-sm text-gray-600 bg-white p-2 rounded border">
                          {example}
                        </p>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h3 className="font-semibold text-blue-900 mb-3">Racing Statistics</h3>
                <div className="text-sm text-blue-800">
                  <p>Active Individuals: {result.racing.activeIndividuals}</p>
                  <p>Pareto Front Size: {result.racing.paretoFrontSize}</p>
                  <div className="mt-2">
                    <h4 className="font-medium mb-1">Individual Stats:</h4>
                    <div className="max-h-32 overflow-y-auto">
                      {Object.entries(result.racing.stats).map(([id, stats]: [string, any]) => (
                        <div key={id} className="text-xs">
                          {id}: {stats.evaluations} evals, {stats.shouldStop ? 'stopped' : 'active'} 
                          ({stats.confidence.toFixed(1)}% confidence)
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                <h3 className="font-semibold text-purple-900 mb-3">Algorithm Info</h3>
                <div className="text-sm text-purple-800">
                  <p><strong>Paper:</strong> {result.metadata.paper}</p>
                  <p><strong>Dataset Used:</strong> {result.datasets.used}</p>
                  <p><strong>Timestamp:</strong> {new Date(result.metadata.timestamp).toLocaleString()}</p>
                </div>
              </div>
            </>
          )}

          {!result && !isOptimizing && (
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-8 text-center">
              <p className="text-gray-500">Enter a task description and click &quot;Start Real CAPO Optimization&quot; to see results</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

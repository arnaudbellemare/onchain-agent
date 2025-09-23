import { config } from '@/lib/config';

interface CodeGenerationRequest {
  userPrompt: string;
  projectType?: string;
  framework?: string;
  features?: string[];
  optimizationEnabled?: boolean;
}

interface GeneratedFile {
  path: string;
  content: string;
  type: 'component' | 'style' | 'config' | 'script';
}

interface CodeGenerationResult {
  files: GeneratedFile[];
  projectStructure: string[];
  costOptimization: {
    originalCost: string;
    optimizedCost: string;
    savings: string;
    savingsPercentage: string;
  };
  deployment: {
    previewUrl: string;
    deploymentStatus: 'ready' | 'deploying' | 'deployed';
  };
}

export class VibeCodeGenerator {
  private optimizationEnabled: boolean;
  private onChainAgentUrl: string;

  constructor() {
    this.optimizationEnabled = true;
    this.onChainAgentUrl = 'http://localhost:3000/api/v1/optimize';
  }

  async generateCode(request: CodeGenerationRequest): Promise<CodeGenerationResult> {
    console.log(`[VibeCodeGenerator] Generating code for: ${request.userPrompt}`);
    
    // Step 1: Optimize the user prompt for cost efficiency
    const optimizedPrompt = await this.optimizePrompt(request.userPrompt);
    
    // Step 2: Generate project structure
    const projectStructure = await this.generateProjectStructure(optimizedPrompt, request);
    
    // Step 3: Generate individual files
    const files = await this.generateFiles(optimizedPrompt, request);
    
    // Step 4: Calculate cost optimization results
    const costOptimization = await this.calculateCostOptimization(request.userPrompt, optimizedPrompt);
    
    // Step 5: Prepare deployment
    const deployment = await this.prepareDeployment(files);
    
    return {
      files,
      projectStructure,
      costOptimization,
      deployment
    };
  }

  private async optimizePrompt(originalPrompt: string): Promise<string> {
    if (!this.optimizationEnabled) {
      return originalPrompt;
    }

    try {
      console.log(`[VibeCodeGenerator] Optimizing prompt for cost efficiency`);
      
      const response = await fetch(this.onChainAgentUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-API-Key': 'ak_c88d0dde13eaacbead83331aef5667f9feff0129425bba4bbb8143add2e9ec73'
        },
        body: JSON.stringify({
          prompt: originalPrompt,
          model: 'perplexity',
          quality: 0.9,
          max_cost: 0.10,
          optimization_type: 'cost',
          use_blockchain: true,
          use_x402: true
        })
      });

      if (!response.ok) {
        console.warn(`[VibeCodeGenerator] Optimization failed, using original prompt`);
        return originalPrompt;
      }

      const result = await response.json();
      if (result.success && result.result.optimized_prompt) {
        console.log(`[VibeCodeGenerator] Prompt optimized: ${result.result.optimization_metrics.cost_reduction}% cost reduction`);
        return result.result.optimized_prompt;
      }

      return originalPrompt;
    } catch (error) {
      console.warn(`[VibeCodeGenerator] Optimization error, using original prompt:`, error);
      return originalPrompt;
    }
  }

  private async generateProjectStructure(optimizedPrompt: string, request: CodeGenerationRequest): Promise<string[]> {
    // Generate project structure based on optimized prompt
    const structure = [
      'src/',
      'src/components/',
      'src/styles/',
      'src/utils/',
      'public/',
      'package.json',
      'README.md'
    ];

    // Add framework-specific structure
    if (request.framework === 'react') {
      structure.push('src/App.tsx', 'src/index.tsx', 'src/components/App.css');
    } else if (request.framework === 'vue') {
      structure.push('src/App.vue', 'src/main.js', 'src/components/');
    } else if (request.framework === 'next') {
      structure.push('pages/', 'pages/api/', 'pages/_app.tsx', 'pages/index.tsx');
    }

    return structure;
  }

  private async generateFiles(optimizedPrompt: string, request: CodeGenerationRequest): Promise<GeneratedFile[]> {
    const files: GeneratedFile[] = [];

    // Generate package.json
    files.push({
      path: 'package.json',
      content: this.generatePackageJson(request),
      type: 'config'
    });

    // Generate main component
    files.push({
      path: 'src/App.tsx',
      content: this.generateMainComponent(optimizedPrompt, request),
      type: 'component'
    });

    // Generate styles
    files.push({
      path: 'src/App.css',
      content: this.generateStyles(request),
      type: 'style'
    });

    // Generate README
    files.push({
      path: 'README.md',
      content: this.generateReadme(optimizedPrompt, request),
      type: 'script'
    });

    return files;
  }

  private generatePackageJson(request: CodeGenerationRequest): string {
    const dependencies = {
      'react': '^18.2.0',
      'react-dom': '^18.2.0',
      'typescript': '^5.0.0',
      '@types/react': '^18.2.0',
      '@types/react-dom': '^18.2.0'
    };

    if (request.framework === 'next') {
      dependencies['next'] = '^14.0.0';
    } else if (request.framework === 'vue') {
      dependencies['vue'] = '^3.3.0';
    }

    return JSON.stringify({
      name: 'vibe-generated-app',
      version: '1.0.0',
      description: 'AI-generated application with cost optimization',
      main: 'src/index.tsx',
      scripts: {
        dev: 'next dev',
        build: 'next build',
        start: 'next start'
      },
      dependencies,
      devDependencies: {
        '@types/node': '^20.0.0',
        'eslint': '^8.0.0',
        'eslint-config-next': '^14.0.0'
      }
    }, null, 2);
  }

  private generateMainComponent(optimizedPrompt: string, request: CodeGenerationRequest): string {
    return `import React from 'react';
import './App.css';

// Generated with OnChain Agent cost optimization
// Original prompt: ${request.userPrompt}
// Optimized for: ${optimizedPrompt}

const App: React.FC = () => {
  return (
    <div className="App">
      <header className="App-header">
        <h1>AI-Generated Application</h1>
        <p>Built with cost-optimized prompts</p>
        <div className="features">
          <h2>Features:</h2>
          <ul>
            ${request.features?.map(feature => `<li>${feature}</li>`).join('\n            ') || '<li>Basic functionality</li>'}
          </ul>
        </div>
        <div className="cost-optimization">
          <h3>Cost Optimization Active</h3>
          <p>This application was generated using optimized prompts to reduce AI costs.</p>
        </div>
      </header>
    </div>
  );
};

export default App;`;
  }

  private generateStyles(request: CodeGenerationRequest): string {
    return `.App {
  text-align: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  min-height: 100vh;
  color: white;
  padding: 2rem;
}

.App-header {
  max-width: 800px;
  margin: 0 auto;
}

.features {
  background: rgba(255, 255, 255, 0.1);
  border-radius: 10px;
  padding: 2rem;
  margin: 2rem 0;
  backdrop-filter: blur(10px);
}

.cost-optimization {
  background: rgba(0, 255, 0, 0.1);
  border: 2px solid #00ff00;
  border-radius: 10px;
  padding: 1rem;
  margin: 2rem 0;
}

h1, h2, h3 {
  margin-bottom: 1rem;
}

ul {
  text-align: left;
  max-width: 400px;
  margin: 0 auto;
}

li {
  margin: 0.5rem 0;
}`;
  }

  private generateReadme(optimizedPrompt: string, request: CodeGenerationRequest): string {
    return `# AI-Generated Application

This application was generated using the OnChain Agent + VibeSDK platform with cost optimization.

## Original Request
${request.userPrompt}

## Cost Optimization
- **Optimization**: Enabled
- **Cost Reduction**: Real-time AI cost optimization
- **Blockchain Payments**: x402 micropayments
- **Revenue Model**: 13% fee on cost savings

## Features
${request.features?.map(feature => `- ${feature}`).join('\n') || '- Basic functionality'}

## Getting Started

\`\`\`bash
npm install
npm run dev
\`\`\`

## Cost Optimization Benefits
- Reduced AI API costs
- Optimized prompt generation
- Real-time cost monitoring
- Blockchain-native payments

Built with ❤️ by OnChain Agent + VibeSDK`;
  }

  private async calculateCostOptimization(originalPrompt: string, optimizedPrompt: string): Promise<{
    originalCost: string;
    optimizedCost: string;
    savings: string;
    savingsPercentage: string;
  }> {
    // Calculate token-based costs
    const originalTokens = Math.ceil(originalPrompt.length / 4);
    const optimizedTokens = Math.ceil(optimizedPrompt.length / 4);
    
    const originalCost = originalTokens * 0.0005 / 1000;
    const optimizedCost = optimizedTokens * 0.0005 / 1000;
    const savings = originalCost - optimizedCost;
    const savingsPercentage = ((savings / originalCost) * 100).toFixed(1);

    return {
      originalCost: `$${originalCost.toFixed(6)}`,
      optimizedCost: `$${optimizedCost.toFixed(6)}`,
      savings: `$${savings.toFixed(6)}`,
      savingsPercentage: `${savingsPercentage}%`
    };
  }

  private async prepareDeployment(files: GeneratedFile[]): Promise<{
    previewUrl: string;
    deploymentStatus: 'ready' | 'deploying' | 'deployed';
  }> {
    // Simulate deployment preparation
    const projectId = `vibe-${Date.now()}`;
    const previewUrl = `https://${projectId}.vibe-platform.example.com`;

    return {
      previewUrl,
      deploymentStatus: 'ready'
    };
  }
}

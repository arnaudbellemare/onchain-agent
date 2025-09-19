/**
 * Quick Start Example: AI Agent with Cost Optimization (JavaScript)
 * Copy and paste this code to get started in under 5 minutes!
 */

class CostOptimizedAIAgent {
    constructor(apiKey, baseUrl = "https://your-domain.com/api/v1") {
        this.apiKey = apiKey;
        this.baseUrl = baseUrl;
        this.totalCost = 0;
        this.totalSaved = 0;
        this.totalCalls = 0;
    }
    
    async chat(message, maxCost = 0.05) {
        /**
         * Send a message to the AI and get an optimized response
         */
        try {
            const response = await fetch(this.baseUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-API-Key': this.apiKey
                },
                body: JSON.stringify({
                    action: 'optimize',
                    prompt: message,
                    maxCost: maxCost
                })
            });
            
            if (response.ok) {
                const result = await response.json();
                if (result.success) {
                    // Track usage
                    this.totalCost += result.data.optimizedCost;
                    this.totalSaved += result.data.savings;
                    this.totalCalls += 1;
                    
                    return {
                        message: result.data.optimizedResponse,
                        cost: result.data.optimizedCost,
                        saved: result.data.savings,
                        provider: result.data.recommendedProvider
                    };
                }
            }
            
            return { error: 'Failed to get response' };
        } catch (error) {
            return { error: error.message };
        }
    }
    
    getSavingsReport() {
        /**
         * Get a summary of your cost savings
         */
        const totalSpent = this.totalCost + this.totalSaved;
        const savingsPercentage = totalSpent > 0 ? (this.totalSaved / totalSpent * 100) : 0;
        
        return {
            totalCalls: this.totalCalls,
            totalCost: this.totalCost,
            totalSaved: this.totalSaved,
            savingsPercentage: savingsPercentage,
            effectiveCost: this.totalCost // What you actually paid
        };
    }
    
    async batchProcess(messages, maxCostPerMessage = 0.03) {
        /**
         * Process multiple messages efficiently
         */
        const results = [];
        for (const message of messages) {
            const result = await this.chat(message, maxCostPerMessage);
            results.push(result);
        }
        return results;
    }
}

async function main() {
    // Step 1: Replace with your API key from /api-keys
    const API_KEY = "oa_your_api_key_here";
    
    // Step 2: Create your AI agent
    const agent = new CostOptimizedAIAgent(API_KEY);
    
    // Step 3: Start chatting!
    console.log("🤖 AI Agent with Cost Optimization");
    console.log("=".repeat(40));
    
    // Example conversations
    const messages = [
        "Explain quantum computing in simple terms",
        "Write a creative story about a robot learning to paint",
        "Help me debug this JavaScript code: function factorial(n) { return n > 1 ? n * factorial(n-1) : 1; }"
    ];
    
    for (let i = 0; i < messages.length; i++) {
        const message = messages[i];
        console.log(`\n💬 Message ${i + 1}: ${message}`);
        
        const result = await agent.chat(message);
        
        if (!result.error) {
            console.log(`🤖 Response: ${result.message.substring(0, 100)}...`);
            console.log(`💰 Cost: $${result.cost.toFixed(4)}`);
            console.log(`💵 Saved: $${result.saved.toFixed(4)}`);
            console.log(`🔧 Provider: ${result.provider}`);
        } else {
            console.log(`❌ Error: ${result.error}`);
        }
    }
    
    // Step 4: Check your savings!
    const report = agent.getSavingsReport();
    console.log("\n📊 Savings Report:");
    console.log("=".repeat(30));
    console.log(`Total Calls: ${report.totalCalls}`);
    console.log(`Total Cost: $${report.totalCost.toFixed(4)}`);
    console.log(`Total Saved: $${report.totalSaved.toFixed(4)}`);
    console.log(`Savings: ${report.savingsPercentage.toFixed(1)}%`);
    console.log(`Effective Cost: $${report.effectiveCost.toFixed(4)}`);
}

// Run the example
if (typeof window === 'undefined') {
    // Node.js environment
    main().catch(console.error);
} else {
    // Browser environment
    console.log("Run main() to start the example");
}

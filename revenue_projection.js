// AI Agent Revenue Projection Calculator
// Based on real test data from optimization API

console.log("🚀 AI AGENT REVENUE PROJECTION");
console.log("=" .repeat(50));

// Test data from real API calls
const testResults = [
  { size: "Micro (2 chars)", originalCost: 0.000293, optimizedCost: 0.000288, savings: 0.000005, fee: 0 },
  { size: "Small (26 chars)", originalCost: 0.000815, optimizedCost: 0.000797, savings: 0.000018, fee: 0 },
  { size: "Medium (46 chars)", originalCost: 0.002087, optimizedCost: 0.002057, savings: 0.000030, fee: 0 },
  { size: "Large (278 chars)", originalCost: 0.004132, optimizedCost: 0.003903, savings: 0.000230, fee: 0.000018 },
  { size: "X-Large (429 chars)", originalCost: 0.003788, optimizedCost: 0.003268, savings: 0.000520, fee: 0.000042 },
  { size: "Mega (635 chars)", originalCost: 0.005527, optimizedCost: 0.005027, savings: 0.000500, fee: 0.000040 }
];

// Calculate weighted average based on typical usage patterns
// Most AI agents use medium to large prompts (80% of traffic)
const usageDistribution = {
  "Micro": 0.05,    // 5% - simple greetings, confirmations
  "Small": 0.10,    // 10% - basic questions
  "Medium": 0.25,   // 25% - standard customer service
  "Large": 0.35,    // 35% - detailed support, e-commerce
  "X-Large": 0.20,  // 20% - complex analysis, reports
  "Mega": 0.05      // 5% - comprehensive analysis
};

console.log("\n📊 USAGE DISTRIBUTION:");
Object.entries(usageDistribution).forEach(([size, percentage]) => {
  console.log(`${size.padEnd(10)}: ${(percentage * 100).toString().padStart(5)}%`);
});

// Calculate weighted averages
let totalWeightedSavings = 0;
let totalWeightedFees = 0;
let totalWeightedOriginalCost = 0;
let totalWeightedOptimizedCost = 0;

const sizeMapping = {
  "Micro": 0, "Small": 1, "Medium": 2, 
  "Large": 3, "X-Large": 4, "Mega": 5
};

Object.entries(usageDistribution).forEach(([size, weight]) => {
  const index = sizeMapping[size];
  const result = testResults[index];
  
  totalWeightedSavings += result.savings * weight;
  totalWeightedFees += result.fee * weight;
  totalWeightedOriginalCost += result.originalCost * weight;
  totalWeightedOptimizedCost += result.optimizedCost * weight;
});

console.log("\n💰 WEIGHTED AVERAGES (per request):");
console.log(`Original Cost:  $${totalWeightedOriginalCost.toFixed(6)}`);
console.log(`Optimized Cost: $${totalWeightedOptimizedCost.toFixed(6)}`);
console.log(`Savings:        $${totalWeightedSavings.toFixed(6)}`);
console.log(`Our Fee (8%):   $${totalWeightedFees.toFixed(6)}`);
console.log(`Client Net:     $${(totalWeightedSavings - totalWeightedFees).toFixed(6)}`);

// Projection calculations
const agents = 1000;
const requestsPerMonth = 10000;
const totalRequests = agents * requestsPerMonth;

console.log("\n🎯 MONTHLY PROJECTION:");
console.log(`Agents: ${agents.toLocaleString()}`);
console.log(`Requests per Agent: ${requestsPerMonth.toLocaleString()}`);
console.log(`Total Monthly Requests: ${totalRequests.toLocaleString()}`);

const monthlyRevenue = totalRequests * totalWeightedFees;
const monthlyClientSavings = totalRequests * (totalWeightedSavings - totalWeightedFees);
const monthlyTotalSavings = totalRequests * totalWeightedSavings;

console.log("\n💵 MONTHLY REVENUE BREAKDOWN:");
console.log(`Our Revenue (8% fees): $${monthlyRevenue.toFixed(2)}`);
console.log(`Client Net Savings:    $${monthlyClientSavings.toFixed(2)}`);
console.log(`Total Savings Created: $${monthlyTotalSavings.toFixed(2)}`);

console.log("\n📈 ANNUAL PROJECTION:");
console.log(`Our Annual Revenue:    $${(monthlyRevenue * 12).toFixed(2)}`);
console.log(`Client Annual Savings: $${(monthlyClientSavings * 12).toFixed(2)}`);
console.log(`Total Annual Savings:  $${(monthlyTotalSavings * 12).toFixed(2)}`);

// Revenue per agent
console.log("\n🤖 PER-AGENT METRICS:");
console.log(`Revenue per Agent/Month: $${(monthlyRevenue / agents).toFixed(4)}`);
console.log(`Revenue per Agent/Year:  $${(monthlyRevenue * 12 / agents).toFixed(2)}`);
console.log(`Client Savings/Agent/Month: $${(monthlyClientSavings / agents).toFixed(4)}`);
console.log(`Client Savings/Agent/Year:  $${(monthlyClientSavings * 12 / agents).toFixed(2)}`);

// Scaling scenarios
console.log("\n🚀 SCALING SCENARIOS:");
const scenarios = [
  { agents: 100, requests: 10000, label: "100 agents, 10k req/month" },
  { agents: 500, requests: 10000, label: "500 agents, 10k req/month" },
  { agents: 1000, requests: 10000, label: "1,000 agents, 10k req/month" },
  { agents: 1000, requests: 50000, label: "1,000 agents, 50k req/month" },
  { agents: 5000, requests: 10000, label: "5,000 agents, 10k req/month" },
  { agents: 10000, requests: 10000, label: "10,000 agents, 10k req/month" }
];

scenarios.forEach(scenario => {
  const totalReq = scenario.agents * scenario.requests;
  const revenue = totalReq * totalWeightedFees;
  const clientSavings = totalReq * (totalWeightedSavings - totalWeightedFees);
  
  console.log(`${scenario.label.padEnd(35)} | Revenue: $${revenue.toFixed(0).padStart(8)} | Client Savings: $${clientSavings.toFixed(0).padStart(8)}`);
});

// Efficiency metrics
console.log("\n⚡ EFFICIENCY METRICS:");
console.log(`Average Optimization: ${((totalWeightedSavings / totalWeightedOriginalCost) * 100).toFixed(1)}%`);
console.log(`Fee Rate: ${((totalWeightedFees / totalWeightedSavings) * 100).toFixed(1)}% of savings`);
console.log(`Client Keeps: ${(((totalWeightedSavings - totalWeightedFees) / totalWeightedSavings) * 100).toFixed(1)}% of savings`);

// Cost breakdown
console.log("\n💸 COST BREAKDOWN (per 1M requests):");
const perMillion = 1000000;
console.log(`Original Cost:  $${(totalWeightedOriginalCost * perMillion).toFixed(2)}`);
console.log(`Optimized Cost: $${(totalWeightedOptimizedCost * perMillion).toFixed(2)}`);
console.log(`Total Savings:  $${(totalWeightedSavings * perMillion).toFixed(2)}`);
console.log(`Our Revenue:    $${(totalWeightedFees * perMillion).toFixed(2)}`);

console.log("\n" + "=".repeat(50));
console.log("🎉 PROJECTION COMPLETE!");

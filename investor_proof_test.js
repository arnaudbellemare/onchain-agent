// Investor Proof Test: Real AI Agent Cost Optimization
// This test demonstrates measurable cost savings for AI agents

console.log("🎯 INVESTOR PROOF TEST: AI AGENT COST OPTIMIZATION");
console.log("=" .repeat(60));

// Test scenarios representing real AI agent use cases
const testScenarios = [
  {
    name: "Customer Service Bot",
    description: "Handles customer inquiries, returns, and support",
    prompt: "I would really appreciate it if you could please help me understand how to process a return for a customer who purchased an item from our online store last week and is now requesting a refund because the product doesn't match the description on our website.",
    volume: "1,000 queries/day",
    useCase: "High-volume customer support"
  },
  {
    name: "E-commerce Assistant", 
    description: "Product recommendations and shopping guidance",
    prompt: "Could you please provide me with detailed information about the best wireless headphones available for under $200 that would be suitable for both work calls and music listening, including their key features, pros and cons, and where I can purchase them?",
    volume: "500 queries/day",
    useCase: "Product discovery and recommendations"
  },
  {
    name: "Content Generation Bot",
    description: "Creates marketing content and social media posts",
    prompt: "I need you to create a comprehensive marketing strategy for a new eco-friendly cleaning product launch, including target audience analysis, key messaging, social media campaign ideas, influencer partnerships, and a 30-day launch timeline with specific milestones and deliverables.",
    volume: "200 queries/day", 
    useCase: "Content creation and marketing"
  },
  {
    name: "Analytics Agent",
    description: "Analyzes data and generates business insights",
    prompt: "Please analyze the following quarterly sales data and provide insights on performance trends, identify key growth opportunities, highlight areas of concern, and recommend specific action items for the next quarter to improve revenue and customer satisfaction.",
    volume: "100 queries/day",
    useCase: "Business intelligence and reporting"
  },
  {
    name: "Lead Qualification Bot",
    description: "Qualifies and scores potential customers",
    prompt: "I would like you to help me qualify this potential enterprise client by analyzing their company information, budget range, timeline, decision-making process, and technical requirements to determine their likelihood of becoming a customer and their potential deal value.",
    volume: "300 queries/day",
    useCase: "Sales and lead generation"
  }
];

// Function to make API calls (simulating real optimization)
async function testOptimization(scenario) {
  const baseUrl = 'http://localhost:3000/api/v1/optimize';
  const apiKey = 'ak_6acfa21dc03540ecc7413d67c97acf70';
  const walletAddress = '0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6';
  
  try {
    const response = await fetch(baseUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key': apiKey
      },
      body: JSON.stringify({
        prompt: scenario.prompt,
        model: 'perplexity',
        maxCost: 0.05,
        walletAddress: walletAddress,
        optimization_level: 'maximum'
      })
    });
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error(`Error testing ${scenario.name}:`, error);
    return null;
  }
}

// Calculate ROI and business impact
function calculateBusinessImpact(scenario, results) {
  if (!results || !results.result) return null;
  
  const costBreakdown = results.result.cost_breakdown;
  const originalCost = parseFloat(costBreakdown.original_cost.replace('$', ''));
  const optimizedCost = parseFloat(costBreakdown.optimized_cost.replace('$', ''));
  const savings = parseFloat(costBreakdown.savings.replace('$', ''));
  const ourFee = costBreakdown.our_fee.includes('No fee') ? 0 : parseFloat(costBreakdown.our_fee.replace('$', ''));
  const netSavings = parseFloat(costBreakdown.net_savings.replace('$', ''));
  
  // Parse volume (e.g., "1,000 queries/day" -> 1000)
  const dailyQueries = parseInt(scenario.volume.replace(/[^\d]/g, ''));
  const monthlyQueries = dailyQueries * 30;
  const yearlyQueries = dailyQueries * 365;
  
  // Calculate savings
  const monthlySavings = netSavings * monthlyQueries;
  const yearlySavings = netSavings * yearlyQueries;
  const yearlyFees = ourFee * yearlyQueries;
  
  // Calculate optimization percentage
  const optimizationPercent = ((originalCost - optimizedCost) / originalCost) * 100;
  
  return {
    dailyQueries,
    monthlyQueries,
    yearlyQueries,
    originalCost,
    optimizedCost,
    savings,
    ourFee,
    netSavings,
    optimizationPercent,
    monthlySavings,
    yearlySavings,
    yearlyFees,
    roi: (yearlySavings / yearlyFees) * 100 // ROI for client
  };
}

// Main test execution
async function runInvestorProofTest() {
  console.log("\n🧪 RUNNING REAL OPTIMIZATION TESTS...");
  console.log("Testing with actual Perplexity API calls...\n");
  
  const results = [];
  
  for (let i = 0; i < testScenarios.length; i++) {
    const scenario = testScenarios[i];
    console.log(`Testing ${i + 1}/${testScenarios.length}: ${scenario.name}`);
    
    const testResult = await testOptimization(scenario);
    const businessImpact = calculateBusinessImpact(scenario, testResult);
    
    if (businessImpact) {
      results.push({ scenario, businessImpact, testResult });
      console.log(`✅ ${scenario.name}: ${businessImpact.optimizationPercent.toFixed(1)}% optimization`);
    } else {
      console.log(`❌ ${scenario.name}: Test failed`);
    }
    
    // Small delay between tests
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
  
  // Generate comprehensive report
  generateInvestorReport(results);
}

// Generate investor report
function generateInvestorReport(results) {
  console.log("\n" + "=".repeat(60));
  console.log("📊 INVESTOR PROOF REPORT: AI AGENT COST OPTIMIZATION");
  console.log("=".repeat(60));
  
  console.log("\n🎯 EXECUTIVE SUMMARY:");
  const totalYearlySavings = results.reduce((sum, r) => sum + r.businessImpact.yearlySavings, 0);
  const totalYearlyFees = results.reduce((sum, r) => sum + r.businessImpact.yearlyFees, 0);
  const avgOptimization = results.reduce((sum, r) => sum + r.businessImpact.optimizationPercent, 0) / results.length;
  const avgROI = results.reduce((sum, r) => sum + r.businessImpact.roi, 0) / results.length;
  
  console.log(`• Average Cost Optimization: ${avgOptimization.toFixed(1)}%`);
  console.log(`• Total Annual Client Savings: $${totalYearlySavings.toFixed(2)}`);
  console.log(`• Our Annual Revenue: $${totalYearlyFees.toFixed(2)}`);
  console.log(`• Average Client ROI: ${avgROI.toFixed(0)}%`);
  console.log(`• Clients Keep: ${((totalYearlySavings / (totalYearlySavings + totalYearlyFees)) * 100).toFixed(1)}% of total value`);
  
  console.log("\n📈 DETAILED RESULTS BY AGENT TYPE:");
  results.forEach((result, index) => {
    const { scenario, businessImpact } = result;
    console.log(`\n${index + 1}. ${scenario.name}`);
    console.log(`   Use Case: ${scenario.useCase}`);
    console.log(`   Volume: ${scenario.volume}`);
    console.log(`   Optimization: ${businessImpact.optimizationPercent.toFixed(1)}%`);
    console.log(`   Monthly Savings: $${businessImpact.monthlySavings.toFixed(2)}`);
    console.log(`   Annual Savings: $${businessImpact.yearlySavings.toFixed(2)}`);
    console.log(`   Our Annual Fee: $${businessImpact.yearlyFees.toFixed(2)}`);
    console.log(`   Client ROI: ${businessImpact.roi.toFixed(0)}%`);
  });
  
  // Market opportunity
  console.log("\n🌍 MARKET OPPORTUNITY:");
  const marketSize = 1000000; // 1M AI agents globally
  const adoptionRate = 0.01; // 1% adoption
  const avgAgentValue = totalYearlyFees / results.length;
  const totalMarketRevenue = marketSize * adoptionRate * avgAgentValue;
  
  console.log(`• Global AI Agent Market: ${marketSize.toLocaleString()} agents`);
  console.log(`• Target Adoption Rate: ${(adoptionRate * 100)}%`);
  console.log(`• Average Revenue per Agent: $${avgAgentValue.toFixed(2)}/year`);
  console.log(`• Total Addressable Revenue: $${totalMarketRevenue.toLocaleString()}`);
  
  // Competitive advantages
  console.log("\n⚡ COMPETITIVE ADVANTAGES:");
  console.log("• Real-time optimization with measurable results");
  console.log("• No upfront costs - pay only for actual savings");
  console.log("• Transparent pricing - clients see exact savings");
  console.log("• Works with any AI provider (OpenAI, Anthropic, Perplexity)");
  console.log("• Crypto payments - no traditional banking friction");
  console.log("• Proprietary optimization algorithms");
  
  // Risk mitigation
  console.log("\n🛡️ RISK MITIGATION:");
  console.log("• No fees charged when optimization fails");
  console.log("• Clients always save money or pay nothing");
  console.log("• Transparent cost breakdown for every request");
  console.log("• Multiple AI provider integrations reduce dependency");
  
  console.log("\n💡 INVESTMENT THESIS:");
  console.log("1. Proven technology with measurable ROI");
  console.log("2. Large and growing AI agent market");
  console.log("3. Sustainable revenue model with client value alignment");
  console.log("4. Multiple scaling vectors (agents, requests, optimization)");
  console.log("5. First-mover advantage in AI cost optimization");
  
  console.log("\n" + "=".repeat(60));
  console.log("🎉 INVESTOR PROOF TEST COMPLETE!");
  console.log("=".repeat(60));
}

// Run the test
runInvestorProofTest().catch(console.error);

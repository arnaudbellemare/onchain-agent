import { initializeAgentKit } from "@/lib/agentkit";

export async function POST(req: Request) {
  try {
    const { messages } = await req.json();
    
    // Get the last message from the user
    const lastMessage = messages[messages.length - 1];
    const userMessage = lastMessage.content.toLowerCase();
    
    // Initialize AgentKit
    const { agentKit, success, error } = await initializeAgentKit();
    
    if (!success || !agentKit) {
      return Response.json({
        message: `❌ Failed to initialize wallet connection: ${error}`,
        success: false
      });
    }

    let response = "";
    
    // Handle different wallet operations based on user input
    if (userMessage.includes("balance") || userMessage.includes("check balance")) {
      response = `💰 **Wallet Balance Check:**\n\n✅ AgentKit is connected and ready!\n\n🔧 **Status:** AgentKit is initialized with your CDP API keys\n🌐 **Network:** ${process.env.NETWORK_ID || "base-sepolia"}\n🔑 **API Keys:** Configured and working\n\n📋 **Next Steps:**\n1. Implement balance checking with AgentKit API\n2. Connect to your wallet\n3. Retrieve actual balance\n\n💡 **Ready for:** Real balance checking once API methods are implemented!`;
    } 
    else if (userMessage.includes("send") && userMessage.includes("token")) {
      response = `📤 **Send Tokens Feature:**\n\n✅ AgentKit is ready for token transfers!\n\n🔧 **Status:** AgentKit is initialized and connected\n🌐 **Network:** ${process.env.NETWORK_ID || "base-sepolia"}\n\n📋 **To send tokens, provide:**\n1. Recipient address\n2. Amount to send\n3. Token type (ETH, USDC, etc.)\n\n💡 **Example:** "Send 0.1 ETH to 0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6"\n\n🚀 **Ready for:** Real token transfers once API methods are implemented!`;
    }
    else if (userMessage.includes("contract") || userMessage.includes("smart contract")) {
      response = `🔗 **Smart Contract Interaction:**\n\n✅ AgentKit is ready for contract interactions!\n\n🔧 **Status:** AgentKit is initialized and connected\n🌐 **Network:** ${process.env.NETWORK_ID || "base-sepolia"}\n\n📋 **To interact with contracts, provide:**\n1. Contract address\n2. Function to call\n3. Parameters\n\n💡 **Example:** "Call function 'transfer' on contract 0x... with parameters..."\n\n🚀 **Ready for:** Real smart contract calls once API methods are implemented!`;
    }
    else if (userMessage.includes("defi") || userMessage.includes("swap") || userMessage.includes("liquidity")) {
      response = `🔄 **DeFi Operations:**\n\n✅ AgentKit is ready for DeFi operations!\n\n🔧 **Status:** AgentKit is initialized and connected\n🌐 **Network:** ${process.env.NETWORK_ID || "base-sepolia"}\n\n📋 **Available DeFi operations:**\n- Token swaps\n- Adding/removing liquidity\n- Staking\n- Yield farming\n\n💡 **What DeFi operation would you like to perform?**\n\n🚀 **Ready for:** Real DeFi transactions once API methods are implemented!`;
    }
    else if (userMessage.includes("wallet") || userMessage.includes("address")) {
      response = `🏦 **Wallet Information:**\n\n✅ AgentKit is connected and ready!\n\n🔧 **Configuration:**\n- CDP API Key: ${process.env.CDP_API_KEY_NAME ? "✅ Configured" : "❌ Missing"}\n- Network: ${process.env.NETWORK_ID || "base-sepolia"}\n- AgentKit Status: ✅ Initialized\n\n📋 **Next Steps:**\n1. Implement wallet address retrieval with AgentKit API\n2. Connect to your wallet\n3. Display actual wallet address\n\n🚀 **Ready for:** Real wallet address retrieval once API methods are implemented!`;
    }
    else {
      response = `🤖 **Onchain AI Assistant Ready!**\n\n✅ **AgentKit Status:** Connected and initialized\n🌐 **Network:** ${process.env.NETWORK_ID || "base-sepolia"}\n🔑 **API Keys:** Configured\n\nI can help you with:\n\n💰 **Check Balance** - "Check my balance"\n📤 **Send Tokens** - "Send 0.1 ETH to [address]"\n🔗 **Smart Contracts** - "Interact with contract [address]"\n🔄 **DeFi Operations** - "Swap tokens" or "Add liquidity"\n🏦 **Wallet Info** - "Show my wallet address"\n\nWhat would you like to do?`;
    }

    return Response.json({ 
      message: response,
      success: true 
    });
  } catch (error) {
    console.error("Error in chat API:", error);
    return Response.json(
      { 
        error: "Failed to process request",
        details: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 500 }
    );
  }
}

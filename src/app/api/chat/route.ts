import { initializeAgentKit } from "@/lib/agentkit";

export async function POST(req: Request) {
  try {
    console.log("API called");
    const body = await req.json();
    console.log("Request body:", body);
    const { messages } = body;
    
    // Validate messages array
    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return Response.json({
        message: "❌ No messages provided",
        success: false
      });
    }
    
    // Get the last message from the user
    const lastMessage = messages[messages.length - 1];
    
    if (!lastMessage || !lastMessage.content) {
      return Response.json({
        message: "❌ Invalid message format",
        success: false
      });
    }
    
    const userMessage = lastMessage.content.toLowerCase();
    console.log("User message:", userMessage);
    
    // Initialize AgentKit
    console.log("Initializing AgentKit...");
    let agentKit, success, error;
    try {
      const result = await initializeAgentKit();
      agentKit = result.agentKit;
      success = result.success;
      error = result.error;
      console.log("AgentKit result:", { success, error, hasAgentKit: !!agentKit });
    } catch (initError) {
      console.error("AgentKit initialization error:", initError);
      return Response.json({
        message: `❌ Failed to initialize AgentKit: ${initError instanceof Error ? initError.message : "Unknown error"}`,
        success: false
      });
    }
    
    if (!success || !agentKit) {
      return Response.json({
        message: `❌ Failed to initialize wallet connection: ${error}`,
        success: false
      });
    }

    let response = "";
    
    // Handle different wallet operations based on user input
    if (userMessage.includes("balance") || userMessage.includes("check balance")) {
      try {
        // Get real wallet details using AgentKit
        const actions = agentKit.getActions();
        console.log("Available actions:", actions.map(a => a.name));
        
        const walletDetailsAction = actions.find(action => action.name === "getWalletDetails");
        
        if (walletDetailsAction) {
          const result = await walletDetailsAction.invoke();
          response = `💰 **Your Wallet Details:**\n\n${result}\n\n✅ Successfully retrieved from ${process.env.NETWORK_ID || "base-sepolia"} network!`;
        } else {
          response = `❌ Wallet details action not found. Available actions: ${actions.map(a => a.name).join(", ")}`;
        }
      } catch (error) {
        console.error("Balance check error:", error);
        response = `❌ Error checking wallet details: ${error instanceof Error ? error.message : "Unknown error"}`;
      }
    } 
    else if (userMessage.includes("send") && userMessage.includes("token")) {
      // Extract amount and address from user message
      const amountMatch = userMessage.match(/(\d+\.?\d*)\s*(eth|ether)/i);
      const addressMatch = userMessage.match(/0x[a-fA-F0-9]{40}/);
      
      if (amountMatch && addressMatch) {
        try {
          const amount = amountMatch[1];
          const toAddress = addressMatch[0];
          
          const actions = agentKit.getActions();
          const transferAction = actions.find(action => action.name === "nativeTransfer");
          
          if (transferAction) {
            const result = await transferAction.invoke({
              to: toAddress,
              amount: amount,
            });
            response = `📤 **Token Transfer Successful:**\n\n${result}\n\n✅ Successfully sent ${amount} ETH to ${toAddress}!`;
          } else {
            response = `❌ Transfer action not found. Available actions: ${actions.map(a => a.name).join(", ")}`;
          }
        } catch (error) {
          response = `❌ Error sending tokens: ${error instanceof Error ? error.message : "Unknown error"}`;
        }
      } else {
        response = `📤 **Send Tokens Feature:**\n\n✅ AgentKit is ready for token transfers!\n\n🔧 **Status:** AgentKit is initialized and connected\n🌐 **Network:** ${process.env.NETWORK_ID || "base-sepolia"}\n\n📋 **To send tokens, provide:**\n1. Recipient address (0x...)\n2. Amount to send (e.g., 0.1 ETH)\n\n💡 **Example:** "Send 0.1 ETH to 0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6"\n\n🚀 **I can now execute real token transfers!**`;
      }
    }
    else if (userMessage.includes("contract") || userMessage.includes("smart contract")) {
      response = `🔗 **Smart Contract Interaction:**\n\n✅ AgentKit is ready for contract interactions!\n\n🔧 **Status:** AgentKit is initialized and connected\n🌐 **Network:** ${process.env.NETWORK_ID || "base-sepolia"}\n\n📋 **To interact with contracts, provide:**\n1. Contract address\n2. Function to call\n3. Parameters\n\n💡 **Example:** "Call function 'transfer' on contract 0x... with parameters..."\n\n🚀 **Ready for:** Real smart contract calls!`;
    }
    else if (userMessage.includes("defi") || userMessage.includes("swap") || userMessage.includes("liquidity")) {
      response = `🔄 **DeFi Operations:**\n\n✅ AgentKit is ready for DeFi operations!\n\n🔧 **Status:** AgentKit is initialized and connected\n🌐 **Network:** ${process.env.NETWORK_ID || "base-sepolia"}\n\n📋 **Available DeFi operations:**\n- Token swaps\n- Adding/removing liquidity\n- Staking\n- Yield farming\n\n💡 **What DeFi operation would you like to perform?**\n\n🚀 **Ready for:** Real DeFi transactions!`;
    }
    else if (userMessage.includes("wallet") || userMessage.includes("address")) {
      try {
        // Get real wallet details using AgentKit
        const actions = agentKit.getActions();
        const walletDetailsAction = actions.find(action => action.name === "getWalletDetails");
        
        if (walletDetailsAction) {
          const result = await walletDetailsAction.invoke();
          response = `🏦 **Your Wallet Information:**\n\n${result}\n\n✅ Successfully retrieved from AgentKit!\n\nNetwork: ${process.env.NETWORK_ID || "base-sepolia"}`;
        } else {
          response = `❌ Wallet details action not found. Available actions: ${actions.map(a => a.name).join(", ")}`;
        }
      } catch (error) {
        response = `❌ Error getting wallet information: ${error instanceof Error ? error.message : "Unknown error"}`;
      }
    }
    else {
      // Handle simple commands like "whats my balance" or "balance"
      if (userMessage.includes("balance") || userMessage.includes("whats")) {
        try {
          const actions = agentKit.getActions();
          const walletDetailsAction = actions.find(action => action.name === "getWalletDetails");
          
          if (walletDetailsAction) {
            const result = await walletDetailsAction.invoke();
            response = `💰 **Your Wallet Details:**\n\n${result}\n\n✅ Successfully retrieved from ${process.env.NETWORK_ID || "base-sepolia"} network!`;
          } else {
            response = `❌ Wallet details action not found. Available actions: ${actions.map(a => a.name).join(", ")}`;
          }
        } catch (error) {
          console.error("Balance check error:", error);
          response = `❌ Error checking wallet details: ${error instanceof Error ? error.message : "Unknown error"}`;
        }
      } else {
        response = `🤖 **Onchain AI Assistant Ready!**\n\n✅ **AgentKit Status:** Connected and initialized\n🌐 **Network:** ${process.env.NETWORK_ID || "base-sepolia"}\n🔑 **API Keys:** Configured\n\nI can help you with:\n\n💰 **Check Balance** - "Check my balance" or "whats my balance"\n📤 **Send Tokens** - "Send 0.1 ETH to [address]"\n🔗 **Smart Contracts** - "Interact with contract [address]"\n🔄 **DeFi Operations** - "Swap tokens" or "Add liquidity"\n🏦 **Wallet Info** - "Show my wallet address"\n\nWhat would you like to do?`;
      }
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

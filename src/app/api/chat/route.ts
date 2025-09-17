import { generateText } from "ai";
import { initializeAgentKit } from "@/lib/agentkit";

export async function POST(req: Request) {
  try {
    const { messages } = await req.json();
    
    // Initialize AgentKit with Perplexity
    const { tools, model } = await initializeAgentKit();
    
    // Get the last message from the user
    const lastMessage = messages[messages.length - 1];
    
    const { text } = await generateText({
      model,
      system: `You are an onchain AI assistant with access to a crypto wallet. 
      You can help users with blockchain operations, check balances, send transactions, and interact with smart contracts.
      Always be helpful and explain what you're doing with the wallet.`,
      prompt: lastMessage.content,
      tools,
      maxSteps: 10,
    });

    return Response.json({ 
      message: text,
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

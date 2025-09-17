export async function POST(req: Request) {
  try {
    const { messages } = await req.json();
    
    // Get the last message from the user
    const lastMessage = messages[messages.length - 1];
    
    // Simple response for now - we'll add AI integration later
    const response = `Hello! I'm your onchain AI assistant. You asked: "${lastMessage.content}"
    
    I'm currently being set up with wallet functionality. Soon I'll be able to:
    - Check your wallet balance
    - Send tokens
    - Interact with smart contracts
    - Help with DeFi operations
    
    For now, I can provide information about blockchain operations. What would you like to know?`;

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
// Force fresh deployment

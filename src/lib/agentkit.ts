import { AgentKit } from "@coinbase/agentkit";

// Initialize AgentKit with real functionality
export async function initializeAgentKit() {
  try {
    // Check if environment variables are configured
    const hasApiKey = !!process.env.CDP_API_KEY_NAME;
    const hasPrivateKey = !!process.env.CDP_API_KEY_PRIVATE_KEY;
    
    if (!hasApiKey || !hasPrivateKey) {
      return {
        agentKit: null,
        success: false,
        error: "Missing CDP API credentials",
      };
    }

    // Initialize real AgentKit with CDP configuration
    const agentKit = await AgentKit.from({
      cdpApiKeyId: process.env.CDP_API_KEY_NAME!,
      cdpApiKeySecret: process.env.CDP_API_KEY_PRIVATE_KEY!,
    });

    return {
      agentKit,
      success: true,
    };
  } catch (error) {
    console.error("Failed to initialize AgentKit:", error);
    return {
      agentKit: null,
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

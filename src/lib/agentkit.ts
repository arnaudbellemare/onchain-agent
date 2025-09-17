import { getVercelAITools } from "@coinbase/agentkit-vercel-ai-sdk";
import { AgentKit } from "@coinbase/agentkit";
import { perplexity } from "@ai-sdk/perplexity";

// Initialize AgentKit
export async function initializeAgentKit() {
  const agentKit = await AgentKit.from({
    cdpApiKeyName: process.env.CDP_API_KEY_NAME!,
    cdpApiKeyPrivateKey: process.env.CDP_API_KEY_PRIVATE_KEY!,
    networkId: process.env.NETWORK_ID || "base-sepolia",
  });

  // Get tools for Vercel AI SDK
  const tools = await getVercelAITools(agentKit);

  return {
    agentKit,
    tools,
    model: perplexity("llama-3.1-sonar-small-128k-online"), // Using Perplexity model
  };
}

export const config = {
  onchainAgentUrl: process.env.ONCHAIN_AGENT_URL || 'http://localhost:3000',
  perplexityApiKey: process.env.PERPLEXITY_API_KEY,
  x402PrivateKey: process.env.X402_PRIVATE_KEY,
  baseRpcUrl: process.env.BASE_RPC_URL || 'https://mainnet.base.org',
  baseChainId: process.env.BASE_CHAIN_ID || '8453',
};

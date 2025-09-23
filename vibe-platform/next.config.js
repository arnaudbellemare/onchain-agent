/** @type {import('next').NextConfig} */
const nextConfig = {
  // App directory is now stable in Next.js 14
  env: {
    ONCHAIN_AGENT_URL: process.env.ONCHAIN_AGENT_URL || 'http://localhost:3000',
    PERPLEXITY_API_KEY: process.env.PERPLEXITY_API_KEY,
    GOOGLE_AI_STUDIO_API_KEY: process.env.GOOGLE_AI_STUDIO_API_KEY,
    X402_PRIVATE_KEY: process.env.X402_PRIVATE_KEY,
  },
  async rewrites() {
    return [
      {
        source: '/api/onchain/:path*',
        destination: 'http://localhost:3000/api/:path*',
      },
    ];
  },
};

module.exports = nextConfig;

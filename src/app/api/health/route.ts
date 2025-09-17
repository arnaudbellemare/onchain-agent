export async function GET() {
  try {
    return Response.json({
      status: "healthy",
      timestamp: new Date().toISOString(),
      env: {
        hasApiKey: !!process.env.CDP_API_KEY_NAME,
        hasPrivateKey: !!process.env.CDP_API_KEY_PRIVATE_KEY,
        networkId: process.env.NETWORK_ID || "base-sepolia"
      }
    });
  } catch (error) {
    return Response.json({
      status: "error",
      error: error instanceof Error ? error.message : "Unknown error"
    }, { status: 500 });
  }
}
